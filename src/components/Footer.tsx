import { Link } from 'react-router-dom';
import { footer as bundledFooter, type FooterData } from '../data/footer';
import { usePublished } from '../hooks/usePublished';
import {
  GlobeIcon,
  MailIcon,
  PhoneIcon,
  PrinterIcon,
} from './Icons';

export function Footer() {
  // Edited under Content & Media → Footer; the bundled copy is the fallback
  // until the published version arrives.
  const footer = usePublished<FooterData>('/pages/footer', bundledFooter);

  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="container site-footer__grid">
          <div className="site-footer__brand">
            <p className="site-footer__name">{footer.name}</p>
            <p className="site-footer__tagline">{footer.tagline}</p>
            <address className="site-footer__address">
              {footer.addressLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </address>
          </div>

          <div className="site-footer__contacts">
            <a
              className="site-footer__contact"
              href={`tel:${footer.phone.replace(/\s/g, '')}`}
            >
              <span className="site-footer__icon" aria-hidden>
                <PhoneIcon />
              </span>
              <span>
                <span className="site-footer__label">Phone</span>
                {footer.phone}
              </span>
            </a>

            <div className="site-footer__contact">
              <span className="site-footer__icon" aria-hidden>
                <PrinterIcon />
              </span>
              <span>
                <span className="site-footer__label">Fax</span>
                {footer.fax}
              </span>
            </div>

            <a className="site-footer__contact" href={`mailto:${footer.email}`}>
              <span className="site-footer__icon" aria-hidden>
                <MailIcon />
              </span>
              <span>
                <span className="site-footer__label">Email</span>
                {footer.email}
              </span>
            </a>

            <a
              className="site-footer__contact"
              href={footer.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="site-footer__icon" aria-hidden>
                <GlobeIcon />
              </span>
              <span>
                <span className="site-footer__label">Web</span>
                {footer.website}
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="site-footer__bar">
        <div className="container site-footer__bar-inner">
          <span>{footer.copyright}</span>
          <span className="site-footer__legal">
            {footer.legalLinks.map((link, i) => (
              <span key={link.href}>
                {i > 0 && ' '}
                <Link to={link.href}>{link.label}</Link>
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
