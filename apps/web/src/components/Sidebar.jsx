import Link from 'next/link';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Reachback</h2>
      </div>
      <nav className="sidebar-nav">
        <Link href="/" className="nav-item">
          Dashboard
        </Link>
        <Link href="/clients" className="nav-item">
          Clients
        </Link>
        <Link href="/conversations" className="nav-item">
          Conversations
        </Link>
      </nav>
    </aside>
  );
}
