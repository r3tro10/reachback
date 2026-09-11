'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import ClientCard from '@/components/ClientCard';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/api/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Clients</h1>
        <a href="/clients/new" className="btn btn-primary">
          New Client
        </a>
      </div>
      <div className="clients-grid">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
}
