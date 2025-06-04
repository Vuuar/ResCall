import React from 'react';
import { useUser } from '@/hooks/useUser';
import Layout from '@/components/Layout';
import ConversationList from '@/components/ConversationList';

export default function Conversations() {
  const { user, loading: userLoading } = useUser();

  if (userLoading) {
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

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Conversations WhatsApp</h1>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Conversations récentes</h2>
          </div>
          
          <ConversationList professionalId={user.id} />
        </div>
      </div>
    </Layout>
  );
}
