'use client';

export const dynamic = 'force-dynamic';


import DashboardLayout from '../../components/DashboardLayout';
import { 
  CheckCircle2, XCircle, Clock, ExternalLink, 
  Wallet, DollarSign, ArrowRight 
} from 'lucide-react';

import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Loader2 } from 'lucide-react';

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [stats, setStats] = useState({ pending: 0, total_paid: 0 });

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const [withRes, statsRes] = await Promise.all([
        api.get(`/admin/withdrawals/${statusFilter}`),
        api.get('/admin/dashboard')
      ]);
      
      const withdrawalsData = withRes.data.data || withRes.data;
      setWithdrawals(Array.isArray(withdrawalsData) ? withdrawalsData : []);
      
      const dashboardData = statsRes.data.data || statsRes.data.stats || {};
      setStats({
        pending: dashboardData.earnings?.pending_payouts || 0,
        total_paid: dashboardData.earnings?.total_paid_out || 0
      });
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter]);

  const handleAction = async (id, action) => {
    const adminNote = action === 'reject' ? prompt('Reason for rejection?') : 'Approved by admin';
    if (action === 'reject' && !adminNote) return;

    try {
      await api.post(`/admin/withdrawals/${id}/${action}`, { adminNote });
      fetchWithdrawals();
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <DashboardLayout>
      <div className="withdrawals-page">
        <style jsx>{`
          .withdrawals-page { display: grid; gap: 24px; }
          .summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .summary-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 24px; display: flex; align-items: center; gap: 20px; }
          .icon-circle { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.03); }
          .val-label { font-size: 13px; color: var(--text-muted); font-weight: 600; }
          .val-main { font-size: 24px; font-weight: 800; color: var(--text-main); }
          
          .filter-bar { display: flex; gap: 10px; margin-bottom: 8px; }
          .filter-btn { padding: 10px 20px; border-radius: 12px; font-weight: 700; font-size: 13px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
          .filter-btn.active { background: var(--primary); color: white; border-color: var(--primary); }

          .table-container { background: var(--bg-card); border-radius: 24px; border: 1px solid var(--border); overflow: hidden; min-height: 400px; display: flex; flex-direction: column; }
          .loader-box { flex: 1; display: flex; align-items: center; justify-content: center; }
          table { width: 100%; border-collapse: collapse; text-align: left; }
          th { padding: 18px 24px; font-size: 13px; font-weight: 700; color: var(--text-muted); border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.01); }
          td { padding: 16px 24px; font-size: 14px; border-bottom: 1px solid var(--border); }
          .status-badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px; }
          .status-pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
          .status-approved { background: rgba(16, 185, 129, 0.1); color: #10b981; }
          .status-rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
          .action-group { display: flex; gap: 8px; }
          .btn-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; border: none; }
          .btn-approve { background: rgba(16, 185, 129, 0.1); color: #10b981; }
          .btn-reject { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
          .btn-approve:hover { background: #10b981; color: white; }
          .btn-reject:hover { background: #ef4444; color: white; }
        `}</style>

        <div className="summary-row">
          <div className="summary-card">
            <div className="icon-circle" style={{ color: '#f59e0b' }}><Clock size={28} /></div>
            <div>
              <div className="val-label">Pending Payouts</div>
              <div className="val-main">${stats.pending.toFixed(2)}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="icon-circle" style={{ color: '#10b981' }}><CheckCircle2 size={28} /></div>
            <div>
              <div className="val-label">Approved Total</div>
              <div className="val-main">${stats.total_paid.toFixed(2)}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="icon-circle" style={{ color: '#6366f1' }}><Wallet size={28} /></div>
            <div>
              <div className="val-label">Visible Records</div>
              <div className="val-main">{withdrawals.length} Items</div>
            </div>
          </div>
        </div>

        <div className="filter-bar">
          {['pending', 'approved', 'rejected'].map(s => (
            <button 
              key={s} 
              className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loader-box">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User / Email</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No {statusFilter} withdrawals found.</td></tr>
                )}
                {withdrawals.map((req) => (
                  <tr key={req.id}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{req.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{req.user?.name || 'No Name'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.user?.email || 'Unknown'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(req.createdAt).toLocaleString()}</div>
                    </td>
                    <td style={{ fontWeight: 800 }}>${req.amount.toFixed(2)}</td>
                    <td>
                      <span style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', fontSize: 11, fontWeight: 700 }}>
                        {req.payment_method}
                      </span>
                    </td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {req.upi_id || req.paypal_email || 'No details'}
                    </td>
                    <td>
                      <span className={`status-badge status-${req.status.toLowerCase()}`}>
                        {req.status === 'PENDING' ? <Clock size={12}/> : req.status === 'APPROVED' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'PENDING' ? (
                        <div className="action-group">
                          <button className="btn-icon btn-approve" onClick={() => handleAction(req.id, 'approve')}><CheckCircle2 size={16} /></button>
                          <button className="btn-icon btn-reject" onClick={() => handleAction(req.id, 'reject')}><XCircle size={16} /></button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Processed</span>
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
