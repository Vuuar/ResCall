import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface VoiceSettingsProps {
  user: User | null;
}

export default function VoiceSettings({ user }: VoiceSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    welcome_message: '',
    use_tts: true,
    voice_type: 'female',
    custom_audio_url: '',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([]);

  useEffect(() => {
    if (user) {
      fetchVoiceSettings();
    }
  }, [user]);

  const fetchVoiceSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('voice_settings')
        .select('*')
        .eq('professional_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setVoiceSettings({
          welcome_message: data.welcome_message || '',
          use_tts: data.use_tts,
          voice_type: data.voice_type || 'female',
          custom_audio_url: data.custom_audio_url || '',
        });

        if (data.custom_audio_url) {
          setPreviewUrl(data.custom_audio_url);
        }
      }
    } catch (error) {
      console.error('Error fetching voice settings:', error);
      toast.error('Erreur lors du chargement des paramètres vocaux');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setVoiceSettings({ ...voiceSettings, [name]: target.checked });
    } else {
      setVoiceSettings({ ...voiceSettings, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast.error('Veuillez sélectionner un fichier audio valide');
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        
        // Create a File from the Blob
        const file = new File([blob], 'recorded-message.webm', { type: 'audio/webm' });
        setAudioFile(file);
        setRecordedChunks([]);
      };
      
      setAudioRecorder(recorder);
      setRecordedChunks(chunks);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Impossible d\'accéder au microphone');
    }
  };

  const stopRecording = () => {
    if (audioRecorder && audioRecorder.state !== 'inactive') {
      audioRecorder.stop();
      setIsRecording(false);
      
      // Stop all tracks on the stream
      audioRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const uploadAudio = async () => {
    if (!audioFile) return null;
    
    try {
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${user?.id}-welcome-message-${Date.now()}.${fileExt}`;
      const filePath = `audio/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(filePath, audioFile);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Erreur lors de l\'upload du fichier audio');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let audioUrl = voiceSettings.custom_audio_url;
      
      // If there's a new audio file, upload it
      if (audioFile && !voiceSettings.use_tts) {
        const uploadedUrl = await uploadAudio();
        if (uploadedUrl) {
          audioUrl = uploadedUrl;
        }
      }
      
      // Check if record exists
      const { data: existingData, error: checkError } = await supabase
        .from('voice_settings')
        .select('id')
        .eq('professional_id', user?.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('voice_settings')
          .update({
            welcome_message: voiceSettings.welcome_message,
            use_tts: voiceSettings.use_tts,
            voice_type: voiceSettings.voice_type,
            custom_audio_url: audioUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingData.id);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('voice_settings')
          .insert([
            {
              professional_id: user?.id,
              welcome_message: voiceSettings.welcome_message,
              use_tts: voiceSettings.use_tts,
              voice_type: voiceSettings.voice_type,
              custom_audio_url: audioUrl,
            },
          ]);
          
        if (error) throw error;
      }
      
      toast.success('Paramètres vocaux enregistrés avec succès');
      
      // Update local state with the new URL
      if (audioUrl !== voiceSettings.custom_audio_url) {
        setVoiceSettings({ ...voiceSettings, custom_audio_url: audioUrl });
      }
    } catch (error) {
      console.error('Error saving voice settings:', error);
      toast.error('Erreur lors de l\'enregistrement des paramètres vocaux');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <Head>
        <title>Paramètres vocaux | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Paramètres vocaux</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-secondary-900">Message d'accueil</h2>
                  <p className="mt-1 text-sm text-secondary-500">
                    Configurez le message que vos clients entendront lorsqu'ils vous contacteront.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="welcome_message" className="block text-sm font-medium text-secondary-700">
                      Message de bienvenue
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="welcome_message"
                        name="welcome_message"
                        rows={4}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                        placeholder="Bonjour, merci de nous contacter. Comment puis-je vous aider aujourd'hui ?"
                        value={voiceSettings.welcome_message}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="mt-2 text-sm text-secondary-500">
                      Ce message sera utilisé comme accueil pour vos clients.
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="use_tts"
                        name="use_tts"
                        type="checkbox"
                        checked={voiceSettings.use_tts}
                        onChange={handleInputChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="use_tts" className="font-medium text-secondary-700">
                        Utiliser la synthèse vocale (Text-to-Speech)
                      </label>
                      <p className="text-secondary-500">
                        Activez cette option pour convertir automatiquement votre message en voix.
                      </p>
                    </div>
                  </div>

                  {voiceSettings.use_tts && (
                    <div>
                      <label htmlFor="voice_type" className="block text-sm font-medium text-secondary-700">
                        Type de voix
                      </label>
                      <select
                        id="voice_type"
                        name="voice_type"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        value={voiceSettings.voice_type}
                        onChange={handleInputChange}
                      >
                        <option value="female">Femme</option>
                        <option value="male">Homme</option>
                      </select>
                    </div>
                  )}

                  {!voiceSettings.use_tts && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">
                        Message audio personnalisé
                      </label>
                      <div className="mt-1 flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            isRecording
                              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                              : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        >
                          {isRecording ? (
                            <>
                              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                              </svg>
                              Arrêter l'enregistrement
                            </>
                          ) : (
                            <>
                              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                              Enregistrer un message
                            </>
                          )}
                        </button>
                        <span className="text-sm text-secondary-500">ou</span>
                        <label
                          htmlFor="audio-upload"
                          className="inline-flex items-center px-4 py-2 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5 text-secondary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Importer un fichier audio
                        </label>
                        <input
                          id="audio-upload"
                          name="audio-upload"
                          type="file"
                          accept="audio/*"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </div>
                      {previewUrl && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-secondary-700 mb-2">Aperçu :</p>
                          <audio controls src={previewUrl} className="w-full">
                            Votre navigateur ne supporte pas l'élément audio.
                          </audio>
                        </div>
                      )}
                      <p className="mt-2 text-sm text-secondary-500">
                        Enregistrez ou importez un message audio personnalisé (formats MP3, WAV, OGG).
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-secondary-200">
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
