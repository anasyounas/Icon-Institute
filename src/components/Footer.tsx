import { Link } from 'react-router-dom';
import { footer as bundledFooter, type FooterData } from '../data/footer';
import { usePublished } from '../hooks/usePublished';
import { assetUrl } from '../lib/api';
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
      <div  className="site-footer__main"
            style={{
              backgroundImage: `linear-gradient(hsla(220, 10%, 40%, 0.6), hsla(220, 10%, 40%, 0.6)), url(${assetUrl(footer.backgroundImage)})`,
                   }}>
        <div className="container site-footer__grid">
          <div className="site-footer__brand">
            <span className="site-footer__icon" aria-hidden><GlobeIcon /></span>
            <address className="site-footer__address">
              {footer.name}<br />{footer.tagline}<br />
              {footer.addressLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </address>
          </div>

          <div className="site-footer__contacts site-footer__contacts--phone">
            <a
              className="site-footer__contact"
              href={`tel:${footer.phone.replace(/\s/g, '')}`}
            >
              <span className="site-footer__icon" aria-hidden>
                <PhoneIcon />
              </span>
              <span>{footer.phone}</span>
            </a>

            <div className="site-footer__contact">
              <span className="site-footer__icon" aria-hidden>
                <PrinterIcon />
              </span>
              <span>{footer.fax}</span>
            </div>
          </div>

          <div className="site-footer__contacts site-footer__contacts--web">
            <a className="site-footer__contact" href={`mailto:${footer.email}`}>
              <span className="site-footer__icon" aria-hidden>
                <MailIcon />
              </span>
              <span>{footer.email}</span>
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
              <span>{footer.website}</span>
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
            <Link to="/admin/login">CMS Login</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
