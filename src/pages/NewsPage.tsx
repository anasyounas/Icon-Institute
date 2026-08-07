import { Link } from 'react-router-dom';
import { newsItems } from '../data/news';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';

export function NewsPage() {
  const byYear = newsItems.reduce<Record<string, typeof newsItems>>((acc, item) => {
    const year = item.date.slice(0, 4);
    (acc[year] ??= []).push(item);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => +b - +a);

  return (
    <div className="news-page">
      <PageHero title="NEWS" image="icon-institute_21.jpg" />
      <section className="content-section">
        <div className="container">
          {years.map((year) => (
            <div key={year} className="news-year">
              <h2>{year}</h2>
              <ul className="news-list">
                {byYear[year].map((item) => (
                  <li key={item.slug}>
                    <Link to={`/news/${item.slug}`} className="news-list__item">
                      <PlaceholderImage
                        src={item.image ?? 'news-placeholder.jpg'}
                        alt=""
                        className="news-list__thumb"
                        aspectRatio="1 / 1"
                      />
                      <div>
                        <h3>{item.title}</h3>
                        <time dateTime={item.date}>{item.dateLabel}</time>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
