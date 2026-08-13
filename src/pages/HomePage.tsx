import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { homePage as bundledHome, type HomePage as HomeData } from '../data/home';
import { newsItems as bundledNews, type NewsItem } from '../data/news';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Seo } from '../components/Seo';
import { pageSeo, siteSeo } from '../data/seo';
import { useReveal } from '../hooks/useReveal';
import { usePublished } from '../hooks/usePublished';
import { SparkIcon } from '../components/Icons';
import { getExpertiseIcon, getServiceIcon } from '../components/iconMap';

export function HomePage() {
  // Text and images are CMS-managed (Content & Media Editor → Home); the
  // featured news strip always shows the three latest published articles.
  const cmsHome = usePublished<HomeData>('/pages/home', bundledHome);
  const latestNews = usePublished<NewsItem[]>('/news', bundledNews);
  const homePage: HomeData = {
    ...bundledHome,
    ...cmsHome,
    featuredNews: {
      title: cmsHome.featuredNews?.title ?? bundledHome.featuredNews.title,
      items: latestNews.slice(0, 3),
    },
  };

  const [slide, setSlide] = useState(0);
  const slides = homePage.heroSlides;
  const revealRef = useReveal<HTMLDivElement>();

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  return (
    <div className="home" ref={revealRef}>
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
        <div className="container home-hero__inner">
          <p className="home-hero__brand">
            <SparkIcon className="home-hero__brand-icon" />
            Consulting Gruppe · Since 1975
          </p>

          <h1>
            ICON-
            <span className="home-hero__mark">
              <span className="home-hero__mark-text">INSTITUTE</span>
              <span className="home-hero__mark-bar" aria-hidden="true" />
            </span>
          </h1>

          <p className="home-hero__text">{homePage.welcome.text}</p>

          <div className="home-hero-triple">
            {slides.map((s) => (
              <div key={s.overlayWord} className="home-hero-triple__item">
                <img src={s.image} alt="" className="home-hero-triple__img" />
                <h2 className="home-hero-triple__word">{s.overlayWord}</h2>
              </div>
            ))}
          </div>

          <div className="home-hero__actions">
            <Link to={homePage.welcome.ctaHref} className="btn btn--accent">
              {homePage.welcome.ctaLabel}
            </Link>
            <Link to={homePage.projectsWorldwide.href} className="btn btn--light">
              {homePage.projectsWorldwide.title}
            </Link>
          </div>
        </div>
      </section>

      <section className="home-services">
        <div className="container">
          <header className="home-services__header" data-reveal>
            <h2>{homePage.services.title}</h2>
            <p>{homePage.services.subtitle}</p>
          </header>
          <div className="home-services__grid">
            {homePage.services.cards.map((card, i) => {
              const { Icon, accent } = getServiceIcon(card.title);
              return (
                <Link
                  key={card.title}
                  to={card.href}
                  className="home-services__card"
                  data-reveal
                  data-reveal-delay={i * 90}
                >
                  <span className={`icon-tile icon-tile--${accent}`} aria-hidden="true">
                    <Icon />
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <span className="home-services__more">Explore</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-quick">
        <div className="container home-quick__grid">
          {homePage.quickLinks.map((link, i) => (
            <Link
              key={link.href}
              to={link.href}
              className="home-quick__card"
              data-reveal
              data-reveal-delay={i * 90}
            >
              <PlaceholderImage
                src={link.image}
                alt={link.label}
                className="home-quick__img"
              />
              <span className="home-quick__label">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-projects">
        <div className="container">
          <Link
            to={homePage.projectsWorldwide.href}
            className="home-projects__link"
            data-reveal
          >
            <PlaceholderImage
              src={homePage.projectsWorldwide.image}
              alt={homePage.projectsWorldwide.title}
              className="home-projects__img"
            />
            <h2>{homePage.projectsWorldwide.title}</h2>
          </Link>
        </div>
      </section>

      <section className="home-expertise">
        <div className="container">
          <h3 data-reveal>{homePage.expertise.title}</h3>
          <div className="home-expertise__grid">
            {homePage.expertise.cards.map((card, i) => {
              const { Icon, accent } = getExpertiseIcon(card.slug);
              return (
                <Link
                  key={card.slug}
                  to={`/expertise/${card.slug}`}
                  className="home-expertise__card"
                  data-reveal
                  data-reveal-delay={i * 70}
                >
                  <span className="home-expertise__media">
                    <PlaceholderImage
                      src={card.image}
                      alt={card.title}
                      className="home-expertise__img"
                      aspectRatio="1 / 1"
                    />
                    <span
                      className={`icon-tile icon-tile--${accent} home-expertise__icon`}
                      aria-hidden="true"
                    >
                      <Icon />
                    </span>
                  </span>
                  <h4>
                    {card.title.includes(' and ')
                      ? card.title.replace(/ and /, ' and\n')
                      : card.title}
                  </h4>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-news">
        <div className="container">
          <h4 className="home-news__heading" data-reveal>
            {homePage.featuredNews.title}
          </h4>
          <div className="home-news__grid">
            {homePage.featuredNews.items.map((item, i) => (
              <Link
                key={item.slug}
                to={`/news/${item.slug}`}
                className="home-news__card"
                data-reveal
                data-reveal-delay={i * 90}
              >
                <PlaceholderImage
                  src={item.image ?? 'news-placeholder.jpg'}
                  alt={item.title}
                  className="home-news__img"
                  aspectRatio="1 / 1"
                />
                <h3>{item.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
