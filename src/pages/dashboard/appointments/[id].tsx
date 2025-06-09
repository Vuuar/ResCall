import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User, Appointment, Service, Conversation } from '@/types';
import { formatDate } from '@/utils/date';
import toast from 'react-hot-toast';

interface AppointmentDetailProps {
  user: User | null;
}

export default function AppointmentDetail({ user }: AppointmentDetailProps) {
  const router = useRouter();
  const { id } = router.query;
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    service_type: '',
    start_time: '',
    end_time: '',
    status: '',
    notes: '',
  });

  useEffect(() => {
    if (user && id) {
      fetchAppointmentData();
    }
  }, [user, id]);

  const fetchAppointmentData = async () => {
    setLoading(true);
    try {
      // Fetch appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .eq('professional_id', user?.id)
        .single();

      if (appointmentError) throw appointmentError;
      setAppointment(appointmentData);
      
      // Initialize form data
      if (appointmentData) {
        const startTime = new Date(appointmentData.start_time);
        const endTime = new Date(appointmentData.end_time);
        
        setFormData({
          client_name: appointmentData.client_name,
          client_phone: appointmentData.client_phone,
          client_email: appointmentData.client_email || '',
          service_type: appointmentData.service_type || '',
          start_time: `${startTime.toISOString().split('T')[0]}T${startTime.toISOString().split('T')[1].substring(0, 5)}`,
          end_time: `${endTime.toISOString().split('T')[0]}T${endTime.toISOString().split('T')[1].substring(0, 5)}`,
          status: appointmentData.status,
          notes: appointmentData.notes || '',
        });
      }

      // Fetch services for dropdown
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', user?.id)
        .eq('is_active', true);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch related conversation if exists
      if (appointmentData?.conversation_id) {
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', appointmentData.conversation_id)
          .single();

        if (conversationError && conversationError.code !== 'PGRST116') throw conversationError;
        setConversation(conversationData);
      }
    } catch (error) {
      console.error('Error fetching appointment data:', error);
      toast.error('Erreur lors du chargement du rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          client_email: formData.client_email || null,
          service_type: formData.service_type || null,
          start_time: formData.start_time,
          end_time: formData.end_time,
          status: formData.status,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Rendez-vous mis à jour avec succès');
      setIsEditModalOpen(false);
      fetchAppointmentData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Erreur lors de la mise à jour du rendez-vous');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Statut mis à jour: ${getStatusLabel(newStatus)}`);
      
      // Update local state
      if (appointment) {
        setAppointment({
          ...appointment,
          status: newStatus as any,
        });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const sendReminderMessage = async () => {
    if (!appointment) return;
    
    try {
      // In a real implementation, this would trigger a webhook to send a reminder via WhatsApp API
      toast.success('Rappel envoyé au client');
      
      // Log the reminder in the database
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: appointment.conversation_id,
            content: `Rappel automatique: Vous avez rendez-vous le ${formatDate(appointment.start_time, 'PPP')} à ${formatDate(appointment.start_time, 'HH:mm')}.`,
            type: 'text',
            direction: 'outgoing',
          },
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Erreur lors de l\'envoi du rappel');
    }
  };

  const getStatusBadgeClass = (status: string) => {
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
        <title>Détails du rendez-vous | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 text-secondary-500 hover:text-secondary-700"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-secondary-900">
              {loading ? 'Chargement...' : `Rendez-vous avec ${appointment?.client_name}`}
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-secondary-100 rounded-lg"></div>
              <div className="h-64 bg-secondary-100 rounded-lg"></div>
            </div>
          ) : appointment ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main appointment info */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg leading-6 font-medium text-secondary-900">
                        Informations du rendez-vous
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-secondary-500">
                        Détails et statut du rendez-vous.
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeClass(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-secondary-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-secondary-500">Client</dt>
                        <dd className="mt-1 text-sm text-secondary-900">{appointment.client_name}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-secondary-500">Téléphone</dt>
                        <dd className="mt-1 text-sm text-secondary-900">{appointment.client_phone}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-secondary-500">Email</dt>
                        <dd className="mt-1 text-sm text-secondary-900">{appointment.client_email || '-'}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-secondary-500">Service</dt>
                        <dd className="mt-1 text-sm text-secondary-900">{appointment.service_type || '-'}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-secondary-500">Date</dt>
                        <dd className="mt-1 text-sm text-secondary-900">{formatDate(appointment.start_time, 'PPP')}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-secondary-500">Horaire</dt>
                        <dd className="mt-1 text-sm text-secondary-900">
                          {formatDate(appointment.start_time, 'HH:mm')} - {formatDate(appointment.end_time, 'HH:mm')}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-secondary-500">Notes</dt>
                        <dd className="mt-1 text-sm text-secondary-900 whitespace-pre-wrap">
                          {appointment.notes || 'Aucune note'}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-secondary-500">Conversation</dt>
                        <dd className="mt-1 text-sm text-secondary-900">
                          {appointment.conversation_id ? (
                            <a 
                              href={`/dashboard/conversations/${appointment.conversation_id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Voir la conversation
                            </a>
                          ) : (
                            'Aucune conversation associée'
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="border-t border-secondary-200 px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="inline-flex items-center px-3 py-2 border border-secondary-300 shadow-sm text-sm leading-4 font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier
                      </button>
                      <button
                        onClick={sendReminderMessage}
                        disabled={appointment.status === 'cancelled' || appointment.status === 'completed' || appointment.status === 'no_show' || !appointment.conversation_id}
                        className="inline-flex items-center px-3 py-2 border border-secondary-300 shadow-sm text-sm leading-4 font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Envoyer un rappel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div>
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-lg leading-6 font-medium text-secondary-900">
                      Actions
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-secondary-500">
                      Gérer le statut du rendez-vous.
                    </p>
                  </div>
                  <div className="border-t border-secondary-200 px-4 py-5 sm:px-6">
                    <div className="space-y-4">
                      {appointment.status !== 'confirmed' && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange('confirmed')}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Confirmer le rendez-vous
                        </button>
                      )}
                      
                      {appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no_show' && (
                        <button
                          onClick={() => handleStatusChange('completed')}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Marquer comme terminé
                        </button>
                      )}
                      
                      {appointment.status !== 'no_show' && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange('no_show')}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5 text-secondary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Marquer comme absence
                        </button>
                      )}
                      
                      {appointment.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange('cancelled')}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Annuler le rendez-vous
                        </button>
                      )}
                      
                      {appointment.status === 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange('scheduled')}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Réactiver le rendez-vous
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conversation preview */}
                {conversation && (
                  <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
                    <div className="px-4 py-5 sm:px-6">
                      <h2 className="text-lg leading-6 font-medium text-secondary-900">
                        Conversation
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-secondary-500">
                        Aperçu de la conversation WhatsApp.
                      </p>
                    </div>
                    <div className="border-t border-secondary-200 px-4 py-5 sm:px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-secondary-900">
                            {conversation.client_name || conversation.client_phone}
                          </p>
                          <p className="text-xs text-secondary-500">
                            Dernier message: {formatDate(conversation.updated_at, 'PPP à HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <a
                          href={`/dashboard/conversations/${conversation.id}`}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5 text-secondary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          Voir la conversation complète
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <svg className="mx-auto h-12 w-12 text-secondary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-secondary-900">Rendez-vous non trouvé</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Le rendez-vous que vous recherchez n'existe pas ou vous n'avez pas les permissions nécessaires.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/dashboard/appointments')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Retour à la liste des rendez-vous
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {isEditModalOpen && appointment && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-secondary-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-secondary-900">
                        Modifier le rendez-vous
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="client_name" className="block text-sm font-medium text-secondary-700">
                            Nom du client *
                          </label>
                          <input
                            type="text"
                            name="client_name"
                            id="client_name"
                            required
                            value={formData.client_name}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor="client_phone" className="block text-sm font-medium text-secondary-700">
                            Téléphone *
                          </label>
                          <input
                            type="tel"
                            name="client_phone"
                            id="client_phone"
                            required
                            value={formData.client_phone}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor="client_email" className="block text-sm font-medium text-secondary-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="client_email"
                            id="client_email"
                            value={formData.client_email}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor="service_type" className="block text-sm font-medium text-secondary-700">
                            Service
                          </label>
                          <select
                            name="service_type"
                            id="service_type"
                            value={formData.service_type}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                          >
                            <option value="">Sélectionner un service</option>
                            {services.map((service) => (
                              <option key={service.id} value={service.name}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="start_time" className="block text-sm font-medium text-secondary-700">
                              Date et heure de début *
                            </label>
                            <input
                              type="datetime-local"
                              name="start_time"
                              id="start_time"
                              required
                              value={formData.start_time}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label htmlFor="end_time" className="block text-sm font-medium text-secondary-700">
                              Date et heure de fin *
                            </label>
                            <input
                              type="datetime-local"
                              name="end_time"
                              id="end_time"
                              required
                              value={formData.end_time}
                              onChange={handleInputChange}
                              min={formData.start_time}
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-secondary-700">
                            Statut *
                          </label>
                          <select
                            name="status"
                            id="status"
                            required
                            value={formData.status}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                          >
                            <option value="scheduled">Planifié</option>
                            <option value="confirmed">Confirmé</option>
                            <option value="completed">Terminé</option>
                            <option value="cancelled">Annulé</option>
                            <option value="no_show">Absence</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-secondary-700">
                            Notes
                          </label>
                          <textarea
                            name="notes"
                            id="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
