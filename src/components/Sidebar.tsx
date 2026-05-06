'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, CreditCard, Settings, 
  LogOut, ShieldCheck, ChevronRight, Activity 
} from 'lucide-react';
import { removeToken } from '../lib/auth';

const menuItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'users', label: 'Manage Users', icon: Users, path: '/users' },
  { id: 'withdrawals', label: 'Payouts', icon: CreditCard, path: '/withdrawals' },
  { id: 'referrals', label: 'Referrals', icon: Users, path: '/referrals' },
  { id: 'logs', label: 'System Logs', icon: Activity, path: '/logs' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  return (
    <aside className="sidebar">
      <style jsx>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }

        .sidebar-header {
          padding: 32px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-box {
          width: 36px;
          height: 36px;
          background: var(--primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .brand-name {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .nav-section {
          flex: 1;
          padding: 0 16px;
          margin-top: 10px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
          transition: all 0.2s;
        }

        .nav-item:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-item.active {
          color: white;
          background: var(--primary);
          box-shadow: 0 8px 20px -6px rgba(99, 102, 241, 0.4);
        }

        .nav-item.active .icon-box {
          color: white;
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid var(--border);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--error);
          font-size: 14px;
          font-weight: 700;
          transition: all 0.2s;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>

      <div className="sidebar-header">
        <div className="logo-box">
          <ShieldCheck size={20} color="white" />
        </div>
        <span className="brand-name">Bucksy Admin</span>
      </div>

      <nav className="nav-section">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link key={item.id} href={item.path}>
              <div className={`nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={20} className="icon-box" />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
