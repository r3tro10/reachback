'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function ClientDetailPage() {
  const params = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await api.get(`/api/clients/${params.id}`);
        setClient(response.data);
      } catch (error) {
        console.error('Failed to fetch client:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div className="client-detail-page">
      <h1>{client.name}</h1>
      <div className="client-info">
        <p><strong>Phone:</strong> {client.phone}</p>
        <p><strong>Email:</strong> {client.email}</p>
        <p><strong>Status:</strong> {client.status}</p>
      </div>
      <div className="client-actions">
        <a href={`/kb/${client.id}`} className="btn">
          Edit Knowledge Base
        </a>
      </div>
    </div>
  );
}
