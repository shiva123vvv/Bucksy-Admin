'use client';

import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users, DollarSign, MousePointer2, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Clock, Loader2 
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import { isAuthenticated } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, withRes, logsRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/withdrawals/pending'),
          api.get('/admin/logs')
        ]);
        
        const dashboardData = statsRes.data.data || statsRes.data.stats || statsRes.data;
        setData(dashboardData);
        
        const withdrawalsData = withRes.data.data || withRes.data || [];
        setRecentWithdrawals(Array.isArray(withdrawalsData) ? withdrawalsData.slice(0, 5) : []);
        
        const logsData = logsRes.data.data || logsRes.data || [];
        setRecentLogs(Array.isArray(logsData) ? logsData.slice(0, 5) : []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
      </DashboardLayout>
    );
  }

  const dashboardStats = [
    { 
      label: 'Total Users', 
      value: data?.user_overview?.total?.toLocaleString() || '0', 
      change: `+${data?.user_overview?.new_today || 0} today`, 
      icon: Users, 
      color: '#6366f1' 
    },
    { 
      label: 'Active Today', 
      value: data?.user_overview?.active_today?.toLocaleString() || '0', 
      change: `${data?.user_overview?.blocked || 0} blocked`, 
      icon: TrendingUp, 
      color: '#ec4899' 
    },
  ];

  return (
    <DashboardLayout>
      <div className="dashboard-grid">
        <style jsx>{`
          .dashboard-grid {
            display: grid;
            gap: 24px;
          }

          .stats-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 24px;
            transition: transform 0.2s;
          }

          .stat-card:hover {
            transform: translateY(-4px);
          }

          .stat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }

          .icon-box {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .stat-value {
            font-size: 28px;
            font-weight: 800;
            color: var(--text-main);
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-muted);
          }

          .stat-footer {
            margin-top: 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 700;
          }

          .positive { color: #10b981; }

          .sections-row {
            display: grid;
            grid-template-columns: 1.6fr 1fr;
            gap: 24px;
          }

          .card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 24px;
          }

          .card-title {
            font-size: 18px;
            font-weight: 800;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .transaction-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.02);
            margin-bottom: 12px;
          }

          .tx-info {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .tx-avatar {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
          }

          .tx-user {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-main);
          }

          .tx-time {
            font-size: 12px;
            color: var(--text-muted);
          }

          .tx-amount {
            font-weight: 800;
            font-size: 14px;
          }
        `}</style>

        <div className="stats-row">
          {dashboardStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="stat-card">
                <div className="stat-header">
                  <div className="icon-box" style={{ background: `${stat.color}15`, color: stat.color }}>
                    <Icon size={24} />
                  </div>
                  <div className={`stat-footer positive`}>
                    {stat.change}
                  </div>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="sections-row">
          <div className="card">
            <h3 className="card-title">Pending Withdrawals</h3>
            <div className="transaction-list">
              {recentWithdrawals.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No pending requests found.
                </div>
              )}
              {recentWithdrawals.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="tx-info">
                    <div className="tx-avatar">{tx.user?.email?.charAt(0).toUpperCase() || 'U'}</div>
                    <div>
                      <div className="tx-user">{tx.user?.email || 'Unknown User'}</div>
                      <div className="tx-time">{new Date(tx.createdAt).toLocaleString()} • {tx.payment_method}</div>
                    </div>
                  </div>
                  <div className="tx-amount" style={{ color: '#f59e0b' }}>
                    ${tx.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">System Logs</h3>
            <div className="transaction-list">
              {recentLogs.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No activity logs found.
                </div>
              )}
              {recentLogs.map((log) => (
                <div key={log.id} className="transaction-item" style={{ background: 'transparent', paddingLeft: 0, marginBottom: 16 }}>
                  <div className="tx-info">
                    <Clock size={16} color="var(--text-muted)" />
                    <div>
                      <div className="tx-user" style={{ fontSize: 13 }}>{log.action}</div>
                      <div className="tx-time">{new Date(log.createdAt).toLocaleTimeString()} • {log.target}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
