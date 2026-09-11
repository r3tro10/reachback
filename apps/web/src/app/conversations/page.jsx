'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import ConversationThread from '@/components/ConversationThread';

function ConversationsList() {
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
    <>
      {clientId && (
        <div className="conversations-list">
          {conversations.map((conv) => (
            <ConversationThread key={conv.id} conversation={conv} />
          ))}
        </div>
      )}
    </>
  );
}

export default function ConversationsPage() {
  return (
    <div className="conversations-page">
      <h1>Conversations</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ConversationsList />
      </Suspense>
    </div>
  );
}
