'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users, Shield, Loader2, Search, 
  Download, X, CheckCircle, Ban, RefreshCcw, ShieldAlert,
  Clock, DollarSign, Wallet, Flag, History
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('actions');

  // Standardized fetch to avoid duplication
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      // The backend now returns { success: true, data: [...] } or just [...]
      // To be safe, we check both.
      const data = response.data.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[Users] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserSelect = async (user: any) => {
    try {
      setDetailsLoading(true);
      setSelectedUser(user); // Optimistic partial data
      const response = await api.get(`/admin/users/${user.id}`);
      // Handle wrapped data
      const userData = response.data.data || response.data;
      setSelectedUser(userData);
      setActiveTab('actions');
    } catch (err) {
      console.error("[Users] Detail fetch failed:", err);
      // Fallback to basic user data if detail fails
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAction = async (endpoint: string, data: any = {}, successMsg: string) => {
    if (!selectedUser) return;
    try {
      const response = await api.post(`/admin/users/${selectedUser.id}/${endpoint}`, data);
      alert(successMsg);
      // Refresh details
      const detailResponse = await api.get(`/admin/users/${selectedUser.id}`);
      const userData = detailResponse.data.data || detailResponse.data;
      setSelectedUser(userData);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Action failed');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedUser) return;
    try {
      const response = await api.put(`/admin/users/${selectedUser.id}`, { status });
      const userData = response.data.data || response.data?.user || response.data;
      setSelectedUser((prev: any) => ({ ...prev, ...userData }));
      fetchUsers();
    } catch (err) {
      alert('Status update failed');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/users/export');
      const usersData = response.data;
      const headers = ['ID', 'Email', 'Name', 'USD', 'Coins', 'Tokens', 'Role', 'Status', 'Joined'];
      const csvContent = [
        headers.join(','),
        ...usersData.map((u: any) => [
          u.id,
          `"${u.email}"`,
          `"${u.name || ''}"`,
          u.wallet_balance || 0,
          u.coins || 0,
          u.tokens_balance || 0,
          u.role,
          u.status,
          new Date(u.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Export failed');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(search.toLowerCase()) || 
                          u.name?.toLowerCase().includes(search.toLowerCase()) ||
                          u.id.toString().includes(search);
    if (filter === 'all') return matchesSearch;
    return matchesSearch && u.status === filter;
  });

  return (
    <DashboardLayout>
      <div className="admin-container">
        <style jsx>{`
          .admin-container { padding: 32px; max-width: 1600px; margin: 0 auto; }
          .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
          .header-info h1 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 4px; }
          .header-info p { color: rgba(255,255,255,0.5); font-size: 14px; }

          .action-bar { display: flex; gap: 16px; margin-bottom: 24px; align-items: center; }
          .search-wrapper { position: relative; flex: 1; }
          .search-wrapper input { width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px 16px 12px 44px; color: #fff; font-size: 14px; transition: all 0.2s; }
          .search-wrapper input:focus { border-color: #6366f1; background: rgba(15, 23, 42, 0.8); outline: none; }
          .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); }

          .filter-chips { display: flex; gap: 8px; }
          .chip { padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.5); }
          .chip.active { background: #6366f1; color: #fff; border-color: #6366f1; }

          .user-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; }
          .user-card { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 24px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
          .user-card:hover { transform: translateY(-4px); border-color: rgba(99, 102, 241, 0.4); background: rgba(30, 41, 59, 0.6); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); }
          .user-card.selected { border-color: #6366f1; background: rgba(99, 102, 241, 0.05); }

          .card-header { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; }
          .avatar { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 18px; }
          .user-meta h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 2px; }
          .user-meta p { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 500; }

          .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
          .stat-item { background: rgba(255,255,255,0.02); padding: 12px; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
          .stat-label { font-size: 9px; font-weight: 800; color: rgba(255,255,255,0.3); text-transform: uppercase; display: block; margin-bottom: 4px; }
          .stat-value { font-size: 14px; font-weight: 700; color: #fff; }

          .badge { position: absolute; top: 16px; right: 16px; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
          .badge-active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
          .badge-banned { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

          .detail-panel { position: fixed; right: 0; top: 0; width: 500px; height: 100vh; background: #0f172a; border-left: 1px solid rgba(255,255,255,0.1); z-index: 50; padding: 40px; overflow-y: auto; box-shadow: -40px 0 80px rgba(0,0,0,0.8); animation: panelIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes panelIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

          .panel-close { position: absolute; top: 32px; right: 32px; color: rgba(255,255,255,0.3); cursor: pointer; transition: color 0.2s; }
          .panel-close:hover { color: #fff; }

          .tabs { display: flex; gap: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 32px; }
          .tab { padding-bottom: 12px; font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.4); cursor: pointer; position: relative; }
          .tab.active { color: #6366f1; }
          .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #6366f1; }

          .action-group { margin-bottom: 32px; }
          .action-group h4 { font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.2); text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.05em; }
          .ctrl-btn { width: 100%; padding: 14px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: #fff; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 12px; margin-bottom: 10px; transition: all 0.2s; }
          .ctrl-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(99, 102, 241, 0.4); }
          .ctrl-btn.danger { color: #ef4444; border-color: rgba(239, 68, 68, 0.1); }
          .ctrl-btn.danger:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }

          .log-item { background: rgba(255,255,255,0.02); padding: 16px; border-radius: 14px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.04); }
          .log-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .log-title { font-weight: 700; font-size: 13px; color: #fff; }
          .log-time { font-size: 11px; color: rgba(255,255,255,0.3); }
          .log-detail { font-size: 12px; color: rgba(255,255,255,0.5); }
        `}</style>

        <div className="page-header">
          <div className="header-info">
            <h1>User Management</h1>
            <p>Monitor and manage {users.length} production users.</p>
          </div>
          <button className="ctrl-btn" style={{ width: 'auto' }} onClick={handleExport}>
            <Download size={18} />
            Export CSV
          </button>
        </div>

        <div className="action-bar">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search users by name, email, or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-chips">
            {['all', 'active', 'banned'].map(f => (
              <div 
                key={f} 
                className={`chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Loader2 className="animate-spin" size={40} color="#6366f1" />
          </div>
        ) : (
          <div className="user-list">
            {filteredUsers.map(user => (
              <div 
                key={user.id} 
                className={`user-card ${selectedUser?.id === user.id ? 'selected' : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                <div className={`badge badge-${user.status || 'active'}`}>
                  {user.status || 'active'}
                </div>
                <div className="card-header">
                  <div className="avatar">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <div className="user-meta">
                    <h3>{user.name || 'Incognito User'}</h3>
                    <p>{user.email}</p>
                  </div>
                </div>
                <div className="stat-grid">
                  <div className="stat-item">
                    <span className="stat-label">USD Balance</span>
                    <span className="stat-value">${(user.wallet_balance || 0).toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Coins</span>
                    <span className="stat-value">{(user.coins || 0).toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Tokens</span>
                    <span className="stat-value">{(user.tokens_balance || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
                    ID: #{user.id} • Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  {user.is_flagged && <Flag size={14} color="#ef4444" fill="#ef4444" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedUser && (
          <div className="detail-panel">
            <X className="panel-close" size={24} onClick={() => setSelectedUser(null)} />
            
            <div className="card-header" style={{ marginBottom: 40 }}>
              <div className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
                {selectedUser.email?.[0].toUpperCase()}
              </div>
              <div className="user-meta">
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{selectedUser.name || 'User Profile'}</h2>
                <p style={{ fontSize: 14 }}>{selectedUser.email}</p>
              </div>
            </div>

            <div className="tabs">
              <div className={`tab ${activeTab === 'actions' ? 'active' : ''}`} onClick={() => setActiveTab('actions')}>Controls</div>
              <div className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Activity</div>
              <div className={`tab ${activeTab === 'payouts' ? 'active' : ''}`} onClick={() => setActiveTab('payouts')}>Payouts</div>
            </div>

            {detailsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <Loader2 className="animate-spin" size={32} color="#6366f1" />
              </div>
            ) : (
              <div className="panel-content">
                {activeTab === 'actions' && (
                  <>
                    <div className="action-group">
                      <h4>Account Security</h4>
                      <button 
                        className="ctrl-btn" 
                        onClick={() => handleUpdateStatus(selectedUser.status === 'banned' ? 'active' : 'banned')}
                      >
                        {selectedUser.status === 'banned' ? <CheckCircle size={18} color="#10b981" /> : <Ban size={18} color="#ef4444" />}
                        {selectedUser.status === 'banned' ? 'Activate Account' : 'Suspend Account'}
                      </button>
                      <button 
                        className="ctrl-btn"
                        onClick={() => handleAction('flag', { is_flagged: !selectedUser.is_flagged }, 'User flag updated')}
                      >
                        <Flag size={18} color={selectedUser.is_flagged ? '#ef4444' : '#fff'} />
                        {selectedUser.is_flagged ? 'Unflag User' : 'Flag for Investigation'}
                      </button>
                    </div>

                    <div className="action-group">
                      <h4>Balance Management</h4>
                      <button className="ctrl-btn" onClick={() => {
                        const amt = prompt('Add/Remove Coins (e.g. 500 or -500)');
                        if (amt) handleAction('adjust', { coins: parseInt(amt) }, 'Coins adjusted');
                      }}>
                        <DollarSign size={18} color="#f59e0b" />
                        Adjust Coins
                      </button>
                      <button className="ctrl-btn" onClick={() => {
                        const amt = prompt('Add/Remove USD Balance (e.g. 1.50 or -1.50)');
                        if (amt) handleAction('adjust', { wallet: parseFloat(amt) }, 'Wallet adjusted');
                      }}>
                        <Wallet size={18} color="#10b981" />
                        Adjust USD Wallet
                      </button>
                    </div>

                    <div className="action-group">
                      <h4>System Overrides</h4>
                      <button className="ctrl-btn" onClick={() => handleAction('reset', {}, 'Daily limits cleared')}>
                        <RefreshCcw size={18} color="#6366f1" />
                        Reset Daily Limits
                      </button>
                      <button className="ctrl-btn" onClick={() => handleAction('reset-spins', {}, 'Spins reset to 5')}>
                        <History size={18} color="#a855f7" />
                        Reset Lucky Spins
                      </button>
                    </div>
                  </>
                )}

                {activeTab === 'history' && (
                  <div className="action-group">
                    <h4>Earning History</h4>
                    {(selectedUser.earnings_history || []).length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No recent activity logs found.</p>
                    ) : (
                      selectedUser.earnings_history.map((log: any, i: number) => (
                        <div key={i} className="log-item">
                          <div className="log-header">
                            <span className="log-title">{log.source || 'General Reward'}</span>
                            <span className="log-time">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="log-detail" style={{ color: '#10b981', fontWeight: 700 }}>
                            +{(log.points || 0).toLocaleString()} Coins
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'payouts' && (
                  <div className="action-group">
                    <h4>Withdrawal Records</h4>
                    {(selectedUser.withdrawals || []).length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No withdrawal history found.</p>
                    ) : (
                      selectedUser.withdrawals.map((w: any, i: number) => (
                        <div key={i} className="log-item">
                          <div className="log-header">
                            <span className="log-title">{w.payment_method}</span>
                            <span className="log-time">{new Date(w.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="log-header" style={{ marginTop: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: w.status === 'APPROVED' ? '#10b981' : w.status === 'PENDING' ? '#f59e0b' : '#ef4444' }}>
                              {w.status}
                            </span>
                            <span style={{ fontWeight: 800, fontSize: 14 }}>${(Number(w.amount) || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
