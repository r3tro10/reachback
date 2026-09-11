'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function ConversationDetailPage() {
  const params = useParams();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await api.get(`/api/conversations/${params.id}`);
        setConversation(response.data);
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!conversation) return <div>Conversation not found</div>;

  return (
    <div className="conversation-detail-page">
      <h1>Conversation Thread</h1>
      <div className="messages">
        {conversation.messages?.map((msg) => (
          <div key={msg.id} className={`message message-${msg.direction}`}>
            <p>{msg.content}</p>
            <small>{new Date(msg.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
