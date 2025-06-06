import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User, ProfessionalSettings } from '@/types';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

interface SettingsProps {
  user: User | null;
}

const SettingsSchema = Yup.object().shape({
  welcome_message: Yup.string().required('Message de bienvenue requis'),
  confirmation_message: Yup.string().required('Message de confirmation requis'),
  reminder_message: Yup.string().required('Message de rappel requis'),
  reminder_time: Yup.number()
    .min(1, 'Doit être au moins 1 heure')
    .max(72, 'Doit être au maximum 72 heures')
    .required('Temps de rappel requis'),
  appointment_buffer: Yup.number()
    .min(0, 'Doit être au moins 0 minute')
    .max(120, 'Doit être au maximum 120 minutes')
    .required('Tampon entre rendez-vous requis'),
  voice_enabled: Yup.boolean(),
  voice_greeting: Yup.string().when('voice_enabled', {
    is: true,
    then: (schema) => schema.required('Message vocal requis lorsque la voix est activée'),
    // sinon, tu peux ajouter :
    // otherwise: (schema) => schema.notRequired()
  }),

});

export default function Settings({ user }: SettingsProps) {
  const [settings, setSettings] = useState<ProfessionalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('professional_settings')
        .select('*')
        .eq('professional_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: Partial<ProfessionalSettings>) => {
    setSaving(true);
    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('professional_settings')
          .update({
            welcome_message: values.welcome_message,
            confirmation_message: values.confirmation_message,
            reminder_message: values.reminder_message,
            reminder_time: values.reminder_time,
            voice_enabled: values.voice_enabled,
            voice_greeting: values.voice_greeting,
            appointment_buffer: values.appointment_buffer,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('professional_settings')
          .insert([
            {
              professional_id: user?.id,
              welcome_message: values.welcome_message,
              confirmation_message: values.confirmation_message,
              reminder_message: values.reminder_message,
              reminder_time: values.reminder_time,
              voice_enabled: values.voice_enabled,
              voice_greeting: values.voice_greeting,
              appointment_buffer: values.appointment_buffer,
              calendar_integration: 'none',
              calendar_sync_enabled: false,
            },
          ]);

        if (error) throw error;
      }

      toast.success('Paramètres enregistrés avec succès');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <Head>
        <title>Paramètres | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Paramètres</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {loading ? (
                <div className="animate-pulse space-y-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 bg-secondary-100 rounded"></div>
                  ))}
                </div>
              ) : (
                <Formik
                  initialValues={{
                    welcome_message: settings?.welcome_message || `Bonjour, je suis l'assistant virtuel de ${user.business_name}. Comment puis-je vous aider aujourd'hui ?`,
                    confirmation_message: settings?.confirmation_message || `Votre rendez-vous a été confirmé. Nous vous attendons le {date} à {time}. À bientôt !`,
                    reminder_message: settings?.reminder_message || `Rappel : Vous avez rendez-vous demain à {time} chez ${user.business_name}.`,
                    reminder_time: settings?.reminder_time || 24,
                    voice_enabled: settings?.voice_enabled || false,
                    voice_greeting: settings?.voice_greeting || '',
                    appointment_buffer: settings?.appointment_buffer || 15,
                  }}
                  validationSchema={SettingsSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, isValid }) => (
                    <Form className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-secondary-900 mb-4">Messages automatiques</h3>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <label htmlFor="welcome_message" className="block text-sm font-medium text-secondary-700">
                              Message de bienvenue
                            </label>
                            <div className="mt-1">
                              <Field
                                as="textarea"
                                id="welcome_message"
                                name="welcome_message"
                                rows={3}
                                className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md ${
                                  errors.welcome_message && touched.welcome_message ? 'border-red-500' : ''
                                }`}
                              />
                              <ErrorMessage
                                name="welcome_message"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                              />
                            </div>
                            <p className="mt-2 text-sm text-secondary-500">
                              Ce message est envoyé lorsqu&apos;un client vous contacte pour la première fois.
                            </p>
                          </div>

                          <div className="sm:col-span-6">
                            <label htmlFor="confirmation_message" className="block text-sm font-medium text-secondary-700">
                              Message de confirmation
                            </label>
                            <div className="mt-1">
                              <Field
                                as="textarea"
                                id="confirmation_message"
                                name="confirmation_message"
                                rows={3}
                                className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md ${
                                  errors.confirmation_message && touched.confirmation_message ? 'border-red-500' : ''
                                }`}
                              />
                              <ErrorMessage
                                name="confirmation_message"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                              />
                            </div>
                            <p className="mt-2 text-sm text-secondary-500">
                              Ce message est envoyé lorsqu&apos;un rendez-vous est confirmé. Utilisez {'{date}'} et {'{time}'} pour insérer la date et l&apos;heure du rendez-vous.
                            </p>
                          </div>

                          <div className="sm:col-span-6">
                            <label htmlFor="reminder_message" className="block text-sm font-medium text-secondary-700">
                              Message de rappel
                            </label>
                            <div className="mt-1">
                              <Field
                                as="textarea"
                                id="reminder_message"
                                name="reminder_message"
                                rows={3}
                                className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md ${
                                  errors.reminder_message && touched.reminder_message ? 'border-red-500' : ''
                                }`}
                              />
                              <ErrorMessage
                                name="reminder_message"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                              />
                            </div>
                            <p className="mt-2 text-sm text-secondary-500">
                              Ce message est envoyé avant le rendez-vous. Utilisez {'{date}'} et {'{time}'} pour insérer la date et l&apos;heure du rendez-vous.
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="reminder_time" className="block text-sm font-medium text-secondary-700">
                              Temps de rappel (heures)
                            </label>
                            <div className="mt-1">
                              <Field
                                type="number"
                                id="reminder_time"
                                name="reminder_time"
                                min="1"
                                max="72"
                                className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md ${
                                  errors.reminder_time && touched.reminder_time ? 'border-red-500' : ''
                                }`}
                              />
                              <ErrorMessage
                                name="reminder_time"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                              />
                            </div>
                            <p className="mt-2 text-sm text-secondary-500">
                              Combien d&apos;heures avant le rendez-vous le rappel doit-il être envoyé.
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="appointment_buffer" className="block text-sm font-medium text-secondary-700">
                              Tampon entre rendez-vous (minutes)
                            </label>
                            <div className="mt-1">
                              <Field
                                type="number"
                                id="appointment_buffer"
                                name="appointment_buffer"
                                min="0"
                                max="120"
                                className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md ${
                                  errors.appointment_buffer && touched.appointment_buffer ? 'border-red-500' : ''
                                }`}
                              />
                              <ErrorMessage
                                name="appointment_buffer"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                              />
                            </div>
                            <p className="mt-2 text-sm text-secondary-500">
                              Temps minimum entre deux rendez-vous consécutifs.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-secondary-200">
                        <h3 className="text-lg font-medium leading-6 text-secondary-900 mb-4">Paramètres vocaux</h3>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <Field
                                  id="voice_enabled"
                                  name="voice_enabled"
                                  type="checkbox"
                                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="voice_enabled" className="font-medium text-secondary-700">
                                  Activer les réponses vocales
                                </label>
                                <p className="text-secondary-500">
                                  Permet à l&apos;assistant de répondre aux messages vocaux WhatsApp.
                                </p>
                              </div>
                            </div>
                          </div>

                          {values.voice_enabled && (
                            <div className="sm:col-span-6">
                              <label htmlFor="voice_greeting" className="block text-sm font-medium text-secondary-700">
                                Message d&apos;accueil vocal
                              </label>
                              <div className="mt-1">
                                <Field
                                  as="textarea"
                                  id="voice_greeting"
                                  name="voice_greeting"
                                  rows={3}
                                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md ${
                                    errors.voice_greeting && touched.voice_greeting ? 'border-red-500' : ''
                                  }`}
                                />
                                <ErrorMessage
                                  name="voice_greeting"
                                  component="div"
                                  className="text-red-500 text-sm mt-1"
                                />
                              </div>
                              <p className="mt-2 text-sm text-secondary-500">
                                Ce message sera utilisé comme introduction lors des réponses vocales.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-secondary-200">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="bg-white py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            onClick={() => fetchSettings()}
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={saving || !isValid}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                          >
                            {saving ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enregistrement...
                              </>
                            ) : (
                              'Enregistrer'
                            )}
                          </button>
                        </div>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
