import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata = {
  title: 'Reachback Dashboard',
  description: 'AI-powered SMS outreach platform for roofers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
