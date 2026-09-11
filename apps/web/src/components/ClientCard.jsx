import Link from 'next/link';
import './ClientCard.css';

export default function ClientCard({ client }) {
  return (
    <div className="client-card">
      <h3>{client.name}</h3>
      <p className="phone">{client.phone}</p>
      <p className="email">{client.email}</p>
      <div className="card-actions">
        <Link href={`/clients/${client.id}`} className="btn btn-sm">
          View
        </Link>
        <Link href={`/kb/${client.id}`} className="btn btn-sm">
          KB
        </Link>
      </div>
    </div>
  );
}
