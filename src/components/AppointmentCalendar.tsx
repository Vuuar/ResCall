import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

// Set up the localizer
moment.locale('fr');
const localizer = momentLocalizer(moment);

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  client_name: string;
  service_name: string;
  color?: string;
}

interface AppointmentCalendarProps {
  professionalId: string;
}

export default function AppointmentCalendar({ professionalId }: AppointmentCalendarProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            end_time,
            status,
            client_name,
            service_type,
            services (name, color)
          `)
          .eq('professional_id', professionalId);
        
        if (error) throw error;
        
        // Transform data for calendar
        const formattedAppointments = data.map(appointment => ({
          id: appointment.id,
          title: `${appointment.client_name} - ${appointment.services?.[0]?.name || appointment.service_type}`,
          start: new Date(appointment.start_time),
          end: new Date(appointment.end_time),
          status: appointment.status,
          client_name: appointment.client_name,
          service_name: appointment.services?.[0]?.name || appointment.service_type,
          color: appointment.services?.[0]?.color || getStatusColor(appointment.status),
        }));
        
        setAppointments(formattedAppointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    }
    
    if (professionalId) {
      fetchAppointments();
    }
  }, [professionalId]);

  // Get color based on appointment status
  function getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed':
        return '#4CAF50'; // Green
      case 'scheduled':
        return '#2196F3'; // Blue
      case 'cancelled':
        return '#F44336'; // Red
      case 'completed':
        return '#9E9E9E'; // Grey
      default:
        return '#FF9800'; // Orange
    }
  }

  // Handle appointment click
  const handleSelectEvent = (event: Appointment) => {
    router.push(`/appointments/${event.id}`);
  };

  // Custom event styling
  const eventStyleGetter = (event: Appointment) => {
    const style = {
      backgroundColor: event.color || getStatusColor(event.status),
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return {
      style,
    };
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des rendez-vous...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="h-[600px] p-4">
      <Calendar
        localizer={localizer}
        events={appointments}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="week"
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        messages={{
          next: "Suivant",
          previous: "Précédent",
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          agenda: "Agenda",
        }}
      />
    </div>
  );
}
