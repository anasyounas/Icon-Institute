import { Link, useParams } from 'react-router-dom';
import { newsItems } from '../data/news';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';

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
      <PageHero title={item.title} compact />
      <section className="content-section">
        <div className="container narrow">
          <time dateTime={item.date}>{item.dateLabel}</time>
          <PlaceholderImage
            src={item.image ?? 'news-placeholder.jpg'}
            alt=""
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
