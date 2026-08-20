import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { adminNav } from '../../data/admin/adminNav';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { GlobeIcon } from '../../components/Icons';
import { PasswordGate } from './PasswordGate';
import { ToastHost } from '../../components/admin/Toast';

/** Longest matching nav href wins, so nested routes still resolve to a section. */
function currentSection(pathname: string) {
  const exact = adminNav.find((item) => item.href === pathname);
  if (exact) return exact.label;

  const prefix = adminNav
    .filter((item) => item.href !== '/admin' && pathname.startsWith(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return prefix?.label ?? 'Dashboard';
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17l5-5-5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12H9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminLayout() {
  const { status, user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  if (status === 'restoring') {
    return (
      <div className="admin-login-loading" role="status">
        <span className="admin-spinner" aria-hidden />
        <p>Loading the CMS…</p>
      </div>
    );
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  // A seeded or admin-reset account picks its own password before anything
  // else — one focused screen, then straight to the dashboard.
  if (user.must_change_password) {
    return <PasswordGate />;
  }

  const section = currentSection(location.pathname);

  const groups = [
    { id: 'main' as const, label: 'Overview' },
    { id: 'content' as const, label: 'Content modules' },
    { id: 'system' as const, label: 'Workflow & system' },
  ];

  return (
    <div className="admin-shell">
      <a href="#admin-main" className="skip-link">
        Skip to admin content
      </a>
      <aside className={`admin-sidebar ${navOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar__brand">
          <img
            src="/images/logo_icon.jpg"
            alt="ICON-INSTITUTE"
            className="admin-sidebar__logo"
          />
        </div>
        <nav aria-label="CMS">
          {groups.map((g) => (
            <div key={g.id} className="admin-nav-group">
              <p className="admin-nav-group__label">{g.label}</p>
              <ul>
                {adminNav
                  .filter((item) => item.group === g.id)
                  .map((item) => (
                    <li key={item.href}>
                      <NavLink
                        to={item.href}
                        end={item.href === '/admin'}
                        onClick={() => setNavOpen(false)}
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="admin-main-wrap">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-nav-toggle"
            aria-expanded={navOpen}
            aria-label="Toggle CMS menu"
            onClick={() => setNavOpen((v) => !v)}
          >
            Menu
          </button>

          <div className="admin-topbar__heading">
            <p className="admin-topbar__crumb">
              <span className="admin-topbar__dot" aria-hidden="true" />
              CMS
            </p>
            <h2 className="admin-topbar__title">{section}</h2>
          </div>

          <div className="admin-topbar__user">
            <Link
              to="/"
              className="admin-topbar__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GlobeIcon className="admin-topbar__link-icon" />
              View site
            </Link>

            <span className="admin-topbar__divider" aria-hidden="true" />

            <span className="admin-topbar__identity">
              <span className="admin-topbar__avatar" aria-hidden="true">
                {initials(user.name)}
              </span>
              <span className="admin-topbar__who">
                <span className="admin-topbar__name">{user.name}</span>
                <span className="admin-topbar__role">{user.role}</span>
              </span>
            </span>

            <button
              type="button"
              className="admin-signout"
              onClick={() => void logout()}
              aria-label="Sign out"
              title="Sign out"
            >
              <SignOutIcon className="admin-signout__icon" />
            </button>
          </div>
        </header>
        <main id="admin-main" className="admin-content">
          <Outlet />
        </main>
      </div>
      <ToastHost />
    </div>
  );
}
