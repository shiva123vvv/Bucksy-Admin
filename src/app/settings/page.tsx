'use client';

import { useEffect, useState } from 'react';
import api from '../../utils/api';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Save, Shield, Bell, Zap, 
  Smartphone, Globe, Database, Loader2 
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/admin/settings');
        setSettings(response.data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each setting (or we could add a bulk save endpoint, 
      // but the controller expects one by one or we can just iterate)
      for (const [key, value] of Object.entries(settings)) {
        await api.post('/admin/settings', { key, value });
      }
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="settings-page">
        <style jsx>{`
          .settings-page { max-width: 800px; display: grid; gap: 32px; }
          .settings-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 32px; }
          .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
          .section-icon { color: var(--primary); }
          .section-title { font-size: 18px; font-weight: 800; color: var(--text-main); }
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .form-group { display: flex; flex-direction: column; gap: 8px; }
          .form-group.full { grid-column: span 2; }
          label { font-size: 13px; font-weight: 700; color: var(--text-muted); padding-left: 4px; }
          input, select { background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; color: var(--text-main); font-size: 14px; transition: all 0.2s; outline: none; }
          input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
          .toggle-group { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: rgba(255, 255, 255, 0.02); border-radius: 16px; border: 1px solid var(--border); }
          .toggle-info h4 { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
          .toggle-info p { font-size: 12px; color: var(--text-muted); }
          .footer-actions { position: sticky; bottom: 32px; background: var(--bg-card); border: 1px solid var(--border); padding: 16px 24px; border-radius: 20px; display: flex; justify-content: flex-end; box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5); z-index: 10; }
          .btn-save { background: var(--primary); color: white; padding: 12px 32px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 10px; transition: all 0.2s; cursor: pointer; border: none; }
          .btn-save:hover { background: var(--primary-hover); transform: scale(1.02); }
          .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        `}</style>

        <div className="settings-section">
          <div className="section-header">
            <Zap className="section-icon" size={20} />
            <h3 className="section-title">Economy Settings</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Coin Value (in USD)</label>
              <input type="text" value={settings.COIN_VALUE || ''} onChange={(e) => handleChange('COIN_VALUE', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Token Value (in USD)</label>
              <input type="text" value={settings.TOKEN_VALUE || ''} onChange={(e) => handleChange('TOKEN_VALUE', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Min. Withdrawal ($)</label>
              <input type="text" value={settings.MIN_WITHDRAWAL_USD || ''} onChange={(e) => handleChange('MIN_WITHDRAWAL_USD', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Referral Bonus (Coins)</label>
              <input type="text" value={settings.REFERRAL_REWARD || ''} onChange={(e) => handleChange('REFERRAL_REWARD', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <Smartphone className="section-icon" size={20} />
            <h3 className="section-title">App Configuration</h3>
          </div>
          <div className="form-grid">
            <div className="form-group full">
              <div className="toggle-group">
                <div className="toggle-info">
                  <h4>Maintenance Mode</h4>
                  <p>Disable all client app features temporarily.</p>
                </div>
                <input type="checkbox" checked={settings.MAINTENANCE_MODE === 'true'} onChange={(e) => handleChange('MAINTENANCE_MODE', e.target.checked ? 'true' : 'false')} />
              </div>
            </div>
            <div className="form-group">
              <label>App Version</label>
              <input type="text" value={settings.APP_VERSION || ''} onChange={(e) => handleChange('APP_VERSION', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Update URL</label>
              <input type="text" value={settings.APP_UPDATE_URL || ''} onChange={(e) => handleChange('APP_UPDATE_URL', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="footer-actions">
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
