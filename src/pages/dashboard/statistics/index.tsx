import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User, Appointment, Conversation } from '@/types';
import { formatDate } from '@/utils/date';

interface StatisticsProps {
  user: User | null;
}

export default function Statistics({ user }: StatisticsProps) {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    confirmed: 0,
    cancelled: 0,
    noShow: 0,
    completed: 0
  });
  const [conversionRate, setConversionRate] = useState(0);
  const [monthlyAppointments, setMonthlyAppointments] = useState<{month: string, count: number}[]>([]);
  const [appointmentsByService, setAppointmentsByService] = useState<{service: string, count: number}[]>([]);
  const [appointmentsByDay, setAppointmentsByDay] = useState<{day: string, count: number}[]>([]);

  useEffect(() => {
    if (user) {
      fetchStatisticsData();
    }
  }, [user, timeframe]);

  const fetchStatisticsData = async () => {
    setLoading(true);
    try {
      // Get date range based on timeframe
      const now = new Date();
      let startDate = new Date();
      
      if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (timeframe === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      const startDateStr = startDate.toISOString();

      // Fetch appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*, services(name)')
        .eq('professional_id', user?.id)
        .gte('start_time', startDateStr);

      if (appointmentsError) throw appointmentsError;

      // Fetch conversations
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .eq('professional_id', user?.id)
        .gte('created_at', startDateStr);

      if (conversationsError) throw conversationsError;

      // Calculate appointment stats
      const confirmed = appointments?.filter(a => a.status === 'confirmed').length || 0;
      const cancelled = appointments?.filter(a => a.status === 'cancelled').length || 0;
      const noShow = appointments?.filter(a => a.status === 'no_show').length || 0;
      const completed = appointments?.filter(a => a.status === 'completed').length || 0;
      
      setAppointmentStats({
        total: appointments?.length || 0,
        confirmed,
        cancelled,
        noShow,
        completed
      });

      // Calculate conversion rate
      const convRate = conversations?.length 
        ? Math.round((appointments?.length / conversations?.length) * 100) 
        : 0;
      setConversionRate(convRate);

      // Process appointments by month
      const monthCounts: Record<string, number> = {};
      const serviceCounts: Record<string, number> = {};
      const dayCounts: Record<string, number> = {};
      
      appointments?.forEach(appointment => {
        // Month processing
        const date = new Date(appointment.start_time);
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
        
        // Service processing
        const serviceName = appointment.services?.name || 'Non spécifié';
        serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
        
        // Day of week processing
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
        dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
      });
      
      // Convert to arrays for charts
      const monthlyData = Object.entries(monthCounts).map(([month, count]) => ({
        month,
        count
      }));
      
      const serviceData = Object.entries(serviceCounts).map(([service, count]) => ({
        service,
        count
      }));
      
      const dayData = Object.entries(dayCounts).map(([day, count]) => ({
        day,
        count
      }));
      
      setMonthlyAppointments(monthlyData);
      setAppointmentsByService(serviceData);
      setAppointmentsByDay(dayData);

    } catch (error) {
      console.error('Error fetching statistics data:', error);
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
        <title>Statistiques | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Statistiques</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Timeframe selector */}
          <div className="mt-4 mb-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <p className="mt-1 text-sm text-secondary-500">
                  Visualisez vos statistiques pour mieux comprendre votre activité.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setTimeframe('week')}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md ${
                      timeframe === 'week'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-secondary-700 hover:bg-secondary-50'
                    } border border-secondary-300`}
                  >
                    7 derniers jours
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeframe('month')}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      timeframe === 'month'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-secondary-700 hover:bg-secondary-50'
                    } border-t border-b border-secondary-300`}
                  >
                    30 derniers jours
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeframe('year')}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md ${
                      timeframe === 'year'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-secondary-700 hover:bg-secondary-50'
                    } border border-secondary-300`}
                  >
                    12 derniers mois
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats overview */}
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                          {loading ? '...' : appointmentStats.total}
                        </div>
                      </dd>
                    </dl>
                  </div>
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
                          {loading ? '...' : appointmentStats.confirmed}
                        </div>
                      </dd>
                    </dl>
                  </div>
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
                          {loading ? '...' : `${conversionRate}%`}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-500 truncate">
                        Rendez-vous terminés
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-secondary-900">
                          {loading ? '...' : appointmentStats.completed}
                        </div>
                      </dd>
                    </dl>
                  </div>
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
                          {loading ? '...' : appointmentStats.cancelled}
                        </div>
                      </dd>
                    </dl>
                  </div>
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
                          {loading ? '...' : appointmentStats.noShow}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Appointments by month */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-secondary-200">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  Rendez-vous par mois
                </h3>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-64 bg-secondary-100 rounded"></div>
                  </div>
                ) : monthlyAppointments.length > 0 ? (
                  <div className="h-64">
                    <div className="h-full flex items-end">
                      {monthlyAppointments.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-primary-600 rounded-t"
                            style={{ 
                              height: `${(item.count / Math.max(...monthlyAppointments.map(i => i.count))) * 200}px`,
                              minHeight: '20px'
                            }}
                          ></div>
                          <div className="mt-2 text-xs text-secondary-500 truncate w-full text-center">
                            {item.month}
                          </div>
                          <div className="text-sm font-medium text-secondary-900">
                            {item.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-secondary-500">Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Appointments by service */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-secondary-200">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  Rendez-vous par service
                </h3>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-64 bg-secondary-100 rounded"></div>
                  </div>
                ) : appointmentsByService.length > 0 ? (
                  <div className="h-64 overflow-y-auto">
                    <ul className="divide-y divide-secondary-200">
                      {appointmentsByService.map((item, index) => (
                        <li key={index} className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-secondary-900 truncate">
                                {item.service}
                              </p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                {item.count} rendez-vous
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 w-full bg-secondary-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary-600 h-2.5 rounded-full" 
                              style={{ width: `${(item.count / Math.max(...appointmentsByService.map(i => i.count))) * 100}%` }}
                            ></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-secondary-500">Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Appointments by day of week */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-secondary-200">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  Rendez-vous par jour de la semaine
                </h3>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-64 bg-secondary-100 rounded"></div>
                  </div>
                ) : appointmentsByDay.length > 0 ? (
                  <div className="h-64">
                    <div className="h-full flex items-end">
                      {appointmentsByDay.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-primary-600 rounded-t"
                            style={{ 
                              height: `${(item.count / Math.max(...appointmentsByDay.map(i => i.count))) * 200}px`,
                              minHeight: '20px'
                            }}
                          ></div>
                          <div className="mt-2 text-xs text-secondary-500 truncate w-full text-center">
                            {item.day}
                          </div>
                          <div className="text-sm font-medium text-secondary-900">
                            {item.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-secondary-500">Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Conversion rate over time */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-secondary-200">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  Analyse de performance
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900">Taux de conversion</h4>
                    <p className="text-2xl font-bold text-primary-600">{conversionRate}%</p>
                    <p className="text-sm text-secondary-500">des conversations se transforment en rendez-vous</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900">Taux de complétion</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {appointmentStats.total ? Math.round((appointmentStats.completed / appointmentStats.total) * 100) : 0}%
                    </p>
                    <p className="text-sm text-secondary-500">des rendez-vous sont complétés</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900">Taux d'annulation</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {appointmentStats.total ? Math.round((appointmentStats.cancelled / appointmentStats.total) * 100) : 0}%
                    </p>
                    <p className="text-sm text-secondary-500">des rendez-vous sont annulés</p>
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
