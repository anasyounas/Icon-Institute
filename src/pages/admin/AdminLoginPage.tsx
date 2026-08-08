import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../lib/api';

const LOGIN_SLIDES = [
  {
    src: '/header (1).jpg',
    alt: 'ICON-INSTITUTE consulting work',
  },
  {
    src: '/header (2).jpg',
    alt: 'ICON-INSTITUTE training and capacity building',
  },
  {
    src: '/header (3).jpg',
    alt: 'ICON-INSTITUTE international development projects',
  },
] as const;

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m5 7 7 5.5L19 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10V7.5a4 4 0 0 1 8 0V10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="1.25" fill="currentColor" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5 19 6.5v5.2c0 4.4-2.9 8.2-7 9.3-4.1-1.1-7-4.9-7-9.3V6.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m9.2 12.2 1.9 1.9 3.7-3.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminLoginPage() {
  const { status, user, login, verifyMfa } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  /** Set once the password is accepted and an authenticator code is outstanding. */
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [code, setCode] = useState('');

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % LOGIN_SLIDES.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  if (status === 'restoring') {
    return (
      <div className="admin-login-loading" role="status">
        <span className="admin-spinner" aria-hidden />
        <p>Restoring your session…</p>
      </div>
    );
  }

  if (status === 'authenticated' && user) {
    return <Navigate to="/admin" replace />;
  }

  const describe = (err: unknown): string => {
    if (err instanceof ApiError) {
      const lines = err.detailLines;
      return lines.length ? `${err.message} ${lines.join(' ')}` : err.message;
    }
    return 'Sign-in failed. Please try again.';
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      if (!mfaToken) {
        const result = await login(email, password);
        if (result.mfa_required) {
          setMfaToken(result.mfa_token);
          setPassword('');
        } else {
          navigate('/admin', { replace: true });
        }
        return;
      }

      await verifyMfa(mfaToken, code);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(describe(err));
      // An expired or spent challenge sends the user back to the password step.
      if (err instanceof ApiError && err.code === 'authentication_failed' && mfaToken) {
        setMfaToken(null);
        setCode('');
      }
    } finally {
      setBusy(false);
    }
  };

  const startOver = () => {
    setMfaToken(null);
    setCode('');
    setError('');
  };

  return (
    <div className="admin-login">
      <aside
        className="admin-login__visual"
        aria-roledescription="carousel"
        aria-label="Institute highlights"
      >
        {LOGIN_SLIDES.map((item, i) => (
          <div
            key={item.src}
            className={`admin-login__slide ${i === slide ? 'is-active' : ''}`}
            aria-hidden={i !== slide}
          >
            <img src={item.src} alt="" className="admin-login__slide-img" />
          </div>
        ))}

        <div className="admin-login__shade" aria-hidden />

        <div className="admin-login__visual-content">
          <p className="admin-login__eyebrow">ICON-INSTITUTE CMS</p>
          <h2 className="admin-login__welcome">Welcome back</h2>
          <p className="admin-login__lead">
            Sign in to manage news, projects, jobs and institute content. The CMS
            runs on ICON-INSTITUTE's own server — no content leaves the building.
          </p>
          <ul className="admin-login__perks">
            <li>
              <IconShield className="admin-login__perk-icon" />
              Two-factor protected
            </li>
            <li>
              <IconLock className="admin-login__perk-icon" />
              Role-based access
            </li>
          </ul>
        </div>

        <div className="admin-login__dots" role="tablist" aria-label="Slideshow">
          {LOGIN_SLIDES.map((item, i) => (
            <button
              key={item.src}
              type="button"
              className={i === slide ? 'is-active' : ''}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === slide ? 'true' : undefined}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </aside>

      <main className="admin-login__panel">
        <div className="admin-login__panel-inner">
          <Link to="/" className="admin-login__back">
            ← Back to website
          </Link>

          <div className="admin-login__brand-row">
            <img
              src="/logo.jpg"
              alt="ICON-INSTITUTE"
              className="admin-login__logo"
            />
            <div>
              <p className="admin-login__panel-kicker">Content management</p>
              <h1 className="admin-login__title">
                {mfaToken ? 'Two-step verification' : 'Sign in'}
              </h1>
            </div>
          </div>

          <p className="admin-login__subtitle">
            {mfaToken
              ? 'Enter the 6-digit code from your authenticator app to finish signing in.'
              : 'Enter your credentials to continue to the CMS.'}
          </p>

          <form onSubmit={onSubmit} className="admin-login__form">
            {!mfaToken ? (
              <>
                <label className="admin-login__field">
                  <span className="admin-login__label">Email</span>
                  <span className="admin-login__input-wrap">
                    <IconMail className="admin-login__input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={busy}
                      autoComplete="username"
                      autoFocus
                      placeholder="name@icon-institute.de"
                    />
                  </span>
                </label>
                <label className="admin-login__field">
                  <span className="admin-login__label">Password</span>
                  <span className="admin-login__input-wrap">
                    <IconLock className="admin-login__input-icon" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={busy}
                      autoComplete="current-password"
                      placeholder="••••••••"
                    />
                  </span>
                </label>
              </>
            ) : (
              <label className="admin-login__field">
                <span className="admin-login__label">Authenticator code</span>
                <span className="admin-login__input-wrap">
                  <IconShield className="admin-login__input-icon" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    disabled={busy}
                    autoComplete="one-time-code"
                    autoFocus
                    aria-describedby="otp-help"
                    placeholder="123456"
                  />
                </span>
                <span id="otp-help" className="admin-login__field-hint">
                  Lost your device? Enter one of your recovery codes instead.
                </span>
              </label>
            )}

            {error && (
              <p className="admin-login__error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="admin-login__submit" disabled={busy}>
              <span>
                {busy
                  ? 'Please wait…'
                  : mfaToken
                    ? 'Verify & sign in'
                    : 'Sign in'}
              </span>
              <IconArrowRight className="admin-login__submit-icon" />
            </button>

            {mfaToken && (
              <button
                type="button"
                className="admin-login__secondary"
                onClick={startOver}
                disabled={busy}
              >
                Use a different account
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
