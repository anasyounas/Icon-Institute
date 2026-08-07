import { Link } from 'react-router-dom';
import { expertiseHubCards } from '../data/expertise';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';

export function ExpertiseHubPage() {
  return (
    <div className="expertise-hub">
      <PageHero title="EXPERTISE" compact />
      <section className="content-section">
        <div className="container expertise-hub__grid">
          {expertiseHubCards.map((card) => (
            <article key={card.slug} className="expertise-hub__card">
              <PlaceholderImage
                src={card.image}
                alt={card.title}
                aspectRatio="4 / 3"
              />
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
          ))}
        </div>
      </section>
    </div>
  );
}
