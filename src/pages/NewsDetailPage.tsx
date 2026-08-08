import { Link, useParams } from 'react-router-dom';
import { newsItems as bundledNews, type NewsItem } from '../data/news';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Seo } from '../components/Seo';
import { siteSeo } from '../data/seo';
import { usePublished } from '../hooks/usePublished';

type PublishedNews = NewsItem & { body?: string[] };

export function NewsDetailPage() {
  const { slug } = useParams();
  const newsItems = usePublished<PublishedNews[]>('/news', bundledNews);
  const item = newsItems.find((n) => n.slug === slug);

  if (!item) {
    return (
      <div className="content-section container">
        <h1>Article not found</h1>
        <Link to="/news">Back to News</Link>
      </div>
    );
  }

  const body = item.body?.filter((p) => p.trim()) ?? [];

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
            ? item.image.startsWith('/') || item.image.startsWith('http')
              ? item.image
              : `/images/${item.image}`
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
          {body.length > 0 ? (
            body.map((paragraph) => (
              <p key={paragraph.slice(0, 60)}>{paragraph}</p>
            ))
          ) : (
            <p>
              {item.excerpt ??
                'The full article text has not been added yet. This entry mirrors the title and date from the ICON-INSTITUTE news listing.'}
            </p>
          )}
          <p className="back-link">
            <Link to="/news">← Back to News</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
