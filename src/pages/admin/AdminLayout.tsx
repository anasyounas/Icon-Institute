import { NavLink, Navigate, Outlet, Link } from 'react-router-dom';
import { adminNav } from '../../data/admin/adminNav';
import { useDemoAuth } from '../../hooks/useDemoAuth';
import { useState } from 'react';

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
          <strong>ICON CMS</strong>
          <span className="admin-badge">Demo</span>
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
            <span>
              {user.name} · {user.role}
            </span>
            <Link to="/" className="text-link">
              View site
            </Link>
            <button type="button" className="btn btn--light" onClick={logout}>
              Sign out
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
