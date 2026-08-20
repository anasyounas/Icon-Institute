import { useState, type FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ApiError, api } from '../../lib/api';

function errorText(err: unknown): string {
  if (err instanceof ApiError) {
    const lines = err.detailLines;
    return lines.length ? `${err.message} ${lines.join(' ')}` : err.message;
  }
  return 'Something went wrong. Please try again.';
}

/**
 * Shown once, full-screen, when an account still carries the password an
 * administrator set for it. After the change we sign the user back in with the
 * new password automatically, so they land straight on the dashboard.
 */
export function PasswordGate() {
  const { user, login, logout } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
      // The change revokes every session — sign straight back in with the new
      // password so the user does not have to.
      const result = await login(user?.email ?? '', next);
      if (result.mfa_required) {
        // 2FA account: fall back to the normal login flow for the code step.
        await logout();
      }
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <div className="admin-gate">
      <form className="admin-gate__card" onSubmit={submit}>
        <img src="/images/logo_icon.jpg" alt="ICON-INSTITUTE" className="admin-gate__logo" />
        <h1>Choose your own password</h1>
        <p className="admin-gate__lead">
          Welcome, {user?.name}. Your current password was set for you by an
          administrator. Pick a personal one to unlock the CMS — this is the
          only step between you and the dashboard.
        </p>

        <fieldset className="admin-form" disabled={busy}>
          <label>
            Current password
            <input
              type="password"
              required
              autoFocus
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
              At least 12 characters, with an upper-case letter, a lower-case
              letter and a digit. Must not contain your email address.
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
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving & signing you in…' : 'Set password & continue'}
          </button>
          <button
            type="button"
            className="btn btn--light"
            onClick={() => void logout()}
            disabled={busy}
          >
            Sign out
          </button>
        </div>
      </form>
    </div>
  );
}
