import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="site">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
