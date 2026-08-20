import { useEffect, useId, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { mainNavigation } from '../data/navigation';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const menuId = useId();

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-logo" aria-label="ICON-INSTITUTE home">
          <img
            src="/images/logo_icon.jpg"
            alt="ICON-INSTITUTE"
            className="site-logo__img"
          />
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id={menuId}
          className={`site-nav ${menuOpen ? 'is-open' : ''}`}
          aria-label="Main"
        >
          <ul className="site-nav__list">
            {mainNavigation.map((item) => (
              <li
                key={item.href}
                className={`site-nav__item ${item.children ? 'has-children' : ''} ${
                  openDropdown === item.label ? 'is-open' : ''
                }`}
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `site-nav__link ${isActive ? 'is-active' : ''}`
                  }
                  aria-haspopup={item.children ? 'true' : undefined}
                  aria-expanded={
                    item.children ? openDropdown === item.label : undefined
                  }
                  onClick={(e) => {
                    if (item.children && window.innerWidth <= 1110) {
                      if (openDropdown !== item.label) {
                        e.preventDefault();
                        setOpenDropdown(item.label);
                      }
                    }
                  }}
                >
                  {item.label}
                </NavLink>
                {item.children && (
                  <ul className="site-nav__dropdown">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link to={child.href}>{child.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
