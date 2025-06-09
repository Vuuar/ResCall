import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User } from '@/types';
import { formatDate } from '@/utils/date';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface StatisticsProps {
  user: User | null;
}

interface StatsPeriod {
  label: string;
  value: string;
  days: number;
}

interface AppointmentStats {
  total: number;
  confirmed: number;
  cancelled: number;
  no_show: number;
  completed: number;
  scheduled: number;
}

interface ConversationStats {
  total: number;
  with_appointment: number;
  conversion_rate: number;
}

interface TimeStats {
  labels: string[];
  appointments: number[];
}

export default function Statistics({ user }: StatisticsProps) {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('30d');
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({
    total: 0,
    confirmed: 0,
    cancelled: 0,
    no_show: 0,
    completed: 0,
    scheduled: 0,
  });
  const [conversationStats, setConversationStats] = useState<ConversationStats>({
    total: 0,
    with_appointment: 0,
    conversion_rate: 0,
  });
  const [timeStats, setTimeStats] = useState<TimeStats>({
    labels: [],
    appointments: [],
  });

  const periods: StatsPeriod[] = [
    { label: '7 derniers jours', value: '7d', days: 7 },
    { label: '30 derniers jours', value: '30d', days: 30 },
    { label: '90 derniers jours', value: '90d', days: 90 },
    { label: 'Cette année', value: 'year', days: 365 },
  ];

  useEffect(() => {
    if (user) {
      fetchStatistics();
    }
  }, [user, period]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      const selectedPeriod = periods.find(p => p.value === period);
      if (selectedPeriod) {
        startDate.setDate(endDate.getDate() - selectedPeriod.days);
      } else {
        // Default to 30 days
        startDate.setDate(endDate.getDate() - 30);
      }
      
      // Format dates for database query
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      
      // Fetch appointment statistics
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', user?.id)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);

      if (appointmentsError) throw appointmentsError;
      
      // Calculate appointment stats
      const confirmed = appointments?.filter(a => a.status === 'confirmed').length || 0;
      const cancelled = appointments?.filter(a => a.status === 'cancelled').length || 0;
      const no_show = appointments?.filter(a => a.status === 'no_show').length || 0;
      const completed = appointments?.filter(a => a.status === 'completed').length || 0;
      const scheduled = appointments?.filter(a => a.status === 'scheduled').length || 0;
      
      setAppointmentStats({
        total: appointments?.length || 0,
        confirmed,
        cancelled,
        no_show,
        completed,
        scheduled,
      });
      
      // Fetch conversation statistics
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .eq('professional_id', user?.id)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);

      if (conversationsError) throw conversationsError;
      
      const conversationsWithAppointment = conversations?.filter(c => c.has_appointment).length || 0;
      const totalConversations = conversations?.length || 0;
      
      setConversationStats({
        total: totalConversations,
        with_appointment: conversationsWithAppointment,
        conversion_rate: totalConversations > 0 
          ? Math.round((conversationsWithAppointment / totalConversations) * 100) 
          : 0,
      });
      
      // Generate time-based statistics
      generateTimeStats(appointments || [], startDate, endDate, selectedPeriod?.days || 30);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeStats = (appointments: any[], startDate: Date, endDate: Date, days: number) => {
    const labels: string[] = [];
    const appointmentCounts: number[] = [];
    
    // Determine interval based on period length
    let interval = 'day';
    let format = 'dd/MM';
    
    if (days > 90) {
      interval = 'month';
      format = 'MMM yyyy';
    } else if (days > 30) {
      interval = 'week';
      format = "'Sem' w";
    }
    
    // Generate date intervals
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      let nextDate = new Date(currentDate);
      
      if (interval === 'day') {
        labels.push(formatDate(currentDate.toISOString(), format));
        nextDate.setDate(currentDate.getDate() + 1);
      } else if (interval === 'week') {
        labels.push(formatDate(currentDate.toISOString(), format));
        nextDate.setDate(currentDate.getDate() + 7);
      } else if (interval === 'month') {
        labels.push(formatDate(currentDate.toISOString(), format));
        nextDate.setMonth(currentDate.getMonth() + 1);
      }
      
      // Count appointments in this interval
      const count = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.created_at);
        return appointmentDate >= currentDate && appointmentDate < nextDate;
      }).length;
      
      appointmentCounts.push(count);
      currentDate.setTime(nextDate.getTime());
    }
    
    setTimeStats({
      labels,
      appointments: appointmentCounts,
    });
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };

  // Chart data and options
  const appointmentStatusData = {
    labels: ['Confirmés', 'Annulés', 'Absences', 'Terminés', 'Planifiés'],
    datasets: [
      {
        label: 'Rendez-vous par statut',
        data: [
          appointmentStats.confirmed,
          appointmentStats.cancelled,
          appointmentStats.no_show,
          appointmentStats.completed,
          appointmentStats.scheduled,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const appointmentsOverTimeData = {
    labels: timeStats.labels,
    datasets: [
      {
        label: 'Rendez-vous',
        data: timeStats.appointments,
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  const conversionRateData = {
    labels: ['Avec rendez-vous', 'Sans rendez-vous'],
    datasets: [
      {
        label: 'Conversations',
        data: [
          conversationStats.with_appointment,
          conversationStats.total - conversationStats.with_appointment,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Period selector */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-secondary-700">Période :</span>
                <div className="relative">
                  <select
                    value={period}
                    onChange={handlePeriodChange}
                    className="block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    {periods.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-64 bg-secondary-100 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-secondary-100 rounded-lg"></div>
                <div className="h-64 bg-secondary-100 rounded-lg"></div>
              </div>
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
                            Total des rendez-vous
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-secondary-900">
                              {appointmentStats.total}
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
                            Taux de confirmation
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-secondary-900">
                              {appointmentStats.total > 0
                                ? Math.round((appointmentStats.confirmed / appointmentStats.total) * 100)
                                : 0}%
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
                      <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-secondary-500 truncate">
                            Total des conversations
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-secondary-900">
                              {conversationStats.total}
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
                              {conversationStats.conversion_rate}%
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">Rendez-vous dans le temps</h2>
                  <div className="h-80">
                    <Line data={appointmentsOverTimeData} options={chartOptions} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">Rendez-vous par statut</h2>
                  <div className="h-80">
                    <Bar data={appointmentStatusData} options={chartOptions} />
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">Taux de conversion</h2>
                  <div className="h-80">
                    <Pie data={conversionRateData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
