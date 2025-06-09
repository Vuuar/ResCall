import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface NotificationSettingsProps {
  user: User | null;
}

export default function NotificationSettings({ user }: NotificationSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email_new_appointment: true,
    email_appointment_reminder: true,
    email_appointment_cancelled: true,
    whatsapp_new_appointment: true,
    whatsapp_appointment_reminder: true,
    whatsapp_appointment_cancelled: true,
    sms_new_appointment: false,
    sms_appointment_reminder: false,
    sms_appointment_cancelled: false,
    reminder_time: '24',
  });

  useEffect(() => {
    if (user) {
      fetchNotificationSettings();
    }
  }, [user]);

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('professional_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setNotificationSettings({
          email_new_appointment: data.email_new_appointment,
          email_appointment_reminder: data.email_appointment_reminder,
          email_appointment_cancelled: data.email_appointment_cancelled,
          whatsapp_new_appointment: data.whatsapp_new_appointment,
          whatsapp_appointment_reminder: data.whatsapp_appointment_reminder,
          whatsapp_appointment_cancelled: data.whatsapp_appointment_cancelled,
          sms_new_appointment: data.sms_new_appointment || false,
          sms_appointment_reminder: data.sms_appointment_reminder || false,
          sms_appointment_cancelled: data.sms_appointment_cancelled || false,
          reminder_time: data.reminder_time || '24',
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast.error('Erreur lors du chargement des paramètres de notification');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setNotificationSettings({ ...notificationSettings, [name]: target.checked });
    } else {
      setNotificationSettings({ ...notificationSettings, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if record exists
      const { data: existingData, error: checkError } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('professional_id', user?.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('notification_settings')
          .update({
            email_new_appointment: notificationSettings.email_new_appointment,
            email_appointment_reminder: notificationSettings.email_appointment_reminder,
            email_appointment_cancelled: notificationSettings.email_appointment_cancelled,
            whatsapp_new_appointment: notificationSettings.whatsapp_new_appointment,
            whatsapp_appointment_reminder: notificationSettings.whatsapp_appointment_reminder,
            whatsapp_appointment_cancelled: notificationSettings.whatsapp_appointment_cancelled,
            sms_new_appointment: notificationSettings.sms_new_appointment,
            sms_appointment_reminder: notificationSettings.sms_appointment_reminder,
            sms_appointment_cancelled: notificationSettings.sms_appointment_cancelled,
            reminder_time: notificationSettings.reminder_time,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingData.id);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('notification_settings')
          .insert([
            {
              professional_id: user?.id,
              email_new_appointment: notificationSettings.email_new_appointment,
              email_appointment_reminder: notificationSettings.email_appointment_reminder,
              email_appointment_cancelled: notificationSettings.email_appointment_cancelled,
              whatsapp_new_appointment: notificationSettings.whatsapp_new_appointment,
              whatsapp_appointment_reminder: notificationSettings.whatsapp_appointment_reminder,
              whatsapp_appointment_cancelled: notificationSettings.whatsapp_appointment_cancelled,
              sms_new_appointment: notificationSettings.sms_new_appointment,
              sms_appointment_reminder: notificationSettings.sms_appointment_reminder,
              sms_appointment_cancelled: notificationSettings.sms_appointment_cancelled,
              reminder_time: notificationSettings.reminder_time,
            },
          ]);
          
        if (error) throw error;
      }
      
      toast.success('Paramètres de notification enregistrés avec succès');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Erreur lors de l\'enregistrement des paramètres de notification');
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
        <title>Paramètres de notification | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Paramètres de notification</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-secondary-900">Notifications par email</h2>
                  <p className="mt-1 text-sm text-secondary-500">
                    Configurez les notifications par email que vous souhaitez recevoir.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email_new_appointment"
                        name="email_new_appointment"
                        type="checkbox"
                        checked={notificationSettings.email_new_appointment}
                        onChange={handleInputChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email_new_appointment" className="font-medium text-secondary-700">
                        Nouveau rendez-vous
                      </label>
                      <p className="text-secondary-500">
                        Recevez un email lorsqu'un nouveau rendez-vous est pris.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email_appointment_reminder"
                        name="email_appointment_reminder"
                        type="checkbox"
                        checked={notificationSettings.email_appointment_reminder}
                        onChange={handleInputChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email_appointment_reminder" className="font-medium text-secondary-700">
                        Rappel de rendez-vous
                      </label>
                      <p className="text-secondary-500">
                        Recevez un email de rappel avant un rendez-vous.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email_appointment_cancelled"
                        name="email_appointment_cancelled"
                        type="checkbox"
                        checked={notificationSettings.email_appointment_cancelled}
                        onChange={handleInputChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email_appointment_cancelled" className="font-medium text-secondary-700">
                        Annulation de rendez-vous
                      </label>
                      <p className="text-secondary-500">
                        Recevez un email lorsqu'un rendez-vous est annulé.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-secondary-200">
                  <h2 className="text-lg font-medium text-secondary-900">Notifications WhatsApp</h2>
                  <p className="mt-1 text-sm text-secondary-500">
                    Configurez les notifications WhatsApp que vous souhaitez recevoir.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="whatsapp_new_appointment"
                        name="whatsapp_new_appointment"
                        type="checkbox"
                        checked={notificationSettings.whatsapp_new_appointment}
                        onChange={handleInputChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="whatsapp_new_appointment" className="font-medium text-secondary-700">
                        Nouveau rendez-vous
                      </label>
                      <p className="text-secondary-500">
                        Recevez un message WhatsApp lorsqu'un nouveau rendez-vous est pris.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="whatsapp_appointment_reminder"
                        name="whatsapp_appointment_reminder"
                        type="checkbox"
                        checked={notificationSettings.whatsapp_appointment_reminder}
                        onChange={handleInputChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="whatsapp_appointment_reminder" className="font-medium text-secondary-700">
                        Rappel de rendez-vous
                      </label>
                      <p className="text-secondary-500">
                        Recevez un message WhatsApp de rappel avant un rendez-vous.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="whatsapp_appointment_cancelled"
                        name="whatsapp_appointment_cancelled"
                        type="checkbox"
                        checked={notificationSettings.whatsapp_appointment_cancelled}
                        onChange={handleInputChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="whatsapp_appointment_cancelled" className="font-medium text-secondary-700">
                        Annulation de rendez-vous
                      </label>
                      <p className="text-secondary-500">
                        Recevez un message WhatsApp lorsqu'un rendez-vous est annulé.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-secondary-200">
                  <h2 className="text-lg font-medium text-secondary-900">Notifications SMS (optionnel)</h2>
                  <p className="mt-1 text-sm text-secondary-500">
                    Configurez les notifications SMS que vous souhaitez recevoir (des frais supplémentaires peuvent s'appliquer).
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="sms_new_appointment"
                        name="sms_new_appointment"
                        type="checkbox"
                        checked={notificationSettings.sms_new_appointment}
                        onChange={handleInputChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="sms_new_appointment" className="font-medium text-secondary-700">
                        Nouveau rendez-vous
                      </label>
                      <p className="text-secondary-500">
                        Recevez un SMS lorsqu'un nouveau rendez-vous est pris.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="sms_appointment_reminder"
                        name="sms_appointment_reminder"
                        type="checkbox"
                        checked={notificationSettings.sms_appointment_reminder}
                        onChange={handleInputChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="sms_appointment_reminder" className="font-medium text-secondary-700">
                        Rappel de rendez-vous
                      </label>
                      <p className="text-secondary-500">
                        Recevez un SMS de rappel avant un rendez-vous.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="sms_appointment_cancelled"
                        name="sms_appointment_cancelled"
                        type="checkbox"
                        checked={notificationSettings.sms_appointment_cancelled}
                        onChange={handleInputChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="sms_appointment_cancelled" className="font-medium text-secondary-700">
                        Annulation de rendez-vous
                      </label>
                      <p className="text-secondary-500">
                        Recevez un SMS lorsqu'un rendez-vous est annulé.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-secondary-200">
                  <h2 className="text-lg font-medium text-secondary-900">Paramètres de rappel</h2>
                  <p className="mt-1 text-sm text-secondary-500">
                    Configurez quand vous souhaitez recevoir les rappels de rendez-vous.
                  </p>
                </div>

                <div>
                  <label htmlFor="reminder_time" className="block text-sm font-medium text-secondary-700">
                    Envoyer les rappels
                  </label>
                  <select
                    id="reminder_time"
                    name="reminder_time"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={notificationSettings.reminder_time}
                    onChange={handleInputChange}
                  >
                    <option value="1">1 heure avant</option>
                    <option value="2">2 heures avant</option>
                    <option value="3">3 heures avant</option>
                    <option value="6">6 heures avant</option>
                    <option value="12">12 heures avant</option>
                    <option value="24">24 heures avant</option>
                    <option value="48">2 jours avant</option>
                  </select>
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
