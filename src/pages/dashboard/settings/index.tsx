import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Layout from '@/components/Layout';

export default function Settings() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Layout title="Chargement...">
        <div className="min-h-screen flex items-center justify-center bg-secondary-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary-600">Chargement...</h1>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user} title="Paramètres - WhatsApp Booking">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Paramètres</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Informations personnelles</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="first_name" className="block text-sm font-medium text-secondary-700">
                        Prénom
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="first_name"
                          id="first_name"
                          defaultValue={user.first_name || ''}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="last_name" className="block text-sm font-medium text-secondary-700">
                        Nom
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="last_name"
                          id="last_name"
                          defaultValue={user.last_name || ''}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                        Adresse e-mail
                      </label>
                      <div className="mt-1">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={user.email}
                          disabled
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md bg-secondary-50"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="phone_number" className="block text-sm font-medium text-secondary-700">
                        Numéro de téléphone
                      </label>
                      <div className="mt-1">
                        <input
                          type="tel"
                          name="phone_number"
                          id="phone_number"
                          defaultValue={user.phone_number || ''}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-5 bg-secondary-50 border-t border-secondary-200">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Changer le mot de passe</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="current_password" className="block text-sm font-medium text-secondary-700">
                        Mot de passe actuel
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="current_password"
                          id="current_password"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="new_password" className="block text-sm font-medium text-secondary-700">
                        Nouveau mot de passe
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="new_password"
                          id="new_password"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-secondary-700">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="confirm_password"
                          id="confirm_password"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Mettre à jour le mot de passe
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
