'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import ConversationThread from '@/components/ConversationThread';

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client_id');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        const response = await api.get(`/api/conversations?client_id=${clientId}`);
        setConversations(response.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [clientId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="conversations-page">
      <h1>Conversations</h1>
      {clientId && (
        <div className="conversations-list">
          {conversations.map((conv) => (
            <ConversationThread key={conv.id} conversation={conv} />
          ))}
        </div>
      )}
    </div>
  );
}
