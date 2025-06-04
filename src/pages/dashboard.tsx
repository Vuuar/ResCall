import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import AppointmentCalendar from '@/components/AppointmentCalendar';
import Layout from '@/components/Layout';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { user, loading: userLoading } = useUser();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalClients: 0,
    activeConversations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get total appointments
        const { count: totalAppointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('professional_id', user.id);
        
        if (appointmentsError) throw appointmentsError;
        
        // Get upcoming appointments
        const today = new Date();
        const { count: upcomingAppointments, error: upcomingError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('professional_id', user.id)
          .gte('start_time', today.toISOString())
          .in('status', ['scheduled', 'confirmed']);
        
        if (upcomingError) throw upcomingError;
        
        // Get total clients
        const { count: totalClients, error: clientsError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('professional_id', user.id);
        
        if (clientsError) throw clientsError;
        
        // Get active conversations
        const { count: activeConversations, error: conversationsError } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('professional_id', user.id)
          .eq('status', 'active');
        
        if (conversationsError) throw conversationsError;
        
        setStats({
          totalAppointments: totalAppointments || 0,
          upcomingAppointments: upcomingAppointments || 0,
          totalClients: totalClients || 0,
          activeConversations: activeConversations || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [user]);

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
        <div className="p-8 text-center">Veuillez vous connecter pour accéder au tableau de bord.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-500">Rendez-vous totaux</h2>
            <p className="text-3xl font-bold mt-2">{stats.totalAppointments}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-500">Rendez-vous à venir</h2>
            <p className="text-3xl font-bold mt-2">{stats.upcomingAppointments}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-500">Clients</h2>
            <p className="text-3xl font-bold mt-2">{stats.totalClients}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-500">Conversations actives</h2>
            <p className="text-3xl font-bold mt-2">{stats.activeConversations}</p>
          </div>
        </div>
        
        {/* Calendar */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Calendrier des rendez-vous</h2>
          </div>
          <AppointmentCalendar professionalId={user.id} />
        </div>
      </div>
    </Layout>
  );
}
