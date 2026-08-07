import { Link } from 'react-router-dom';
import { footer } from '../data/footer';
import { PlaceholderImage } from './PlaceholderImage';

export function Footer() {
  return (
    <footer className="site-footer">
      <div
        className="site-footer__bg"
        style={{
          backgroundImage: `url(/images/${footer.backgroundImage})`,
        }}
      >
        <div className="site-footer__bg-fallback" aria-hidden>
          <PlaceholderImage
            src={footer.backgroundImage}
            alt=""
            className="site-footer__bg-img"
            aspectRatio="21 / 9"
          />
        </div>
      </div>

      <div className="site-footer__main">
        <div className="container site-footer__grid">
          <div className="site-footer__block">
            <span className="site-footer__icon" aria-hidden>
              ⌖
            </span>
            <div>
              <strong>ICON-INSTITUTE GmbH &amp; Co. KG</strong>
              <br />
              Consulting Gruppe
              <br />
              {footer.addressLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          </div>

          <div className="site-footer__block">
            <span className="site-footer__icon" aria-hidden>
              ☎
            </span>
            <a href={`tel:${footer.phone.replace(/\s/g, '')}`}>{footer.phone}</a>
          </div>

          <div className="site-footer__block">
            <span className="site-footer__icon" aria-hidden>
              ⎙
            </span>
            <span>{footer.fax}</span>
          </div>

          <div className="site-footer__block">
            <span className="site-footer__icon" aria-hidden>
              ✉
            </span>
            <a href={`mailto:${footer.email}`}>{footer.email}</a>
          </div>

          <div className="site-footer__block">
            <span className="site-footer__icon" aria-hidden>
              🌐
            </span>
            <a href={footer.websiteUrl} target="_blank" rel="noreferrer">
              {footer.website}
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
