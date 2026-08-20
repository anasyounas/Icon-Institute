import { Link } from 'react-router-dom';
import {
  expertiseAreas as bundledAreas,
  expertiseHubCards as bundledCards,
  type ExpertiseArea,
  type ExpertiseHubCard,
} from '../data/expertise';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Seo } from '../components/Seo';
import { pageSeo } from '../data/seo';
import { useReveal } from '../hooks/useReveal';
import { usePublished } from '../hooks/usePublished';

type ExpertiseContent = {
  expertiseHubCards: ExpertiseHubCard[];
  expertiseAreas: ExpertiseArea[];
};

const bundledExpertise: ExpertiseContent = {
  expertiseHubCards: bundledCards,
  expertiseAreas: bundledAreas,
};

/** Line breaks matching the original hub labels. */
function hubTitleLines(title: string): string[] {
  const known: Record<string, string[]> = {
    'Statistics, Evaluation and Social Research': [
      'Statistics, Evaluation and',
      'Social Research',
    ],
    'Economic and Employment Promotion': [
      'Economic and',
      'Employment Promotion',
    ],
    'Governance, Education and Social Development': [
      'Governance, Education and',
      'Social Development',
    ],
    'Agriculture and Rural Development': [
      'Agriculture and',
      'Rural Development',
    ],
    'Sustainability Management in Global Value and Supply Chains': [
      'Sustainability',
      'Management',
    ],
  };
  return known[title] ?? [title];
}

export function ExpertiseHubPage() {
  const { expertiseHubCards } = usePublished<ExpertiseContent>(
    '/pages/expertise',
    bundledExpertise
  );
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div className="expertise-hub" ref={revealRef}>
      <Seo {...pageSeo.expertise} />

      <section className="content-section content-section--alt expertise-hub__top">
        <div className="container">
          <h1 className="expertise-hub__heading">EXPERTISE</h1>
          <div className="expertise-hub__icon-row">
            {expertiseHubCards.map((card, i) => (
              <Link
                key={card.slug}
                to={`/expertise/${card.slug}`}
                className="expertise-hub__icon-item"
                data-reveal
                data-reveal-delay={i * 80}
              >
                <PlaceholderImage
                  src={card.image}
                  alt=""
                  className="expertise-hub__icon-img"
                  aspectRatio="1 / 1"
                />
                <p className="expertise-hub__icon-label">
                  {hubTitleLines(card.title).map((line, li, arr) => (
                    <span key={line}>
                      {line}
                      {li < arr.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {expertiseHubCards.map((card, i) => (
        <section
          key={card.slug}
          className={`content-section expertise-hub__block${
            i % 2 === 1 ? ' content-section--alt' : ''
          }`}
        >
          <div className="container expertise-hub__block-inner" data-reveal>
            <div className="expertise-hub__block-head">
              <PlaceholderImage
                src={card.image}
                alt=""
                className="expertise-hub__block-icon"
                aspectRatio="1 / 1"
              />
              <h2 className="expertise-hub__block-title">{card.title}</h2>
            </div>
            {card.highlights.length > 0 && (
              <ul className="expertise-hub__highlights">
                {card.highlights.map((h) => (
                  <li key={h}>
                    <h3>{h}</h3>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={`/expertise/${card.slug}`}
              className="btn btn--ghost-muted"
            >
              Read more
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}
