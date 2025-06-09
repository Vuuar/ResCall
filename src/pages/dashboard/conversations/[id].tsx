import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User, Conversation, Message, Appointment } from '@/types';
import { formatDate } from '@/utils/date';
import toast from 'react-hot-toast';

interface ConversationDetailProps {
  user: User | null;
}

export default function ConversationDetail({ user }: ConversationDetailProps) {
  const router = useRouter();
  const { id } = router.query;
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && id) {
      fetchConversationData();
    }
  }, [user, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversationData = async () => {
    setLoading(true);
    try {
      // Fetch conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .eq('professional_id', user?.id)
        .single();

      if (conversationError) throw conversationError;
      setConversation(conversationData);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('conversation_id', id)
        .order('start_time', { ascending: false });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error fetching conversation data:', error);
      toast.error('Erreur lors du chargement de la conversation');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      // Add message to database
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: id,
            sender_type: 'professional',
            content: newMessage,
            is_read: false,
          },
        ])
        .select();

      if (error) throw error;
      
      // Update conversation's last message and updated_at
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          last_message: newMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;
      
      // Update local state
      if (data && data[0]) {
        setMessages([...messages, data[0]]);
      }
      
      // Clear input
      setNewMessage('');
      
      // In a real app, you would also send the message to WhatsApp here
      toast.success('Message envoyé');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
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
        <title>Conversation | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center">
            <Link
              href="/dashboard/conversations"
              className="inline-flex items-center mr-4 text-sm font-medium text-primary-600 hover:text-primary-900"
            >
              <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </Link>
            <h1 className="text-2xl font-semibold text-secondary-900">Conversation</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-secondary-100 rounded-lg"></div>
              <div className="h-64 bg-secondary-100 rounded-lg"></div>
            </div>
          ) : conversation ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat section */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-[600px]">
                  {/* Chat header */}
                  <div className="px-4 py-3 border-b border-secondary-200 bg-secondary-50">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-secondary-900">
                          {conversation.client_name || 'Client sans nom'}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {conversation.client_phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-secondary-50">
                    {messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_type === 'professional' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_type === 'professional'
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-white border border-secondary-200 text-secondary-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.sender_type === 'professional' ? 'text-primary-100' : 'text-secondary-500'
                                }`}
                              >
                                {formatDate(message.created_at, 'HH:mm')}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-secondary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-secondary-900">Aucun message</h3>
                          <p className="mt-1 text-sm text-secondary-500">
                            Commencez la conversation en envoyant un message.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat input */}
                  <div className="px-4 py-3 border-t border-secondary-200 bg-white">
                    <form onSubmit={handleSendMessage} className="flex">
                      <input
                        type="text"
                        placeholder="Tapez votre message..."
                        className="flex-1 focus:ring-primary-500 focus:border-primary-500 block w-full min-w-0 rounded-md sm:text-sm border-secondary-300"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Envoyer
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Info section */}
              <div className="space-y-6">
                {/* Client info */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">Informations client</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-secondary-500">Nom</p>
                      <p className="mt-1 text-sm text-secondary-900">
                        {conversation.client_name || 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-500">Téléphone</p>
                      <p className="mt-1 text-sm text-secondary-900">{conversation.client_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-500">Email</p>
                      <p className="mt-1 text-sm text-secondary-900">
                        {conversation.client_email || 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-500">Première conversation</p>
                      <p className="mt-1 text-sm text-secondary-900">
                        {formatDate(conversation.created_at, 'PPP')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-500">Dernière activité</p>
                      <p className="mt-1 text-sm text-secondary-900">
                        {formatDate(conversation.updated_at, 'PPP à HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Appointments */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">Rendez-vous</h2>
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div key={appointment.id} className="border border-secondary-200 rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-secondary-900">
                                {formatDate(appointment.start_time, 'EEEE d MMMM yyyy')}
                              </p>
                              <p className="text-sm text-secondary-500">
                                {formatDate(appointment.start_time, 'HH:mm')} - {formatDate(appointment.end_time, 'HH:mm')}
                              </p>
                              {appointment.service_type && (
                                <p className="text-sm text-secondary-500 mt-1">
                                  Service: {appointment.service_type}
                                </p>
                              )}
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                              {getStatusLabel(appointment.status)}
                            </span>
                          </div>
                          <div className="mt-3">
                            <Link
                              href={`/dashboard/appointments/${appointment.id}`}
                              className="text-sm font-medium text-primary-600 hover:text-primary-900"
                            >
                              Voir les détails
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-secondary-500">Aucun rendez-vous</p>
                      <div className="mt-3">
                        <Link
                          href={`/dashboard/appointments/new?client_phone=${conversation.client_phone}&client_name=${conversation.client_name || ''}&conversation_id=${conversation.id}`}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Créer un rendez-vous
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">Notes IA</h2>
                  {conversation.ai_notes ? (
                    <div className="prose prose-sm max-w-none text-secondary-900">
                      <p>{conversation.ai_notes}</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-secondary-500">Aucune note générée par l'IA</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-secondary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-secondary-900">Conversation non trouvée</h3>
              <p className="mt-1 text-sm text-secondary-500">
                La conversation que vous recherchez n'existe pas ou vous n'y avez pas accès.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/conversations"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Retour aux conversations
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
