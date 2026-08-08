import { Link, useParams } from 'react-router-dom';
import { newsItems as bundledNews, type NewsItem } from '../data/news';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { RichParagraphs } from '../components/RichText';
import { Seo } from '../components/Seo';
import { siteSeo } from '../data/seo';
import { usePublished } from '../hooks/usePublished';
import { assetUrl } from '../lib/api';
import { DownloadIcon, MailIcon } from '../components/Icons';

/** The article as the CMS publishes it. */
type PublishedNews = NewsItem & {
  author?: string | null;
  body?: string[];
  attachment?: string | null;
  attachment_label?: string | null;
  contact_email?: string | null;
};

export function NewsDetailPage() {
  const { slug } = useParams();
  const newsItems = usePublished<PublishedNews[]>('/news', bundledNews);
  const item = newsItems.find((n) => n.slug === slug);

  if (!item) {
    return (
      <div className="content-section container">
        <h1>Article not found</h1>
        <p className="back-link">
          <Link to="/news">← Back to News</Link>
        </p>
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
          image: item.image ? assetUrl(item.image) : undefined,
          author: item.author
            ? { '@type': 'Person', name: item.author }
            : { '@type': 'Organization', name: siteSeo.siteName },
          publisher: {
            '@type': 'Organization',
            name: siteSeo.siteName,
          },
        }}
      />
      <PageHero title={item.title} compact />

      <section className="content-section">
        <div className="container narrow">
          <p className="news-detail__meta">
            <time dateTime={item.date}>{item.dateLabel}</time>
            {item.author && (
              <>
                <span aria-hidden="true"> · </span>
                <span className="news-detail__author">{item.author}</span>
              </>
            )}
          </p>

          <PlaceholderImage
            src={item.image ?? 'news-placeholder.jpg'}
            alt={item.title}
            className="news-detail__img"
          />

          {item.excerpt && <p className="news-detail__lead">{item.excerpt}</p>}

          {body.length > 0 ? (
            <RichParagraphs paragraphs={body} />
          ) : (
            !item.excerpt && (
              <p>
                The full article text has not been added yet. This entry mirrors
                the title and date from the ICON-INSTITUTE news listing.
              </p>
            )
          )}

          {item.attachment && (
            <p className="news-detail__download">
              <a
                className="btn btn--primary"
                href={assetUrl(item.attachment)}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <DownloadIcon className="btn__icon" aria-hidden="true" />
                {item.attachment_label || 'Download the newsletter'}
              </a>
            </p>
          )}

          {item.contact_email && (
            <p className="news-detail__contact">
              <MailIcon className="btn__icon" aria-hidden="true" />
              For more information you can contact us via e-mail:{' '}
              <a href={`mailto:${item.contact_email}`}>{item.contact_email}</a>
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
