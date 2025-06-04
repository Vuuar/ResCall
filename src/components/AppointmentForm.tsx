import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}

interface AppointmentFormProps {
  professionalId: string;
  appointmentId?: string;
  onSuccess?: () => void;
}

export default function AppointmentForm({ professionalId, appointmentId, onSuccess }: AppointmentFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  
  const selectedServiceId = watch('service_id');
  const selectedService = services.find(s => s.id === selectedServiceId);
  
  // Fetch services, clients, and appointment data if editing
  useEffect(() => {
    async function fetchData() {
      try {
        setInitialLoading(true);
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', professionalId);
        
        if (servicesError) throw servicesError;
        setServices(servicesData);
        
        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .eq('professional_id', professionalId);
        
        if (clientsError) throw clientsError;
        setClients(clientsData);
        
        // If editing, fetch appointment data
        if (appointmentId) {
          const { data: appointment, error: appointmentError } = await supabase
            .from('appointments')
            .select('*')
            .eq('id', appointmentId)
            .single();
          
          if (appointmentError) throw appointmentError;
          
          // Set form values
          setValue('client_id', appointment.client_id);
          setValue('service_id', appointment.service_id);
          setValue('date', new Date(appointment.start_time).toISOString().split('T')[0]);
          setValue('time', new Date(appointment.start_time).toISOString().split('T')[1].substring(0, 5));
          setValue('status', appointment.status);
          setValue('notes', appointment.notes);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setInitialLoading(false);
      }
    }
    
    fetchData();
  }, [professionalId, appointmentId, setValue]);
  
  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      // Calculate start and end times
      const startTime = new Date(`${data.date}T${data.time}`);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (selectedService?.duration || 60));
      
      const appointmentData = {
        professional_id: professionalId,
        client_id: data.client_id,
        service_id: data.service_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: data.status,
        notes: data.notes,
      };
      
      let result;
      
      if (appointmentId) {
        // Update existing appointment
        result = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointmentId);
      } else {
        // Create new appointment
        result = await supabase
          .from('appointments')
          .insert([appointmentData]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(appointmentId ? 'Rendez-vous mis à jour' : 'Rendez-vous créé');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
      toast.error('Erreur lors de l\'enregistrement du rendez-vous');
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return <div className="p-4">Chargement...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <select
          {...register('client_id', { required: 'Client requis' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Sélectionner un client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.first_name} {client.last_name}
            </option>
          ))}
        </select>
        {errors.client_id && (
          <p className="mt-1 text-sm text-red-600">{errors.client_id.message as string}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Service</label>
        <select
          {...register('service_id', { required: 'Service requis' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Sélectionner un service</option>
          {services.map(service => (
            <option key={service.id} value={service.id}>
              {service.name} - {service.duration} min - {(service.price / 100).toFixed(2)}€
            </option>
          ))}
        </select>
        {errors.service_id && (
          <p className="mt-1 text-sm text-red-600">{errors.service_id.message as string}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            {...register('date', { required: 'Date requise' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message as string}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Heure</label>
          <input
            type="time"
            {...register('time', { required: 'Heure requise' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time.message as string}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Statut</label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="scheduled">Planifié</option>
          <option value="confirmed">Confirmé</option>
          <option value="cancelled">Annulé</option>
          <option value="completed">Terminé</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : appointmentId ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
