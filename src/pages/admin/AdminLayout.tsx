import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { adminNav } from '../../data/admin/adminNav';
import { useDemoAuth } from '../../hooks/useDemoAuth';
import { useState } from 'react';

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
  const { user, logout } = useDemoAuth();
  const [navOpen, setNavOpen] = useState(false);

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

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
            src="/logo.jpg"
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
          <div className="admin-topbar__user">
            <span className="admin-topbar__meta">
              CMS · {user.role}
            </span>
            <button
              type="button"
              className="admin-signout"
              onClick={logout}
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
    </div>
  );
}
