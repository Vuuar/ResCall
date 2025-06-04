import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  is_from_client: boolean;
  created_at: string;
  message_type: string;
  voice_url?: string;
}

interface ConversationViewProps {
  conversationId: string;
  professionalId: string;
}

export default function ConversationView({ conversationId, professionalId }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages and conversation details
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Get conversation details
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();
        
        if (conversationError) throw conversationError;
        setConversation(conversationData);
        
        // Get messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        setMessages(messagesData);
        
        // Mark messages as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .eq('is_from_client', true)
          .eq('is_read', false);
      } catch (err) {
        console.error('Error fetching conversation data:', err);
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    }
    
    if (conversationId) {
      fetchData();
      
      // Set up real-time subscription for new messages
      const subscription = supabase
        .channel(`conversation:${conversationId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, (payload) => {
          setMessages(current => [...current, payload.new as Message]);
          
          // Mark client messages as read
          if ((payload.new as Message).is_from_client) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', (payload.new as Message).id);
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a new message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      
      // Get professional's phone number
      const { data: professional, error: professionalError } = await supabase
        .from('professionals')
        .select('phone_number')
        .eq('id', professionalId)
        .single();
      
      if (professionalError) throw professionalError;
      
      // Save message to database
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            content: newMessage,
            is_from_client: false,
            message_type: 'text',
          },
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Send message via WhatsApp
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': professionalId,
        },
        body: JSON.stringify({
          to: conversation.client_phone,
          message: newMessage,
          from: professional.phone_number,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-4">Chargement de la conversation...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">
          {conversation.client_name || conversation.client_phone}
        </h2>
        <p className="text-sm text-gray-500">
          {conversation.client_phone}
        </p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.is_from_client ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-xs sm:max-w-md rounded-lg px-4 py-2 ${
                message.is_from_client
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {message.message_type === 'voice' && message.voice_url ? (
                <div>
                  <audio controls src={message.voice_url} className="w-full" />
                  <p className="mt-2">{message.content}</p>
                </div>
              ) : (
                <p>{message.content}</p>
              )}
              <p
                className={`text-xs mt-1 ${
                  message.is_from_client ? 'text-gray-500' : 'text-indigo-200'
                }`}
              >
                {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t">
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {sending ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}
