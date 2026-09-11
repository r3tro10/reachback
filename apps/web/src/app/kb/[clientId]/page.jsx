'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import KBEditor from '@/components/KBEditor';

export default function KBPage() {
  const params = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKB = async () => {
      try {
        const response = await api.get(`/api/kb?client_id=${params.clientId}`);
        setEntries(response.data);
      } catch (error) {
        console.error('Failed to fetch KB:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKB();
  }, [params.clientId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="kb-page">
      <h1>Knowledge Base</h1>
      <KBEditor clientId={params.clientId} entries={entries} onUpdate={setEntries} />
    </div>
  );
}
