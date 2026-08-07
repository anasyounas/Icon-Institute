import { Link, useParams } from 'react-router-dom';
import { newsItems } from '../data/news';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Seo } from '../components/Seo';
import { siteSeo } from '../data/seo';

export function NewsDetailPage() {
  const { slug } = useParams();
  const item = newsItems.find((n) => n.slug === slug);

  if (!item) {
    return (
      <div className="content-section container">
        <h1>Article not found</h1>
        <Link to="/news">Back to News</Link>
      </div>
    );
  }

  return (
    <div className="news-detail">
      <Seo
        title={`${item.title} | News | ICON-INSTITUTE`}
        description={
          item.excerpt ??
          `${item.title} — ICON-INSTITUTE news, ${item.dateLabel}.`
        }
        path={`/news/${item.slug}`}
        type="article"
        image={
          item.image
            ? `/images/${item.image}`
            : siteSeo.defaultImage
        }
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: item.title,
          datePublished: item.date,
          publisher: {
            '@type': 'Organization',
            name: siteSeo.siteName,
          },
        }}
      />
      <PageHero title={item.title} compact />
      <section className="content-section">
        <div className="container narrow">
          <time dateTime={item.date}>{item.dateLabel}</time>
          <PlaceholderImage
            src={item.image ?? 'news-placeholder.jpg'}
            alt={item.title}
            className="news-detail__img"
          />
          <p>
            {item.excerpt ??
              'Full article body will be added when news content assets are provided. This entry mirrors the title and date from the live ICON-INSTITUTE news listing.'}
          </p>
          <p className="back-link">
            <Link to="/news">← Back to News</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
