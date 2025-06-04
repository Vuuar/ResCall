import React from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/hooks/useUser';
import Layout from '@/components/Layout';
import ConversationList from '@/components/ConversationList';
import ConversationView from '@/components/ConversationView';

export default function ConversationDetail() {
  const router = useRouter();
  const { id } = router.query;
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-[calc(100vh-64px)]">
        {/* Conversation list */}
        <div className="md:col-span-1 lg:col-span-1 border-r overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Conversations</h2>
          </div>
          <ConversationList professionalId={user.id} selectedId={id as string} />
        </div>
        
        {/* Conversation view */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col">
          {id ? (
            <ConversationView conversationId={id as string} professionalId={user.id} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Sélectionnez une conversation pour afficher les messages
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
