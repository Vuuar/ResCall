import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import AppointmentForm from '@/components/AppointmentForm';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AppointmentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: userLoading } = useUser();
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function fetchAppointment() {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            clients (id, first_name, last_name, phone_number, email),
            services (id, name, duration, price, color)
          `)
          .eq('id', id)
          .eq('professional_id', user.id)
          .single();
        
        if (error) throw error;
        setAppointment(data);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAppointment();
  }, [id, user]);

  const handleConfirm = async () => {
    if (!id || !user) return;
    
    try {
      setIsConfirming(true);
      
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('professional_id', user.id);
      
      if (error) throw error;
      
      // Send confirmation message
      const response = await fetch(`/api/appointments/${id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm appointment');
      }
      
      toast.success('Rendez-vous confirmé');
      router.reload();
    } catch (err) {
      console.error('Error confirming appointment:', err);
      toast.error('Erreur lors de la confirmation du rendez-vous');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !user) return;
    
    try {
      setIsCancelling(true);
      
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('professional_id', user.id);
      
      if (error) throw error;
      
      // Send cancellation message
      const response = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel appointment');
      }
      
      toast.success('Rendez-vous annulé');
      router.reload();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      toast.error('Erreur lors de l\'annulation du rendez-vous');
    } finally {
      setIsCancelling(false);
    }
  };

  if (userLoading || loading) {
    return (
      <Layout>
        <div className="p-8 text-center">Chargement...</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="p-8 text-center">Veuillez vous connecter pour accéder à cette page.</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-500">{error}</div>
      </Layout>
    );
  }

  if (!appointment) {
    return (
      <Layout>
        <div className="p-8 text-center">Rendez-vous non trouvé</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Détails du rendez-vous</h1>
          <div className="space-x-2">
            {appointment.status === 'scheduled' && (
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isConfirming ? 'Confirmation...' : 'Confirmer'}
              </button>
            )}
            
            {['scheduled', 'confirmed'].includes(appointment.status) && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isCancelling ? 'Annulation...' : 'Annuler'}
              </button>
            )}
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>
        </div>
        
        {isEditing ? (
          <div className="bg-white rounded-lg shadow p-6">
            <AppointmentForm
              professionalId={user.id}
              appointmentId={id as string}
              onSuccess={() => {
                setIsEditing(false);
                router.reload();
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Informations du rendez-vous</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Service</p>
                    <p className="font-medium">{appointment.services?.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Date et heure</p>
                    <p className="font-medium">
                      {format(new Date(appointment.start_time), 'EEEE d MMMM yyyy', { locale: fr })}
                      {' à '}
                      {format(new Date(appointment.start_time), 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Durée</p>
                    <p className="font-medium">{appointment.services?.duration} minutes</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Prix</p>
                    <p className="font-medium">{(appointment.services?.price / 100).toFixed(2)}€</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <p className={`font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">Informations du client</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-medium">
                      {appointment.clients?.first_name} {appointment.clients?.last_name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{appointment.clients?.phone_number}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{appointment.clients?.email}</p>
                  </div>
                </div>
                
                {appointment.notes && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium mb-2">Notes</h3>
                    <p className="text-gray-700 whitespace-pre-line">{appointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'Planifié';
    case 'confirmed':
      return 'Confirmé';
    case 'cancelled':
      return 'Annulé';
    case 'completed':
      return 'Terminé';
    default:
      return status;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'text-blue-600';
    case 'confirmed':
      return 'text-green-600';
    case 'cancelled':
      return 'text-red-600';
    case 'completed':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}
