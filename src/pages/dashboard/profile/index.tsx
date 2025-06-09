import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User } from '@/types';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

interface ProfileProps {
  user: User | null;
}

const ProfileSchema = Yup.object().shape({
  first_name: Yup.string().required('Prénom requis'),
  last_name: Yup.string().required('Nom requis'),
  email: Yup.string().email('Email invalide').required('Email requis'),
  phone_number: Yup.string().required('Numéro de téléphone requis'),
  business_name: Yup.string().required('Nom de l\'entreprise requis'),
  business_type: Yup.string().required('Type d\'activité requis'),
});

export default function Profile({ user }: ProfileProps) {
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    business_name: '',
    business_type: '',
  });

  useEffect(() => {
    if (user) {
      setInitialValues({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        business_name: user.business_name || '',
        business_type: user.business_type || '',
      });
    }
  }, [user]);

  const handleSubmit = async (values: typeof initialValues) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          phone_number: values.phone_number,
          business_name: values.business_name,
          business_type: values.business_type,
          full_name: `${values.first_name} ${values.last_name}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Update email if changed (requires auth update)
      if (values.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email,
        });
        
        if (emailError) throw emailError;
      }
      
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
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
        <title>Profil | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Profil</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <Formik
                initialValues={initialValues}
                validationSchema={ProfileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ isValid, dirty }) => (
                  <Form className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-secondary-900 mb-4">Informations personnelles</h3>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="first_name" className="block text-sm font-medium text-secondary-700">
                            Prénom
                          </label>
                          <div className="mt-1">
                            <Field
                              type="text"
                              name="first_name"
                              id="first_name"
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                            />
                            <ErrorMessage
                              name="first_name"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="last_name" className="block text-sm font-medium text-secondary-700">
                            Nom
                          </label>
                          <div className="mt-1">
                            <Field
                              type="text"
                              name="last_name"
                              id="last_name"
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                            />
                            <ErrorMessage
                              name="last_name"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                            Email
                          </label>
                          <div className="mt-1">
                            <Field
                              type="email"
                              name="email"
                              id="email"
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                            />
                            <ErrorMessage
                              name="email"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="phone_number" className="block text-sm font-medium text-secondary-700">
                            Téléphone
                          </label>
                          <div className="mt-1">
                            <Field
                              type="tel"
                              name="phone_number"
                              id="phone_number"
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                            />
                            <ErrorMessage
                              name="phone_number"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                            <p className="mt-1 text-xs text-secondary-500">
                              Format international recommandé: +33612345678
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-secondary-200">
                      <h3 className="text-lg font-medium leading-6 text-secondary-900 mb-4">Informations professionnelles</h3>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="business_name" className="block text-sm font-medium text-secondary-700">
                            Nom de l&apos;entreprise
                          </label>
                          <div className="mt-1">
                            <Field
                              type="text"
                              name="business_name"
                              id="business_name"
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                            />
                            <ErrorMessage
                              name="business_name"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="business_type" className="block text-sm font-medium text-secondary-700">
                            Type d&apos;activité
                          </label>
                          <div className="mt-1">
                            <Field
                              as="select"
                              name="business_type"
                              id="business_type"
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                            >
                              <option value="">Sélectionnez un type</option>
                              <option value="medical">Médical</option>
                              <option value="legal">Juridique</option>
                              <option value="therapy">Thérapie</option>
                              <option value="coaching">Coaching</option>
                              <option value="beauty">Beauté & Bien-être</option>
                              <option value="fitness">Fitness & Sport</option>
                              <option value="education">Éducation</option>
                              <option value="consulting">Conseil</option>
                              <option value="other">Autre</option>
                            </Field>
                            <ErrorMessage
                              name="business_type"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-secondary-200">
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading || !isValid || !dirty}
                          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                          {loading ? (
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
            </div>
          </div>

          <div className="bg-white shadow rounded-lg mt-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-secondary-900">Changer votre mot de passe</h3>
              <div className="mt-2 max-w-xl text-sm text-secondary-500">
                <p>
                  Mettez à jour votre mot de passe pour sécuriser votre compte.
                </p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(
                        user.email,
                        { redirectTo: `${window.location.origin}/reset-password` }
                      );
                      
                      if (error) throw error;
                      
                      toast.success('Email de réinitialisation envoyé. Vérifiez votre boîte de réception.');
                    } catch (error) {
                      console.error('Error sending reset password email:', error);
                      toast.error('Erreur lors de l\'envoi de l\'email de réinitialisation');
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-secondary-300 shadow-sm text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Changer le mot de passe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
