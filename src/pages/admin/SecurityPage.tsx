import { useEffect, useState, type FormEvent } from 'react';
import { PanelCard } from '../../components/admin/AdminUI';
import { useAuth } from '../../hooks/useAuth';
import {
  ApiError,
  api,
  type SessionInfo,
  type TwoFactorSetup,
} from '../../lib/api';

function errorText(err: unknown): string {
  if (err instanceof ApiError) {
    const lines = err.detailLines;
    return lines.length ? `${err.message} ${lines.join(' ')}` : err.message;
  }
  return 'Something went wrong. Please try again.';
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.valueOf()) ? iso : date.toLocaleString();
}

/* ------------------------------------------------------------- password */

function PasswordCard({ mustChange }: { mustChange: boolean }) {
  const { refreshUser, logout } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (next !== confirm) {
      setError('The two new passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await api.auth.changePassword(current, next);
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
      // Changing the password ends every session, this one included.
      window.setTimeout(() => void logout(), 2500);
      await refreshUser().catch(() => undefined);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-form-card is-editing" onSubmit={submit}>
      <header className="admin-form-card__head">
        <div>
          <h2>Change your password</h2>
          <p className="admin-panel-card__sub">
            {mustChange
              ? 'Required before you can use the rest of the CMS.'
              : 'Signing you out of every device once the change is saved.'}
          </p>
        </div>
      </header>

      <fieldset className="admin-form" disabled={busy || done}>
        <label>
          Current password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </label>
        <label>
          New password
          <input
            type="password"
            required
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <span className="field-hint">
            At least 12 characters, with an upper-case letter, a lower-case letter
            and a digit. It must not contain your email address.
          </span>
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
      </fieldset>

      {error && (
        <p className="admin-login__error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-savebar">
        <button type="submit" className="btn btn--primary" disabled={busy || done}>
          {busy ? 'Saving…' : 'Update password'}
        </button>
        {done && (
          <span className="status-inline" role="status">
            Password updated — signing you out so you can sign in with it.
          </span>
        )}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ 2FA */

function TwoFactorCard() {
  const { user, refreshUser } = useAuth();
  const enabled = user?.two_factor_enabled ?? false;

  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const begin = async () => {
    setBusy(true);
    setError('');
    try {
      setSetup(await api.auth.setupTwoFactor());
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await api.auth.enableTwoFactor(code);
      setRecoveryCodes(result.recovery_codes);
      setSetup(null);
      setCode('');
      setNotice('Two-factor authentication is now active on your account.');
      await refreshUser();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const disable = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.auth.disableTwoFactor(password);
      setPassword('');
      setRecoveryCodes(null);
      setNotice('Two-factor authentication has been switched off.');
      await refreshUser();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PanelCard
      title="Two-factor authentication"
      subtitle={
        enabled
          ? 'Active — a code from your authenticator app is required at every sign-in.'
          : 'Add a second step to your sign-in using any TOTP authenticator app.'
      }
    >
      {notice && (
        <p className="status-box" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="admin-login__error" role="alert">
          {error}
        </p>
      )}

      {recoveryCodes && (
        <div className="admin-recovery-codes">
          <h3>Save your recovery codes</h3>
          <p>
            Each code signs you in once if you lose your authenticator device.
            They are shown here only this once — the server keeps hashes, not the
            codes themselves.
          </p>
          <ul>
            {recoveryCodes.map((c) => (
              <li key={c}>
                <code>{c}</code>
              </li>
            ))}
          </ul>
          <div className="admin-savebar">
            <button
              type="button"
              className="btn btn--light"
              onClick={() => {
                void navigator.clipboard?.writeText(recoveryCodes.join('\n'));
              }}
            >
              Copy all
            </button>
            <button
              type="button"
              className="btn btn--light"
              onClick={() => setRecoveryCodes(null)}
            >
              I have saved them
            </button>
          </div>
        </div>
      )}

      {!enabled && !setup && !recoveryCodes && (
        <div className="admin-savebar">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void begin()}
            disabled={busy}
          >
            {busy ? 'Preparing…' : 'Set up authenticator app'}
          </button>
        </div>
      )}

      {setup && (
        <form className="admin-form" onSubmit={confirm}>
          <p>
            Scan this code with your authenticator app, then enter the six digits
            it shows to finish. The QR code is generated on this server — nothing
            is sent to an outside service.
          </p>
          <img
            src={setup.qr_code_data_uri}
            alt="QR code for enrolling this account in your authenticator app"
            className="admin-qr"
            width={200}
            height={200}
          />
          <label>
            Can't scan? Enter this key manually
            <input type="text" readOnly value={setup.secret} />
          </label>
          <label>
            Verification code
            <input
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
          </label>
          <div className="admin-savebar">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? 'Verifying…' : 'Enable 2FA'}
            </button>
            <button
              type="button"
              className="btn btn--light"
              onClick={() => {
                setSetup(null);
                setCode('');
              }}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {enabled && (
        <form className="admin-form" onSubmit={disable}>
          <label>
            Confirm your password to switch 2FA off
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className="admin-savebar">
            <button type="submit" className="btn btn--light" disabled={busy}>
              {busy ? 'Working…' : 'Disable 2FA'}
            </button>
          </div>
        </form>
      )}
    </PanelCard>
  );
}

/* ------------------------------------------------------------- sessions */

function SessionsCard() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.auth
      .sessions()
      .then((result) => {
        if (!cancelled) setSessions(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorText(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PanelCard
      title="Active sessions"
      subtitle="Every device currently signed in as you."
      action={
        <button
          type="button"
          className="btn btn--light"
          onClick={() => void logout()}
        >
          Sign out
        </button>
      }
    >
      {error && (
        <p className="admin-login__error" role="alert">
          {error}
        </p>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Started</th>
              <th scope="col">Last used</th>
              <th scope="col">Address</th>
              <th scope="col">Device</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="admin-table__empty">
                  Loading sessions…
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={4} className="admin-table__empty">
                  No active sessions found.
                </td>
              </tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id}>
                  <td className="admin-table__num">{formatWhen(s.created_at)}</td>
                  <td className="admin-table__num">
                    {s.last_used_at ? formatWhen(s.last_used_at) : '—'}
                  </td>
                  <td>{s.ip ?? '—'}</td>
                  <td className="admin-table__truncate">{s.user_agent ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ page */

export function SecurityPage() {
  const { user } = useAuth();
  const mustChange = user?.must_change_password ?? false;

  return (
    <div className="admin-page">
      <h1>Security &amp; 2FA</h1>
      <p className="admin-banner">
        Your account security. Passwords are hashed with Argon2id, sessions
        rotate on every refresh, and repeated failed sign-ins lock the account.
      </p>

      <PasswordCard mustChange={mustChange} />

      {!mustChange && (
        <>
          <TwoFactorCard />
          <SessionsCard />
        </>
      )}

      <PanelCard title="Server-side controls">
        <ul className="admin-checklist">
          <li>HTTPS enforced site-wide (configured at the web server)</li>
          <li>HTTP Strict Transport Security (HSTS)</li>
          <li>Content Security Policy (CSP)</li>
          <li>X-Frame-Options and X-Content-Type-Options</li>
          <li>Argon2id password hashing for CMS accounts</li>
          <li>Two-factor authentication for CMS users</li>
          <li>Logging and audit trails for CMS activity</li>
          <li>Automated backups and regular security updates</li>
        </ul>
      </PanelCard>
    </div>
  );
}
