import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { homePage as bundledHome, type HomePage as HomeData } from '../data/home';
import { newsItems as bundledNews, type NewsItem } from '../data/news';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Seo } from '../components/Seo';
import { pageSeo, siteSeo } from '../data/seo';
import { usePublished } from '../hooks/usePublished';
import { assetUrl } from '../lib/api';

/** Short labels used on the live homepage icon row. */
const EXPERTISE_HOME_TITLES: Record<string, string> = {
  'sustainability-management': 'Sustainability Management',
};

export function HomePage() {
  const cmsHome = usePublished<HomeData>('/pages/home', bundledHome);
  const latestNews = usePublished<NewsItem[]>('/news', bundledNews);
  const newsItems =
    Array.isArray(latestNews) && latestNews.length > 0 ? latestNews : bundledNews;
  const homePage: HomeData = {
    ...bundledHome,
    featuredNews: {
      title: cmsHome.featuredNews?.title ?? bundledHome.featuredNews.title,
      items: newsItems.slice(0, 3),
    },
  };

  const slides = homePage.heroSlides;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % slides.length),
      5600,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="home">
      <Seo
        {...pageSeo.home}
        jsonLd={[
          siteSeo.organization,
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteSeo.siteName,
            url: siteSeo.siteUrl,
          },
        ]}
      />

      <section className="home-hero" aria-label="Highlights">
        <div className="home-hero__slider">
          {slides.map((s, index) => (
            <div
              key={s.overlayWord}
              className={`home-hero-triple__item ${index === activeSlide ? 'is-active' : ''}`}
              aria-hidden={index !== activeSlide}
            >
              <img
                src={assetUrl(s.image)}
                alt=""
                className="home-hero-triple__img"
                loading="eager"
                fetchPriority="high"
              />
              <h2 className="home-hero-triple__word">{s.overlayWord}</h2>
            </div>
          ))}
        </div>
      </section>

      <section className="home-welcome">
        <div className="container">
          <h3>{homePage.welcome.title}</h3>
          <p>{homePage.welcome.text}</p>
          <Link to={homePage.welcome.ctaHref}>{homePage.welcome.ctaLabel}</Link>
        </div>
      </section>

      <div className="home-body">
        <div className="container home-body__inner">
          <div className="home-mid-grid">
            <section className="home-quick home-mid-grid__quick">
              <div className="home-quick__grid">
                {homePage.quickLinks.map((link) => (
                  <Link key={link.href} to={link.href} className="home-quick__card">
                    <PlaceholderImage
                      src={link.image}
                      alt={link.label}
                      className="home-quick__img"
                    />
                    <h6 className="home-quick__label">{link.label}</h6>
                  </Link>
                ))}
              </div>
            </section>

            <section className="home-projects home-mid-grid__projects">
              <Link to={homePage.projectsWorldwide.href} className="home-projects__link">
                <PlaceholderImage
                  src={homePage.projectsWorldwide.image}
                  alt={homePage.projectsWorldwide.title}
                  className="home-projects__img"
                />
                <h2>{homePage.projectsWorldwide.title}</h2>
              </Link>
            </section>

            <aside className="home-news home-mid-grid__news">
              <h4 className="home-news__heading">{homePage.featuredNews.title}</h4>
              <div className="home-news__grid">
                {homePage.featuredNews.items.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/news/${item.slug}`}
                    className="home-news__card"
                  >
                    <PlaceholderImage
                      src={item.image ?? 'ipa2022bckgr-600x600.jpg'}
                      alt={item.title}
                      className="home-news__img"
                      aspectRatio="3 / 2"
                    />
                    <h3>{item.title}</h3>
                  </Link>
                ))}
              </div>
            </aside>
          </div>

          <section className="home-expertise">
            <h3>{homePage.expertise.title}</h3>
            <div className="home-expertise__grid">
              {homePage.expertise.cards.map((card) => (
                <Link
                  key={card.slug}
                  to={`/expertise/${card.slug}`}
                  className="home-expertise__card"
                >
                  <span className="home-expertise__media">
                    <PlaceholderImage
                      src={card.image}
                      alt={card.title}
                      className="home-expertise__img"
                      aspectRatio="1 / 1"
                    />
                  </span>
                  <p className="home-expertise__title">
                    {EXPERTISE_HOME_TITLES[card.slug] ?? card.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
