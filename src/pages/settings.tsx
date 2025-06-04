import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { toast } from 'react-hot-toast';
import { Tab } from '@headlessui/react';

export default function Settings() {
  const { user, loading: userLoading } = useUser();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Ceci est un message de test de WhatsApp Business API.');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('professional_settings')
          .select('*')
          .eq('professional_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setSettings(data);
        } else {
          // Create default settings if none exist
          const { data: newSettings, error: createError } = await supabase
            .from('professional_settings')
            .insert([
              {
                professional_id: user.id,
                auto_reply_enabled: true,
                voice_enabled: true,
                reminder_enabled: true,
                reminder_hours_before: 24,
                welcome_message: 'Bonjour et merci de me contacter! Comment puis-je vous aider aujourd\'hui?',
                language: 'fr',
              },
            ])
            .select()
            .single();
          
          if (createError) throw createError;
          setSettings(newSettings);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        toast.error('Erreur lors du chargement des paramètres');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user || !settings) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('professional_settings')
        .update({
          auto_reply_enabled: settings.auto_reply_enabled,
          voice_enabled: settings.voice_enabled,
          reminder_enabled: settings.reminder_enabled,
          reminder_hours_before: settings.reminder_hours_before,
          welcome_message: settings.welcome_message,
          language: settings.language,
        })
        .eq('professional_id', user.id);
      
      if (error) throw error;
      
      toast.success('Paramètres enregistrés');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!user || !testNumber || !testMessage) return;
    
    try {
      setSendingTest(true);
      
      const response = await fetch('/api/test/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          to: testNumber,
          message: testMessage,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test message');
      }
      
      toast.success('Message de test envoyé');
    } catch (err) {
      console.error('Error sending test message:', err);
      toast.error('Erreur lors de l\'envoi du message de test');
    } finally {
      setSendingTest(false);
    }
  };

  if (userLoading || loading) {
    return (
      <Layout>
        <div className="p-8 text-center">Chargement...</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="p-8 text-center">Veuillez vous connecter pour accéder à cette page.</div>
      </Layout>
    );
  }

  if (!settings) {
    return (
      <Layout>
        <div className="p-8 text-center">Erreur lors du chargement des paramètres</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        
        <div className="bg-white rounded-lg shadow">
          <Tab.Group>
            <Tab.List className="flex border-b">
              <Tab className={({ selected }) => `
                px-4 py-2 text-sm font-medium
                ${selected ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}
              `}>
                Général
              </Tab>
              <Tab className={({ selected }) => `
                px-4 py-2 text-sm font-medium
                ${selected ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}
              `}>
                WhatsApp
              </Tab>
              <Tab className={({ selected }) => `
                px-4 py-2 text-sm font-medium
                ${selected ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}
              `}>
                Notifications
              </Tab>
            </Tab.List>
            
            <Tab.Panels className="p-6">
              {/* General Settings */}
              <Tab.Panel>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Langue</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="fr">Français</option>
                      <option value="en">Anglais</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="auto_reply_enabled"
                      checked={settings.auto_reply_enabled}
                      onChange={(e) => setSettings({ ...settings, auto_reply_enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="auto_reply_enabled" className="ml-2 block text-sm text-gray-700">
                      Activer les réponses automatiques
                    </label>
                  </div>
                </div>
              </Tab.Panel>
              
              {/* WhatsApp Settings */}
              <Tab.Panel>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message de bienvenue</label>
                    <textarea
                      value={settings.welcome_message}
                      onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="voice_enabled"
                      checked={settings.voice_enabled}
                      onChange={(e) => setSettings({ ...settings, voice_enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="voice_enabled" className="ml-2 block text-sm text-gray-700">
                      Activer la transcription des messages vocaux
                    </label>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Tester WhatsApp</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
                        <input
                          type="text"
                          value={testNumber}
                          onChange={(e) => setTestNumber(e.target.value)}
                          placeholder="+33612345678"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                          value={testMessage}
                          onChange={(e) => setTestMessage(e.target.value)}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <button
                        onClick={handleTestWhatsApp}
                        disabled={sendingTest || !testNumber || !testMessage}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {sendingTest ? 'Envoi...' : 'Envoyer un message de test'}
                      </button>
                    </div>
                  </div>
                </div>
              </Tab.Panel>
              
              {/* Notification Settings */}
              <Tab.Panel>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="reminder_enabled"
                      checked={settings.reminder_enabled}
                      onChange={(e) => setSettings({ ...settings, reminder_enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="reminder_enabled" className="ml-2 block text-sm text-gray-700">
                      Activer les rappels de rendez-vous
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Envoyer le rappel combien d'heures avant le rendez-vous
                    </label>
                    <select
                      value={settings.reminder_hours_before}
                      onChange={(e) => setSettings({ ...settings, reminder_hours_before: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="1">1 heure</option>
                      <option value="2">2 heures</option>
                      <option value="3">3 heures</option>
                      <option value="6">6 heures</option>
                      <option value="12">12 heures</option>
                      <option value="24">24 heures</option>
                      <option value="48">48 heures</option>
                    </select>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
          
          <div className="px-6 py-4 border-t flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
