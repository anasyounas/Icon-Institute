import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { DEMO_CREDENTIALS_HINT, type DemoUser } from '../../data/admin/demoUsers';
import { useDemoAuth } from '../../hooks/useDemoAuth';

export function AdminLoginPage() {
  const { user, validateCredentials, login } = useDemoAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@icon-institute.de');
  const [password, setPassword] = useState('demo2026');
  const [error, setError] = useState('');
  const [pendingUser, setPendingUser] = useState<DemoUser | null>(null);
  const [otp, setOtp] = useState('');

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pendingUser) {
      const result = validateCredentials(email, password);
      if (!result.ok || !result.user) {
        setError(result.error ?? 'Login failed');
        return;
      }
      if (result.user.twoFactorEnabled) {
        setPendingUser(result.user);
        return;
      }
      login(email, password);
      navigate('/admin');
      return;
    }

    if (otp.trim() !== '123456') {
      setError('Invalid authenticator code. Demo code: 123456');
      return;
    }
    login(pendingUser.email, pendingUser.password);
    navigate('/admin');
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <p className="admin-badge">Demo CMS — frontend only</p>
        <h1>ICON-INSTITUTE CMS</h1>
        <p className="muted">
          Local mini CMS preview. No data is saved to a server.
        </p>
        <p className="admin-login__hint">
          Demo credentials: <code>{DEMO_CREDENTIALS_HINT}</code>
          {pendingUser && (
            <>
              <br />
              2FA demo code: <code>123456</code>
            </>
          )}
        </p>

        <form onSubmit={onSubmit} className="admin-form">
          {!pendingUser ? (
            <>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>
            </>
          ) : (
            <label>
              Authenticator code
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                autoComplete="one-time-code"
                aria-describedby="otp-help"
              />
              <span id="otp-help" className="field-hint">
                Enter the 6-digit code from your authenticator app (demo:
                123456).
              </span>
            </label>
          )}

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--primary">
            {pendingUser ? 'Verify & sign in' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
