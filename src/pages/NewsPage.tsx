import { Link } from 'react-router-dom';
import { newsItems } from '../data/news';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Seo } from '../components/Seo';
import { pageSeo } from '../data/seo';
import { Pagination } from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

export function NewsPage() {
  // Paginate the flat chronological list, then group whatever lands on this
  // page by year — so the year headings survive without splitting a year
  // across pages in a confusing way.
  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(newsItems);

  const byYear = pageItems.reduce<Record<string, typeof newsItems>>((acc, item) => {
    const year = item.date.slice(0, 4);
    (acc[year] ??= []).push(item);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => +b - +a);

  return (
    <div className="news-page">
      <Seo {...pageSeo.news} />
      <PageHero
        title="NEWS"
        image="icon-institute_21.jpg"
        imageAlt="ICON-INSTITUTE news"
      />
      <section className="content-section" id="news-list">
        <div className="container">
          {years.map((year) => (
            <div key={year} className="news-year">
              <h2>{year}</h2>
              <ul className="news-grid">
                {byYear[year].map((item) => (
                  <li key={item.slug}>
                    <Link to={`/news/${item.slug}`} className="news-card">
                      <span className="news-card__media">
                        <PlaceholderImage
                          src={item.image ?? 'news-placeholder.jpg'}
                          alt=""
                          className="news-card__img"
                          aspectRatio="4 / 3"
                        />
                      </span>
                      <h3>{item.title}</h3>
                      <time dateTime={item.date}>{item.dateLabel}</time>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            from={from}
            to={to}
            total={total}
            label="articles"
            scrollToId="news-list"
          />
        </div>
      </section>
    </div>
  );
}
