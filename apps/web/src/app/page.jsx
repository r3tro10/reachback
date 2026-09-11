export default function DashboardHome() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Clients</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Total Conversations</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Messages Sent</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Opted Out</h3>
          <p className="stat-value">0</p>
        </div>
      </div>
    </div>
  );
}
