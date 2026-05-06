'use client';

import { useEffect, useState } from 'react';
import api from '../../utils/api';
import DashboardLayout from '../../components/DashboardLayout';
import { Activity, Clock, User, Target, Loader2 } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/admin/logs');
        setLogs(response.data);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <DashboardLayout>
      <div className="logs-page">
        <style jsx>{`
          .logs-page { display: grid; gap: 24px; }
          .header { margin-bottom: 8px; }
          .header h1 { font-size: 24px; font-weight: 800; color: var(--text-main); }
          .header p { color: var(--text-muted); font-size: 14px; }
          
          .logs-container {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 24px;
            overflow: hidden;
          }

          .log-item {
            padding: 16px 24px;
            border-bottom: 1px solid var(--border);
            display: grid;
            grid-template-columns: 180px 1fr 150px;
            align-items: center;
            gap: 20px;
            transition: background 0.2s;
          }
          .log-item:hover { background: rgba(255, 255, 255, 0.02); }
          .log-item:last-child { border-bottom: none; }

          .log-time { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 13px; font-weight: 600; }
          .log-action { font-weight: 700; color: var(--text-main); font-size: 14px; }
          .log-target { color: var(--primary); font-size: 13px; font-weight: 600; }
          
          .log-details { font-size: 12px; color: var(--text-muted); grid-column: 2; margin-top: -8px; opacity: 0.8; }
        `}</style>

        <div className="header">
          <h1>System Logs</h1>
          <p>Real-time audit trail of all administrative actions.</p>
        </div>

        <div className="logs-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
              <Loader2 className="animate-spin" size={48} />
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 100, color: 'var(--text-muted)' }}>No logs found.</div>
          ) : (
            <div className="logs-list">
              <div className="log-item" style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action & Target</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admin ID</span>
              </div>
              {logs.map((log) => (
                <div key={log.id} className="log-item">
                  <div className="log-time">
                    <Clock size={14} />
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <div className="log-action">{log.action}</div>
                    <div className="log-target">{log.target}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                    Admin #{log.admin_id}
                  </div>
                  {log.details && (
                    <div className="log-details">
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
