import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User, Appointment, Service } from '@/types';
import { formatDate } from '@/utils/date';

interface CalendarProps {
  user: User | null;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

export default function Calendar({ user }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, currentMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Calculate start and end dates for the month view
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Adjust to include days from previous and next months to fill the calendar grid
      const firstDayOfCalendar = new Date(firstDayOfMonth);
      firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfCalendar.getDay());
      
      const lastDayOfCalendar = new Date(lastDayOfMonth);
      const daysToAdd = 6 - lastDayOfCalendar.getDay();
      lastDayOfCalendar.setDate(lastDayOfCalendar.getDate() + daysToAdd);
      
      // Fetch appointments for the calendar period
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', user?.id)
        .gte('start_time', firstDayOfCalendar.toISOString())
        .lte('start_time', lastDayOfCalendar.toISOString())
        .order('start_time', { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

      // Fetch services for color coding
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', user?.id);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Generate calendar days
      generateCalendarDays(firstDayOfCalendar, lastDayOfCalendar, appointmentsData || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (startDate: Date, endDate: Date, appointments: Appointment[]) => {
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentMonthYear = currentMonth.getFullYear();
    const currentMonthMonth = currentMonth.getMonth();
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const isCurrentMonth = currentDate.getMonth() === currentMonthMonth && currentDate.getFullYear() === currentMonthYear;
      const isToday = currentDate.getTime() === today.getTime();
      
      // Find appointments for this day
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.start_time);
        return (
          appointmentDate.getDate() === currentDate.getDate() &&
          appointmentDate.getMonth() === currentDate.getMonth() &&
          appointmentDate.getFullYear() === currentDate.getFullYear()
        );
      });
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isToday,
        appointments: dayAppointments,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getServiceColor = (serviceType: string | undefined) => {
    if (!serviceType) return '#4F46E5'; // Default color
    
    const service = services.find(s => s.name === serviceType);
    return service?.color || '#4F46E5';
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <Head>
        <title>Calendrier | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-semibold text-secondary-900">Calendrier</h1>
            <div className="mt-4 md:mt-0">
              <Link
                href="/dashboard/appointments"
                className="inline-flex items-center px-4 py-2 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-secondary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Vue liste
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <div className="bg-white shadow rounded-lg p-4">
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-secondary-900">
                  {formatDate(currentMonth.toISOString(), 'MMMM yyyy')}
                </h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="inline-flex items-center p-2 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="inline-flex items-center px-3 py-2 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="inline-flex items-center p-2 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar grid */}
            {loading ? (
              <div className="animate-pulse">
                <div className="grid grid-cols-7 gap-px bg-secondary-200">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-8 bg-secondary-100"></div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-secondary-200">
                  {[...Array(35)].map((_, i) => (
                    <div key={i} className="h-32 bg-secondary-50"></div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-px bg-secondary-200 rounded-t-lg overflow-hidden">
                  {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, i) => (
                    <div key={i} className="bg-secondary-100 text-center py-2">
                      <span className="text-sm font-medium text-secondary-900">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-px bg-secondary-200 rounded-b-lg overflow-hidden">
                  {calendarDays.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`min-h-32 bg-white ${
                        !day.isCurrentMonth ? 'bg-secondary-50' : ''
                      } ${
                        day.isToday ? 'bg-primary-50' : ''
                      } p-2 cursor-pointer hover:bg-secondary-50`}
                      onClick={() => setSelectedDay(day)}
                    >
                      <div className="flex justify-between">
                        <span
                          className={`text-sm ${
                            !day.isCurrentMonth ? 'text-secondary-400' : ''
                          } ${
                            day.isToday ? 'text-primary-600 font-semibold' : ''
                          }`}
                        >
                          {day.date.getDate()}
                        </span>
                        {day.appointments.length > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-100 bg-primary-600 rounded-full">
                            {day.appointments.length}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                        {day.appointments.slice(0, 3).map((appointment) => (
                          <div
                            key={appointment.id}
                            className="px-2 py-1 text-xs rounded truncate"
                            style={{ backgroundColor: `${getServiceColor(appointment.service_type)}20` }}
                          >
                            <div className="flex items-center">
                              <div
                                className="w-2 h-2 rounded-full mr-1"
                                style={{ backgroundColor: getServiceColor(appointment.service_type) }}
                              ></div>
                              <span>{formatDate(appointment.start_time, 'HH:mm')}</span>
                            </div>
                            <div className="truncate font-medium">{appointment.client_name}</div>
                          </div>
                        ))}
                        {day.appointments.length > 3 && (
                          <div className="text-xs text-secondary-500 pl-2">
                            + {day.appointments.length - 3} autres
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Day detail modal */}
      {selectedDay && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-secondary-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-secondary-900">
                      {formatDate(selectedDay.date.toISOString(), 'EEEE d MMMM yyyy')}
                    </h3>
                    <div className="mt-4">
                      {selectedDay.appointments.length > 0 ? (
                        <ul className="divide-y divide-secondary-200">
                          {selectedDay.appointments.map((appointment) => (
                            <li key={appointment.id} className="py-3">
                              <Link href={`/dashboard/appointments/${appointment.id}`} className="block hover:bg-secondary-50 -mx-4 px-4 py-2 rounded-md">
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-secondary-900">{appointment.client_name}</p>
                                    <p className="text-sm text-secondary-500">
                                      {formatDate(appointment.start_time, 'HH:mm')} - {formatDate(appointment.end_time, 'HH:mm')}
                                    </p>
                                    {appointment.service_type && (
                                      <div className="flex items-center mt-1">
                                        <div
                                          className="w-2 h-2 rounded-full mr-1"
                                          style={{ backgroundColor: getServiceColor(appointment.service_type) }}
                                        ></div>
                                        <p className="text-xs text-secondary-500">{appointment.service_type}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusClass(appointment.status)}`}>
                                      {getStatusLabel(appointment.status)}
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-secondary-500 text-center py-4">
                          Aucun rendez-vous pour cette journée.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
