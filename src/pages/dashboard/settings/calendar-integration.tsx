import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface CalendarIntegrationProps {
  user: User | null;
}

export default function CalendarIntegration({ user }: CalendarIntegrationProps) {
  const [loading, setLoading] = useState(false);
  const [calendarSettings, setCalendarSettings] = useState({
    provider: 'none',
    google_calendar_connected: false,
    outlook_calendar_connected: false,
    calendly_connected: false,
    calendly_url: '',
    sync_two_way: true,
  });

  useEffect(() => {
    if (user) {
      fetchCalendarSettings();
    }
  }, [user]);

  const fetchCalendarSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('professional_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCalendarSettings({
          provider: data.provider || 'none',
          google_calendar_connected: data.google_calendar_connected || false,
          outlook_calendar_connected: data.outlook_calendar_connected || false,
          calendly_connected: data.calendly_connected || false,
          calendly_url: data.calendly_url || '',
          sync_two_way: data.sync_two_way || true,
        });
      }
    } catch (error) {
      console.error('Error fetching calendar settings:', error);
      toast.error('Erreur lors du chargement des paramètres de calendrier');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setCalendarSettings({ ...calendarSettings, [name]: target.checked });
    } else {
      setCalendarSettings({ ...calendarSettings, [name]: value });
    }
  };

  const connectGoogleCalendar = () => {
    // In a real implementation, this would redirect to Google OAuth
    toast.success('Cette fonctionnalité sera disponible prochainement');
  };

  const connectOutlookCalendar = () => {
    // In a real implementation, this would redirect to Microsoft OAuth
    toast.success('Cette fonctionnalité sera disponible prochainement');
  };

  const disconnectCalendar = async (provider: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter ${provider}?`)) {
      return;
    }

    setLoading(true);
    try {
      // Update the settings based on the provider
      let updateData = {};
      
      switch (provider) {
        case 'google':
          updateData = { google_calendar_connected: false };
          if (calendarSettings.provider === 'google') {
            updateData = { ...updateData, provider: 'none' };
          }
          break;
        case 'outlook':
          updateData = { outlook_calendar_connected: false };
          if (calendarSettings.provider === 'outlook') {
            updateData = { ...updateData, provider: 'none' };
          }
          break;
        case 'calendly':
          updateData = { calendly_connected: false, calendly_url: '' };
          if (calendarSettings.provider === 'calendly') {
            updateData = { ...updateData, provider: 'none' };
          }
          break;
      }
      
      // Check if record exists
      const { data: existingData, error: checkError } = await supabase
        .from('calendar_integrations')
        .select('id')
        .eq('professional_id', user?.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('calendar_integrations')
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingData.id);
          
        if (error) throw error;
      }
      
      // Update local state
      setCalendarSettings({
        ...calendarSettings,
        ...updateData as any,
      });
      
      toast.success(`${provider} déconnecté avec succès`);
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      toast.error(`Erreur lors de la déconnexion de ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if record exists
      const { data: existingData, error: checkError } = await supabase
        .from('calendar_integrations')
        .select('id')
        .eq('professional_id', user?.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('calendar_integrations')
          .update({
            provider: calendarSettings.provider,
            calendly_url: calendarSettings.calendly_url,
            sync_two_way: calendarSettings.sync_two_way,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingData.id);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('calendar_integrations')
          .insert([
            {
              professional_id: user?.id,
              provider: calendarSettings.provider,
              google_calendar_connected: calendarSettings.google_calendar_connected,
              outlook_calendar_connected: calendarSettings.outlook_calendar_connected,
              calendly_connected: calendarSettings.calendly_connected,
              calendly_url: calendarSettings.calendly_url,
              sync_two_way: calendarSettings.sync_two_way,
            },
          ]);
          
        if (error) throw error;
      }
      
      toast.success('Paramètres de calendrier enregistrés avec succès');
    } catch (error) {
      console.error('Error saving calendar settings:', error);
      toast.error('Erreur lors de l\'enregistrement des paramètres de calendrier');
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
        <title>Intégration Calendrier | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Intégration Calendrier</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-secondary-900">Connectez votre calendrier</h2>
                  <p className="mt-1 text-sm text-secondary-500">
                    Synchronisez vos rendez-vous avec votre calendrier préféré pour gérer facilement vos disponibilités.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="provider" className="block text-sm font-medium text-secondary-700">
                      Fournisseur de calendrier principal
                    </label>
                    <select
                      id="provider"
                      name="provider"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={calendarSettings.provider}
                      onChange={handleInputChange}
                    >
                      <option value="none">Aucun (utiliser l'agenda interne)</option>
                      <option value="google" disabled={!calendarSettings.google_calendar_connected}>
                        Google Calendar {!calendarSettings.google_calendar_connected && '(non connecté)'}
                      </option>
                      <option value="outlook" disabled={!calendarSettings.outlook_calendar_connected}>
                        Outlook Calendar {!calendarSettings.outlook_calendar_connected && '(non connecté)'}
                      </option>
                      <option value="calendly" disabled={!calendarSettings.calendly_connected}>
                        Calendly {!calendarSettings.calendly_connected && '(non connecté)'}
                      </option>
                    </select>
                    <p className="mt-2 text-sm text-secondary-500">
                      Sélectionnez le calendrier principal à utiliser pour la synchronisation des rendez-vous.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
                    {/* Google Calendar */}
                    <div className="bg-secondary-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-secondary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.5 22.5H4.5C3.12 22.5 2 21.38 2 20V6C2 4.62 3.12 3.5 4.5 3.5H19.5C20.88 3.5 22 4.62 22 6V20C22 21.38 20.88 22.5 19.5 22.5ZM4.5 5.5C4.22 5.5 4 5.72 4 6V20C4 20.28 4.22 20.5 4.5 20.5H19.5C19.78 20.5 20 20.28 20 20V6C20 5.72 19.78 5.5 19.5 5.5H4.5Z" />
                              <path d="M12 15C10.62 15 9.5 13.88 9.5 12.5C9.5 11.12 10.62 10 12 10C13.38 10 14.5 11.12 14.5 12.5C14.5 13.88 13.38 15 12 15ZM12 12C11.72 12 11.5 12.22 11.5 12.5C11.5 12.78 11.72 13 12 13C12.28 13 12.5 12.78 12.5 12.5C12.5 12.22 12.28 12 12 12Z" />
                              <path d="M8 9.5H6V7.5H8V9.5Z" />
                              <path d="M8 13.5H6V11.5H8V13.5Z" />
                              <path d="M8 17.5H6V15.5H8V17.5Z" />
                              <path d="M18 9.5H16V7.5H18V9.5Z" />
                              <path d="M18 13.5H16V11.5H18V13.5Z" />
                              <path d="M18 17.5H16V15.5H18V17.5Z" />
                              <path d="M13 9.5H11V7.5H13V9.5Z" />
                              <path d="M13 17.5H11V15.5H13V17.5Z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-secondary-900">Google Calendar</h3>
                            <p className="text-xs text-secondary-500">
                              {calendarSettings.google_calendar_connected ? 'Connecté' : 'Non connecté'}
                            </p>
                          </div>
                        </div>
                        <div>
                          {calendarSettings.google_calendar_connected ? (
                            <button
                              type="button"
                              onClick={() => disconnectCalendar('google')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Déconnecter
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={connectGoogleCalendar}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Connecter
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Outlook Calendar */}
                    <div className="bg-secondary-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-secondary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.5 22.5H4.5C3.12 22.5 2 21.38 2 20V6C2 4.62 3.12 3.5 4.5 3.5H19.5C20.88 3.5 22 4.62 22 6V20C22 21.38 20.88 22.5 19.5 22.5ZM4.5 5.5C4.22 5.5 4 5.72 4 6V20C4 20.28 4.22 20.5 4.5 20.5H19.5C19.78 20.5 20 20.28 20 20V6C20 5.72 19.78 5.5 19.5 5.5H4.5Z" />
                              <path d="M12 15C10.62 15 9.5 13.88 9.5 12.5C9.5 11.12 10.62 10 12 10C13.38 10 14.5 11.12 14.5 12.5C14.5 13.88 13.38 15 12 15ZM12 12C11.72 12 11.5 12.22 11.5 12.5C11.5 12.78 11.72 13 12 13C12.28 13 12.5 12.78 12.5 12.5C12.5 12.22 12.28 12 12 12Z" />
                              <path d="M8 9.5H6V7.5H8V9.5Z" />
                              <path d="M8 13.5H6V11.5H8V13.5Z" />
                              <path d="M8 17.5H6V15.5H8V17.5Z" />
                              <path d="M18 9.5H16V7.5H18V9.5Z" />
                              <path d="M18 13.5H16V11.5H18V13.5Z" />
                              <path d="M18 17.5H16V15.5H18V17.5Z" />
                              <path d="M13 9.5H11V7.5H13V9.5Z" />
                              <path d="M13 17.5H11V15.5H13V17.5Z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-secondary-900">Outlook Calendar</h3>
                            <p className="text-xs text-secondary-500">
                              {calendarSettings.outlook_calendar_connected ? 'Connecté' : 'Non connecté'}
                            </p>
                          </div>
                        </div>
                        <div>
                          {calendarSettings.outlook_calendar_connected ? (
                            <button
                              type="button"
                              onClick={() => disconnectCalendar('outlook')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Déconnecter
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={connectOutlookCalendar}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Connecter
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Calendly */}
                    <div className="bg-secondary-50 p-4 rounded-lg sm:col-span-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-secondary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.5 22.5H4.5C3.12 22.5 2 21.38 2 20V6C2 4.62 3.12 3.5 4.5 3.5H19.5C20.88 3.5 22 4.62 22 6V20C22 21.38 20.88 22.5 19.5 22.5ZM4.5 5.5C4.22 5.5 4 5.72 4 6V20C4 20.28 4.22 20.5 4.5 20.5H19.5C19.78 20.5 20 20.28 20 20V6C20 5.72 19.78 5.5 19.5 5.5H4.5Z" />
                              <path d="M12 15C10.62 15 9.5 13.88 9.5 12.5C9.5 11.12 10.62 10 12 10C13.38 10 14.5 11.12 14.5 12.5C14.5 13.88 13.38 15 12 15ZM12 12C11.72 12 11.5 12.22 11.5 12.5C11.5 12.78 11.72 13 12 13C12.28 13 12.5 12.78 12.5 12.5C12.5 12.22 12.28 12 12 12Z" />
                              <path d="M8 9.5H6V7.5H8V9.5Z" />
                              <path d="M8 13.5H6V11.5H8V13.5Z" />
                              <path d="M8 17.5H6V15.5H8V17.5Z" />
                              <path d="M18 9.5H16V7.5H18V9.5Z" />
                              <path d="M18 13.5H16V11.5H18V13.5Z" />
                              <path d="M18 17.5H16V15.5H18V17.5Z" />
                              <path d="M13 9.5H11V7.5H13V9.5Z" />
                              <path d="M13 17.5H11V15.5H13V17.5Z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-secondary-900">Calendly</h3>
                            <p className="text-xs text-secondary-500">
                              {calendarSettings.calendly_connected ? 'Connecté' : 'Non connecté'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-0 w-full sm:w-auto">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <input
                              type="text"
                              name="calendly_url"
                              id="calendly_url"
                              placeholder="Votre URL Calendly"
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                              value={calendarSettings.calendly_url}
                              onChange={handleInputChange}
                            />
                            {calendarSettings.calendly_connected ? (
                              <button
                                type="button"
                                onClick={() => disconnectCalendar('calendly')}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Déconnecter
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (calendarSettings.calendly_url) {
                                    setCalendarSettings({
                                      ...calendarSettings,
                                      calendly_connected: true,
                                    });
                                    toast.success('Calendly connecté avec succès');
                                  } else {
                                    toast.error('Veuillez entrer votre URL Calendly');
                                  }
                                }}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                Connecter
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="sync_two_way"
                          name="sync_two_way"
                          type="checkbox"
                          checked={calendarSettings.sync_two_way}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="sync_two_way" className="font-medium text-secondary-700">
                          Synchronisation bidirectionnelle
                        </label>
                        <p className="text-secondary-500">
                          Activez cette option pour synchroniser les rendez-vous dans les deux sens (de votre calendrier vers l'application et vice versa).
                        </p>
                      </div>
                    </div>
                  </div>
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
