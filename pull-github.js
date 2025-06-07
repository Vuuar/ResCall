const fsPromises = require('fs').promises;
const fs = require('fs'); // Regular fs for createWriteStream
const path = require('path');
const https = require('https');

const REPO_OWNER = 'Vuuar';
const REPO_NAME = 'ResCall';
const BRANCH = 'main';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;

// Function to make HTTPS requests with proper GitHub API headers
function httpsGet(url, isJson = true) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Node.js GitHub Content Fetcher',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }

      // For binary or non-JSON responses, return the response object directly
      if (!isJson) {
        return resolve(res);
      }

      // For JSON responses, collect and parse the data
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Function to download a file directly from a raw URL
async function downloadFileFromRawUrl(url, filePath) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Node.js GitHub Content Fetcher'
      }
    };

    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }

      // Using regular fs (not promises) for createWriteStream
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        // Delete the file if there's an error
        fs.unlink(filePath, () => {}); // Using callback version
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to download a file
async function downloadFile(item, filePath) {
  try {
    // Create directory if it doesn't exist
    await fsPromises.mkdir(path.dirname(filePath), { recursive: true });

    // Always use the raw download URL for all file types
    await downloadFileFromRawUrl(item.download_url, filePath);
    
    console.log(`Downloaded: ${filePath}`);
  } catch (error) {
    console.error(`Error downloading ${filePath}: ${error.message}`);
  }
}

// Function to process a directory
async function processDirectory(dirPath = '') {
  try {
    const url = `${API_BASE}${dirPath ? '/' + dirPath : ''}?ref=${BRANCH}`;
    const contents = await httpsGet(url);

    for (const item of contents) {
      const localPath = path.join(process.cwd(), item.path);
      
      if (item.type === 'dir') {
        await processDirectory(item.path);
      } else if (item.type === 'file') {
        await downloadFile(item, localPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}: ${error.message}`);
  }
}

// Main function
async function main() {
  console.log(`Starting download from ${REPO_OWNER}/${REPO_NAME}:${BRANCH}`);
  try {
    await processDirectory();
    console.log('Download completed successfully!');
  } catch (error) {
    console.error(`Failed to download repository: ${error.message}`);
  }
}

main();
