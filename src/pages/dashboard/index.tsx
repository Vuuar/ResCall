import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Layout from '@/components/Layout';

export default function Dashboard() {
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
    <DashboardLayout user={user}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Tableau de bord</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Bienvenue, {user.full_name || user.email}</h2>
              <p className="text-secondary-600">
                Voici votre tableau de bord WhatsApp Booking. Gérez vos rendez-vous, conversations et disponibilités.
              </p>
              
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-primary-50 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-secondary-500 truncate">
                            Rendez-vous aujourd'hui
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-secondary-900">0</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary-100 px-5 py-3">
                    <div className="text-sm">
                      <a href="/dashboard/appointments" className="font-medium text-primary-700 hover:text-primary-900">
                        Voir tous les rendez-vous
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary-50 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-secondary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-secondary-500 truncate">
                            Conversations non lues
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-secondary-900">0</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary-100 px-5 py-3">
                    <div className="text-sm">
                      <a href="/dashboard/conversations" className="font-medium text-secondary-700 hover:text-secondary-900">
                        Voir toutes les conversations
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-secondary-500 truncate">
                            Taux de confirmation
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-secondary-900">0%</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-100 px-5 py-3">
                    <div className="text-sm">
                      <a href="/dashboard/statistics" className="font-medium text-green-700 hover:text-green-900">
                        Voir les statistiques
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
