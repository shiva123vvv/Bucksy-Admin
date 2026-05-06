'use client';

import { useEffect, useState } from 'react';
import api from '../../utils/api';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users, UserPlus, Gift, TrendingUp, 
  Search, Filter, Loader2, CheckCircle, XCircle 
} from 'lucide-react';

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/referrals');
      setReferrals(response.data);
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/admin/referrals/${id}`, { status });
      fetchReferrals();
    } catch (err) {
      alert('Failed to update referral status');
    }
  };

  const filtered = referrals.filter(r => 
    r.referrer?.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.referred_user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="referrals-page">
        <style jsx>{`
          .referrals-page { display: grid; gap: 24px; }
          
          .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 24px; display: flex; align-items: center; gap: 20px; }
          .icon-circle { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.03); }
          .val-label { font-size: 13px; color: var(--text-muted); font-weight: 600; }
          .val-main { font-size: 24px; font-weight: 800; color: var(--text-main); }

          .toolbar { display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); padding: 16px 24px; border-radius: 20px; border: 1px solid var(--border); }
          .search-bar { display: flex; align-items: center; gap: 12px; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border); padding: 8px 16px; border-radius: 12px; width: 320px; }
          .search-bar input { background: none; border: none; color: var(--text-main); font-size: 14px; width: 100%; outline: none; }

          .table-container { background: var(--bg-card); border-radius: 24px; border: 1px solid var(--border); overflow: hidden; min-height: 400px; display: flex; flex-direction: column; }
          table { width: 100%; border-collapse: collapse; text-align: left; }
          th { padding: 18px 24px; font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); background: rgba(255, 255, 255, 0.01); }
          td { padding: 16px 24px; font-size: 14px; border-bottom: 1px solid var(--border); }
          
          .user-link { font-weight: 700; color: var(--text-main); display: block; }
          .user-sub { font-size: 12px; color: var(--text-muted); }

          .badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .badge-pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
          .badge-completed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
          .badge-rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

          .action-group { display: flex; gap: 8px; }
          .btn-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; border: none; }
          .btn-success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
          .btn-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
          .btn-success:hover { background: #10b981; color: white; }
          .btn-error:hover { background: #ef4444; color: white; }
        `}</style>

        <div className="stats-row">
          <div className="stat-card">
            <div className="icon-circle" style={{ color: '#6366f1' }}><UserPlus size={28} /></div>
            <div>
              <div className="val-label">Total Referrals</div>
              <div className="val-main">{referrals.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="icon-circle" style={{ color: '#10b981' }}><Gift size={28} /></div>
            <div>
              <div className="val-label">Today New</div>
              <div className="val-main">{referrals.filter(r => new Date(r.createdAt).toDateString() === new Date().toDateString()).length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="icon-circle" style={{ color: '#f59e0b' }}><TrendingUp size={28} /></div>
            <div>
              <div className="val-label">Pending Rewards</div>
              <div className="val-main">{referrals.filter(r => r.status === 'pending').length}</div>
            </div>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-bar">
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by referrer or referred email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
              <Loader2 className="animate-spin" size={48} />
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Referrer</th>
                  <th>Referred User</th>
                  <th>Date</th>
                  <th>Reward Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No referral records found.</td></tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="user-link">{r.referrer?.email || 'N/A'}</span>
                      <span className="user-sub">ID: #{r.referrer_id}</span>
                    </td>
                    <td>
                      <span className="user-link">{r.referred_user?.email || 'N/A'}</span>
                      <span className="user-sub">ID: #{r.referred_id}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge badge-${r.status}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === 'pending' && (
                        <div className="action-group">
                          <button className="btn-icon btn-success" onClick={() => handleUpdateStatus(r.id, 'completed')} title="Approve Reward">
                            <CheckCircle size={16} />
                          </button>
                          <button className="btn-icon btn-error" onClick={() => handleUpdateStatus(r.id, 'rejected')} title="Reject Reward">
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
