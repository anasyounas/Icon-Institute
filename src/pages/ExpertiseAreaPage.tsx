import { Link } from 'react-router-dom';
import { expertiseHubCards } from '../data/expertise';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Seo } from '../components/Seo';
import { pageSeo } from '../data/seo';
import { useReveal } from '../hooks/useReveal';
import { getExpertiseIcon } from '../components/iconMap';

export function ExpertiseHubPage() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div className="expertise-hub" ref={revealRef}>
      <Seo {...pageSeo.expertise} />
      <PageHero title="EXPERTISE" compact />
      <section className="content-section">
        <div className="container expertise-hub__grid">
          {expertiseHubCards.map((card, i) => {
            const { Icon, accent } = getExpertiseIcon(card.slug);
            return (
            <article
              key={card.slug}
              className="expertise-hub__card"
              data-reveal
              data-reveal-delay={i * 80}
            >
              <span className="expertise-hub__media">
                <PlaceholderImage
                  src={card.image}
                  alt={card.title}
                  aspectRatio="4 / 3"
                />
                <span
                  className={`icon-tile icon-tile--${accent} expertise-hub__icon`}
                  aria-hidden="true"
                >
                  <Icon />
                </span>
              </span>
              <h3>{card.title}</h3>
              {card.highlights.length > 0 && (
                <ul className="bullet-list">
                  {card.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              <Link to={`/expertise/${card.slug}`} className="btn btn--primary">
                Read more
              </Link>
            </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
