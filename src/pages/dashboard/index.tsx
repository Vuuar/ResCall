import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User, Appointment, Conversation, Stats } from '@/types';
import { formatDate } from '@/utils/date';

interface DashboardProps {
  user: User | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState<Stats>({
    total_appointments: 0,
    confirmed_appointments: 0,
    cancelled_appointments: 0,
    no_show_appointments: 0,
    total_conversations: 0,
    conversion_rate: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', user?.id)
        .order('start_time', { ascending: false })
        .limit(5);

      if (appointmentsError) throw appointmentsError;
      setRecentAppointments(appointments || []);

      // Fetch conversations
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .eq('professional_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (conversationsError) throw conversationsError;
      setRecentConversations(conversations || []);

      // Calculate stats
      const { data: allAppointments, error: statsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', user?.id);

      if (statsError) throw statsError;

      const { data: allConversations, error: convStatsError } = await supabase
        .from('conversations')
        .select('*')
        .eq('professional_id', user?.id);

      if (convStatsError) throw convStatsError;

      const confirmedAppointments = allAppointments?.filter(a => a.status === 'confirmed' || a.status === 'completed') || [];
      const cancelledAppointments = allAppointments?.filter(a => a.status === 'cancelled') || [];
      const noShowAppointments = allAppointments?.filter(a => a.status === 'no_show') || [];
      
      const conversionRate = allConversations?.length 
        ? Math.round((allAppointments?.length / allConversations?.length) * 100) 
        : 0;

      setStats({
        total_appointments: allAppointments?.length || 0,
        confirmed_appointments: confirmedAppointments.length,
        cancelled_appointments: cancelledAppointments.length,
        no_show_appointments: noShowAppointments.length,
        total_conversations: allConversations?.length || 0,
        conversion_rate: conversionRate,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
        <title>Tableau de bord | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Tableau de bord</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Welcome section */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-medium text-secondary-900">Bienvenue, {user.full_name} 👋</h2>
            <p className="mt-1 text-sm text-secondary-500">
              Voici un aperçu de votre activité récente et de vos statistiques.
            </p>
            
            {user.subscription_tier === 'free_trial' && (
              <div className="mt-4 bg-primary-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-primary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-primary-700">
                      Votre période d&apos;essai se termine le {user.trial_ends_at ? formatDate(user.trial_ends_at, 'PPP') : 'bientôt'}.
                    </p>
                    <p className="mt-3 text-sm md:mt-0 md:ml-6">
                      <Link href="/dashboard/subscription" className="whitespace-nowrap font-medium text-primary-700 hover:text-primary-600">
                        Choisir un forfait <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
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
                        Rendez-vous totaux
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-secondary-900">
                          {loading ? '...' : stats.total_appointments}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/dashboard/appointments" className="font-medium text-primary-700 hover:text-primary-900">
                    Voir tous les rendez-vous
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
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
                        Rendez-vous confirmés
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-secondary-900">
                          {loading ? '...' : stats.confirmed_appointments}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/dashboard/appointments?status=confirmed" className="font-medium text-primary-700 hover:text-primary-900">
                    Voir les détails
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-500 truncate">
                        Conversations
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-secondary-900">
                          {loading ? '...' : stats.total_conversations}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/dashboard/conversations" className="font-medium text-primary-700 hover:text-primary-900">
                    Voir toutes les conversations
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-500 truncate">
                        Taux de conversion
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-secondary-900">
                          {loading ? '...' : `${stats.conversion_rate}%`}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-secondary-500">
                    Conversations converties en rendez-vous
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-500 truncate">
                        Rendez-vous annulés
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-secondary-900">
                          {loading ? '...' : stats.cancelled_appointments}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/dashboard/appointments?status=cancelled" className="font-medium text-primary-700 hover:text-primary-900">
                    Voir les détails
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-500 truncate">
                        Absences (no-show)
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-secondary-900">
                          {loading ? '...' : stats.no_show_appointments}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/dashboard/appointments?status=no_show" className="font-medium text-primary-700 hover:text-primary-900">
                    Voir les détails
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent appointments */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-secondary-200">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  Rendez-vous récents
                </h3>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-secondary-100 rounded"></div>
                    ))}
                  </div>
                ) : recentAppointments.length > 0 ? (
                  <ul className="divide-y divide-secondary-200">
                    {recentAppointments.map((appointment) => (
                      <li key={appointment.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              appointment.status === 'confirmed' || appointment.status === 'completed'
                                ? 'bg-green-100 text-green-600'
                                : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-yellow-100 text-yellow-600'
                            }`}>
                              {appointment.status === 'confirmed' || appointment.status === 'completed' ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : appointment.status === 'cancelled' ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900 truncate">
                              {appointment.client_name}
                            </p>
                            <p className="text-sm text-secondary-500">
                              {formatDate(appointment.start_time, 'PPP')} à {formatDate(appointment.start_time, 'HH:mm')}
                            </p>
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/appointments/${appointment.id}`}
                              className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-secondary-300 text-sm leading-5 font-medium rounded-full text-secondary-700 bg-white hover:bg-secondary-50"
                            >
                              Voir
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-secondary-500">Aucun rendez-vous récent</p>
                  </div>
                )}
                {recentAppointments.length > 0 && (
                  <div className="mt-6">
                    <Link
                      href="/dashboard/appointments"
                      className="w-full flex justify-center items-center px-4 py-2 border border-secondary-300 shadow-sm text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50"
                    >
                      Voir tous les rendez-vous
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent conversations */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-secondary-200">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  Conversations récentes
                </h3>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-secondary-100 rounded"></div>
                    ))}
                  </div>
                ) : recentConversations.length > 0 ? (
                  <ul className="divide-y divide-secondary-200">
                    {recentConversations.map((conversation) => (
                      <li key={conversation.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900 truncate">
                              {conversation.client_name || conversation.client_phone}
                            </p>
                            <p className="text-sm text-secondary-500">
                              {formatDate(conversation.updated_at || new Date(), 'PPP')}
                            </p>
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/conversations/${conversation.id}`}
                              className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-secondary-300 text-sm leading-5 font-medium rounded-full text-secondary-700 bg-white hover:bg-secondary-50"
                            >
                              Voir
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-secondary-500">Aucune conversation récente</p>
                  </div>
                )}
                {recentConversations.length > 0 && (
                  <div className="mt-6">
                    <Link
                      href="/dashboard/conversations"
                      className="w-full flex justify-center items-center px-4 py-2 border border-secondary-300 shadow-sm text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50"
                    >
                      Voir toutes les conversations
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
