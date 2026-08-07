import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { DEMO_CREDENTIALS_HINT, type DemoUser } from '../../data/admin/demoUsers';
import { useDemoAuth } from '../../hooks/useDemoAuth';

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
  const { user, validateCredentials, login } = useDemoAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@icon-institute.de');
  const [password, setPassword] = useState('demo2026');
  const [error, setError] = useState('');
  const [pendingUser, setPendingUser] = useState<DemoUser | null>(null);
  const [otp, setOtp] = useState('');
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % LOGIN_SLIDES.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

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
      <aside className="admin-login__visual" aria-roledescription="carousel" aria-label="Institute highlights">
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
            Sign in to manage news, projects, and institute content. Your
            session stays on this device — nothing is saved to a server.
          </p>
          <ul className="admin-login__perks">
            <li>
              <IconShield className="admin-login__perk-icon" />
              Secure demo access
            </li>
            <li>
              <IconLock className="admin-login__perk-icon" />
              Role-based preview
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
              <h1 className="admin-login__title">Sign in</h1>
            </div>
          </div>

          <p className="admin-login__subtitle">
            Enter your credentials to continue to the demo CMS.
          </p>

          <form onSubmit={onSubmit} className="admin-login__form">
            {!pendingUser ? (
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
                      autoComplete="username"
                      placeholder="admin@icon-institute.de"
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
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    autoComplete="one-time-code"
                    aria-describedby="otp-help"
                    placeholder="123456"
                  />
                </span>
                <span id="otp-help" className="admin-login__field-hint">
                  Enter the 6-digit code from your authenticator app (demo:
                  123456).
                </span>
              </label>
            )}

            {error && (
              <p className="admin-login__error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="admin-login__submit">
              <span>{pendingUser ? 'Verify & sign in' : 'Sign in'}</span>
              <IconArrowRight className="admin-login__submit-icon" />
            </button>
          </form>

          <div className="admin-login__demo">
            <p className="admin-login__demo-label">Demo credentials</p>
            <code className="admin-login__demo-code">{DEMO_CREDENTIALS_HINT}</code>
            {pendingUser && (
              <p className="admin-login__demo-otp">
                2FA demo code: <code>123456</code>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
