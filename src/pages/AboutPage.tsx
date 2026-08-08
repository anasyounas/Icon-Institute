import { useEffect, useState } from 'react';
import { aboutPage as bundledAbout, type AboutPage as AboutData } from '../data/about';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Accordion } from '../components/Accordion';
import { Seo } from '../components/Seo';
import { pageSeo } from '../data/seo';
import { usePublished } from '../hooks/usePublished';

export function AboutPage() {
  // All About Us content — texts, history, values, memberships, images — is
  // CMS-managed (Content & Media Editor → About Us).
  const aboutPage = usePublished<AboutData>('/pages/about', bundledAbout);
  const [historyYear, setHistoryYear] = useState(aboutPage.history[0]?.year);

  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const active =
    aboutPage.history.find((h) => h.year === historyYear) ??
    aboutPage.history[0];

  return (
    <div className="about-page">
      <Seo {...pageSeo.about} />
      <PageHero
        title="ABOUT US"
        image={aboutPage.heroImage}
        imageAlt="About ICON-INSTITUTE"
      />

      <section id="what-we-do" className="content-section">
        <div className="container split">
          <div>
            <h2>What We Do</h2>
            {aboutPage.whatWeDo.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          {aboutPage.whatWeDoImage && (
            <PlaceholderImage
              src={aboutPage.whatWeDoImage}
              alt="ICON-INSTITUTE consulting services"
              className="about-page__img"
              aspectRatio="1 / 1"
            />
          )}
        </div>
      </section>

      <section id="our-team" className="content-section content-section--alt">
        <div className="container split">
          <div>
            <h2>Our Team</h2>
            {aboutPage.ourTeam.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <PlaceholderImage
            src={aboutPage.teamImage}
            alt="ICON-INSTITUTE team"
            className="about-page__team-img"
            aspectRatio="1 / 1"
          />
        </div>
      </section>

      <section id="company-history" className="content-section">
        <div className="container">
          <h2>Company History</h2>
          <div className="history-timeline">
            <div className="history-timeline__years">
              {aboutPage.history.map((h) => (
                <button
                  key={h.year}
                  type="button"
                  className={h.year === historyYear ? 'is-active' : ''}
                  onClick={() => setHistoryYear(h.year)}
                >
                  {h.year}
                </button>
              ))}
            </div>
            <div className="history-timeline__detail">
              <h3>{active.year}</h3>
              <p>{active.text}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="corporate-values" className="content-section content-section--alt">
        <div className="container">
          <h2>Corporate Values</h2>
          <div className="values-grid">
            {aboutPage.values.map((v) => (
              <div key={v.title} className="values-grid__item">
                <PlaceholderImage
                  src={v.image}
                  alt={v.title}
                  aspectRatio="16 / 10"
                />
                <h4>{v.title}</h4>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
          <p className="muted">
            Trademark: ICON-INSTITUT® and GET German Education and Training®
          </p>
        </div>
      </section>

      <section id="memberships" className="content-section">
        <div className="container">
          <h2>Our Memberships</h2>
          <p>
            The company, its staff and experts are members of and contribute to
            the following institutions and societies:
          </p>
          <ul className="bullet-list">
            {aboutPage.memberships.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <Accordion
            items={aboutPage.memberships.details.map((d) => ({
              id: d.name,
              title: d.name,
              children: (
                <div className="membership-detail">
                  {d.logo && (
                    <PlaceholderImage
                      src={d.logo}
                      alt={d.name}
                      className="membership-detail__logo"
                      aspectRatio="3 / 1"
                    />
                  )}
                  <p>{d.description}</p>
                </div>
              ),
            }))}
          />
        </div>
      </section>
    </div>
  );
}
