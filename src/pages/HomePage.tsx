import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { homePage } from '../data/home';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Seo } from '../components/Seo';
import { pageSeo, siteSeo } from '../data/seo';

export function HomePage() {
  const [slide, setSlide] = useState(0);
  const slides = homePage.heroSlides;

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
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

      <section className="home-hero" aria-roledescription="carousel" aria-label="Highlights">
        {slides.map((s, i) => (
          <div
            key={s.image}
            className={`home-hero__slide ${i === slide ? 'is-active' : ''}`}
            aria-hidden={i !== slide}
          >
            <PlaceholderImage
              src={s.image}
              alt=""
              className="home-hero__img"
              aspectRatio="21 / 9"
            />
          </div>
        ))}

        <div className="home-hero__overlay" aria-hidden />

        <div className="home-hero__content">
          <div className="container home-hero__inner">
            <p className="home-hero__brand">ICON-INSTITUTE</p>
            <h1>{homePage.welcome.title}</h1>
            <p className="home-hero__text">{homePage.welcome.text}</p>
            <Link to={homePage.welcome.ctaHref} className="btn btn--accent">
              {homePage.welcome.ctaLabel}
            </Link>
          </div>
        </div>

        <div className="home-hero__dots">
          {slides.map((s, i) => (
            <button
              key={s.image}
              type="button"
              className={i === slide ? 'is-active' : ''}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === slide ? 'true' : undefined}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </section>

      <section className="home-services">
        <div className="container">
          <header className="home-services__header">
            <h2>{homePage.services.title}</h2>
            <p>{homePage.services.subtitle}</p>
          </header>
          <div className="home-services__grid">
            {homePage.services.cards.map((card, i) => (
              <Link
                key={card.title}
                to={card.href}
                className="home-services__card"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <span className="home-services__more">Explore</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-quick">
        <div className="container home-quick__grid">
          {homePage.quickLinks.map((link) => (
            <Link key={link.href} to={link.href} className="home-quick__card">
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
          <Link to={homePage.projectsWorldwide.href} className="home-projects__link">
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
          <h3>{homePage.expertise.title}</h3>
          <div className="home-expertise__grid">
            {homePage.expertise.cards.map((card, i) => (
              <Link
                key={card.slug}
                to={`/expertise/${card.slug}`}
                className="home-expertise__card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <PlaceholderImage
                  src={card.image}
                  alt={card.title}
                  className="home-expertise__img"
                  aspectRatio="1 / 1"
                />
                <h4>
                  {card.title.includes(' and ')
                    ? card.title.replace(/ and /, ' and\n')
                    : card.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-news">
        <div className="container">
          <h4 className="home-news__heading">{homePage.featuredNews.title}</h4>
          <div className="home-news__grid">
            {homePage.featuredNews.items.map((item) => (
              <Link
                key={item.slug}
                to={`/news/${item.slug}`}
                className="home-news__card"
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
