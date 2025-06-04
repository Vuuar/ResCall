import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

interface Conversation {
  id: string;
  client_name: string;
  client_phone: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: string;
}

interface ConversationListProps {
  professionalId: string;
  selectedId?: string;
}

export default function ConversationList({ professionalId, selectedId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true);
        
        // Get conversations with last message
        const { data, error } = await supabase
          .rpc('get_conversations_with_last_message', {
            p_professional_id: professionalId
          });
        
        if (error) throw error;
        
        setConversations(data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    }
    
    if (professionalId) {
      fetchConversations();
      
      // Set up real-time subscription for new messages
      const subscription = supabase
        .channel('public:messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `professional_id=eq.${professionalId}`
        }, () => {
          fetchConversations();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [professionalId]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Aucune conversation
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/conversations/${conversation.id}`}
          className={`block p-4 hover:bg-gray-50 ${
            selectedId === conversation.id ? 'bg-indigo-50' : ''
          }`}
        >
          <div className="flex justify-between">
            <div className="font-medium">
              {conversation.client_name || conversation.client_phone}
              {conversation.unread_count > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {conversation.unread_count}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(conversation.last_message_time), {
                addSuffix: true,
                locale: fr,
              })}
            </div>
          </div>
          <div className="mt-1 text-sm text-gray-600 truncate">
            {conversation.last_message}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {conversation.status === 'active' ? (
              <span className="text-green-500">Active</span>
            ) : (
              <span className="text-gray-500">Fermée</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
