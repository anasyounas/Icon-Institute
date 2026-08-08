import { Link, useParams } from 'react-router-dom';
import { expertiseAreas as bundledAreas, type ExpertiseArea } from '../data/expertise';
import { PageHero } from '../components/PageHero';
import { Accordion } from '../components/Accordion';
import { Seo } from '../components/Seo';
import { siteSeo } from '../data/seo';
import { usePublished } from '../hooks/usePublished';

export function ExpertiseDetailPage() {
  const { slug } = useParams();
  const { expertiseAreas } = usePublished<{ expertiseAreas: ExpertiseArea[] }>(
    '/pages/expertise',
    { expertiseAreas: bundledAreas }
  );
  const area = slug ? expertiseAreas.find((a) => a.slug === slug) : undefined;

  if (!area) {
    return (
      <div className="content-section container">
        <h1>Expertise not found</h1>
        <Link to="/expertise">Back to Expertise</Link>
      </div>
    );
  }

  return (
    <div className="expertise-area">
      <Seo
        title={`${area.title} | Expertise | ICON-INSTITUTE`}
        description={area.intro[0] ?? area.title}
        path={`/expertise/${area.slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: area.title,
          provider: { '@type': 'Organization', name: siteSeo.siteName },
        }}
      />
      <PageHero
        title={area.title}
        image={area.heroImage}
        imageAlt={area.title}
      />
      <section className="content-section">
        <div className="container narrow">
          {area.intro.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}

          <Accordion
            items={area.sections.map((section) => ({
              id: section.title,
              title: section.title,
              children: (
                <div>
                  {section.items && (
                    <ul className="bullet-list">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.subsections?.map((sub) => (
                    <div key={sub.title} className="expertise-area__sub">
                      <h4>{sub.title}</h4>
                      <ul className="bullet-list">
                        {sub.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ),
            }))}
          />

          <p className="back-link">
            <Link to="/expertise">← All expertise areas</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
