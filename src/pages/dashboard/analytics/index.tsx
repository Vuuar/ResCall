import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User, Appointment, Conversation } from '@/types';
import { formatDate } from '@/utils/date';

interface AnalyticsProps {
  user: User | null;
}

interface MonthlyStats {
  month: string;
  appointments: number;
  conversations: number;
  conversion_rate: number;
}

interface ServiceStats {
  service_type: string;
  count: number;
  percentage: number;
}

interface StatusStats {
  status: string;
  count: number;
  percentage: number;
}

export default function Analytics({ user }: AnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30days' | '90days' | '6months' | '12months'>('30days');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [statusStats, setStatusStats] = useState<StatusStats[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '12months':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

      // Fetch conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .eq('professional_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (conversationsError) throw conversationsError;
      setConversations(conversationsData || []);

      // Process data for charts and stats
      calculateMonthlyStats(appointmentsData || [], conversationsData || []);
      calculateServiceStats(appointmentsData || []);
      calculateStatusStats(appointmentsData || []);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyStats = (appointments: Appointment[], conversations: Conversation[]) => {
    const stats: { [key: string]: MonthlyStats } = {};
    
    // Initialize months
    const endDate = new Date();
    const startDate = new Date();
    let monthsToShow = 0;
    
    switch (timeRange) {
      case '30days':
        monthsToShow = 1;
        break;
      case '90days':
        monthsToShow = 3;
        break;
      case '6months':
        monthsToShow = 6;
        break;
      case '12months':
        monthsToShow = 12;
        break;
    }
    
    startDate.setMonth(endDate.getMonth() - monthsToShow + 1);
    startDate.setDate(1);
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthKey = formatDate(currentDate.toISOString(), 'yyyy-MM');
      const monthLabel = formatDate(currentDate.toISOString(), 'MMM yyyy');
      
      stats[monthKey] = {
        month: monthLabel,
        appointments: 0,
        conversations: 0,
        conversion_rate: 0
      };
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Count appointments by month
    appointments.forEach(appointment => {
      const monthKey = formatDate(appointment.created_at, 'yyyy-MM');
      if (stats[monthKey]) {
        stats[monthKey].appointments += 1;
      }
    });
    
    // Count conversations by month
    conversations.forEach(conversation => {
      const monthKey = formatDate(conversation.created_at, 'yyyy-MM');
      if (stats[monthKey]) {
        stats[monthKey].conversations += 1;
      }
    });
    
    // Calculate conversion rates
    Object.keys(stats).forEach(monthKey => {
      if (stats[monthKey].conversations > 0) {
        stats[monthKey].conversion_rate = Math.round((stats[monthKey].appointments / stats[monthKey].conversations) * 100);
      }
    });
    
    // Convert to array and sort by month
    const statsArray = Object.values(stats).sort((a, b) => {
      const monthA = new Date(a.month);
      const monthB = new Date(b.month);
      return monthA.getTime() - monthB.getTime();
    });
    
    setMonthlyStats(statsArray);
  };

  const calculateServiceStats = (appointments: Appointment[]) => {
    const serviceCount: { [key: string]: number } = {};
    let total = 0;
    
    // Count appointments by service type
    appointments.forEach(appointment => {
      const serviceType = appointment.service_type || 'Non spécifié';
      serviceCount[serviceType] = (serviceCount[serviceType] || 0) + 1;
      total += 1;
    });
    
    // Convert to array with percentages
    const stats = Object.entries(serviceCount).map(([service_type, count]) => ({
      service_type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
    
    // Sort by count descending
    stats.sort((a, b) => b.count - a.count);
    
    setServiceStats(stats);
  };

  const calculateStatusStats = (appointments: Appointment[]) => {
    const statusCount: { [key: string]: number } = {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0
    };
    let total = 0;
    
    // Count appointments by status
    appointments.forEach(appointment => {
      statusCount[appointment.status] = (statusCount[appointment.status] || 0) + 1;
      total += 1;
    });
    
    // Convert to array with percentages
    const stats = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
    
    setStatusStats(stats);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Planifié';
      case 'confirmed':
        return 'Confirmé';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      case 'no_show':
        return 'Absence';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'no_show':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-semibold text-secondary-900">Statistiques</h1>
            <div className="mt-4 md:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
                <option value="6months">6 derniers mois</option>
                <option value="12months">12 derniers mois</option>
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {loading ? (
            <div className="animate-pulse space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-secondary-100 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
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
                            Total rendez-vous
                          </dt>
                          <dd className="text-lg font-medium text-secondary-900">
                            {appointments.length}
                          </dd>
                        </dl>
                      </div>
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
                            Total conversations
                          </dt>
                          <dd className="text-lg font-medium text-secondary-900">
                            {conversations.length}
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
                          <dd className="text-lg font-medium text-secondary-900">
                            {conversations.length > 0 
                              ? `${Math.round((appointments.length / conversations.length) * 100)}%` 
                              : '0%'}
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
                          <dd className="text-lg font-medium text-secondary-900">
                            {appointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly stats chart */}
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Évolution mensuelle</h2>
                
                {monthlyStats.length > 0 ? (
                  <div className="relative h-80">
                    <div className="absolute inset-0 flex items-end">
                      {monthlyStats.map((stat, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex justify-center space-x-1">
                            <div 
                              className="w-6 bg-primary-500 rounded-t"
                              style={{ height: `${Math.max(stat.appointments * 5, 5)}px` }}
                              title={`${stat.appointments} rendez-vous`}
                            ></div>
                            <div 
                              className="w-6 bg-secondary-300 rounded-t"
                              style={{ height: `${Math.max(stat.conversations * 5, 5)}px` }}
                              title={`${stat.conversations} conversations`}
                            ></div>
                          </div>
                          <div className="mt-2 text-xs text-secondary-500 rotate-45 origin-left transform translate-y-6">
                            {stat.month}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-secondary-500 py-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i}>{(4 - i) * 5}</div>
                      ))}
                      <div>0</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm text-secondary-500">
                      Pas assez de données pour afficher le graphique.
                    </p>
                  </div>
                )}
                
                <div className="mt-4 flex justify-center space-x-8">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-primary-500 rounded mr-2"></div>
                    <span className="text-sm text-secondary-600">Rendez-vous</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-secondary-300 rounded mr-2"></div>
                    <span className="text-sm text-secondary-600">Conversations</span>
                  </div>
                </div>
              </div>

              {/* Services and Status stats */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Service stats */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">Répartition par service</h2>
                  
                  {serviceStats.length > 0 ? (
                    <div className="space-y-4">
                      {serviceStats.map((stat, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm font-medium text-secondary-700">
                            <span>{stat.service_type}</span>
                            <span>{stat.count} ({stat.percentage}%)</span>
                          </div>
                          <div className="mt-1 w-full bg-secondary-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary-600 h-2.5 rounded-full" 
                              style={{ width: `${stat.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-sm text-secondary-500">
                        Pas assez de données pour afficher les statistiques.
                      </p>
                    </div>
                  )}
                </div>

                {/* Status stats */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">Statut des rendez-vous</h2>
                  
                  {statusStats.some(stat => stat.count > 0) ? (
                    <div>
                      <div className="relative pt-1">
                        <div className="flex h-4 overflow-hidden text-xs bg-secondary-200 rounded-full">
                          {statusStats.map((stat, index) => (
                            stat.count > 0 && (
                              <div
                                key={index}
                                className={`flex flex-col justify-center text-center text-white ${getStatusColor(stat.status)}`}
                                style={{ width: `${stat.percentage}%` }}
                                title={`${getStatusLabel(stat.status)}: ${stat.count} (${stat.percentage}%)`}
                              ></div>
                            )
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        {statusStats.map((stat, index) => (
                          <div key={index} className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(stat.status)} mr-2`}></div>
                            <span className="text-sm text-secondary-600">{getStatusLabel(stat.status)}: {stat.count} ({stat.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-sm text-secondary-500">
                        Pas assez de données pour afficher les statistiques.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
