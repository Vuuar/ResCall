import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect to landing page
    // This avoids potential auth check issues that might be causing the error
    router.push('/landing');
  }, [router]);

  // Return a simple loading state without any auth checks
  return (
    <Layout title="Loading...">
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    </Layout>
  );
}
