'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="loader-container">
        <Loader2 size={40} className="spin" color="#6366f1" />
        <style jsx>{`
          .loader-container {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-main);
          }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-bar">
          <div className="page-info">
            <h2 className="breadcrumb">Pages / Dashboard</h2>
            <h1 className="page-title">Overview</h1>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <input type="text" placeholder="Search data..." />
            </div>
          </div>
        </header>
        <div className="content-inner animate-fade-in">
          {children}
        </div>
      </main>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 32px;
          background: var(--bg-main);
        }

        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .breadcrumb {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
          margin-bottom: 4px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .search-box input {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 16px;
          color: var(--text-main);
          font-size: 14px;
          width: 260px;
          transition: all 0.2s;
        }

        .search-box input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .content-inner {
          max-width: 1200px;
        }
      `}</style>
    </div>
  );
}
