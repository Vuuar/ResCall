import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User } from '@/types';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

interface ProfileCompletionProps {
  user: User | null;
}

const ProfileCompletionSchema = Yup.object().shape({
  first_name: Yup.string().required('Prénom requis'),
  last_name: Yup.string().required('Nom requis'),
  phone_number: Yup.string().required('Numéro de téléphone requis'),
  business_name: Yup.string().required('Nom de l\'entreprise requis'),
  business_type: Yup.string().required('Type d\'activité requis'),
});

export default function ProfileCompletion({ user }: ProfileCompletionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    business_name: '',
    business_type: '',
  });

  useEffect(() => {
    if (user) {
      // Check if profile is already complete
      if (user.profile_completed) {
        router.push('/dashboard');
        return;
      }
      
      setInitialValues({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        business_name: user.business_name || '',
        business_type: user.business_type || '',
      });
    }
  }, [user, router]);

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
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profil complété avec succès');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('Erreur lors de la complétion du profil');
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
        <title>Compléter mon profil | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Compléter mon profil</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <p className="text-sm text-secondary-500">
                  Veuillez compléter votre profil pour continuer à utiliser l&apos;application.
                </p>
              </div>
              
              <Formik
                initialValues={initialValues}
                validationSchema={ProfileCompletionSchema}
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
                            'Compléter mon profil'
                          )}
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
