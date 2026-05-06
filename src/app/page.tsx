'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid credentials or unauthorized access.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top left, #1e1b4b, #0f172a);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--bg-card);
          border: 1px border var(--border);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logo-section {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-icon {
          width: 64px;
          height: 64px;
          background: var(--primary);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
        }

        h1 {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.025em;
        }

        p.subtitle {
          color: var(--text-muted);
          font-size: 14px;
          margin-top: 4px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 8px;
          padding-left: 4px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 12px 12px 42px;
          color: var(--text-main);
          font-size: 15px;
          transition: all 0.2s;
        }

        input:focus {
          border-color: var(--primary);
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--error);
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 20px;
          text-align: center;
        }

        .login-btn {
          width: 100%;
          background: var(--primary);
          color: white;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          margin-top: 10px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-btn:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-1px);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .footer-note {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: var(--text-muted);
        }
      `}</style>

      <div className="login-card">
        <div className="logo-section">
          <div className="logo-icon">
            <LayoutDashboard size={32} color="white" />
          </div>
          <h1>Admin Console</h1>
          <p className="subtitle">Welcome back, administrator.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin" />
                Signing in...
              </>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        <p className="footer-note">
          Secured with Firebase Authentication
        </p>
      </div>
    </div>
  );
}
