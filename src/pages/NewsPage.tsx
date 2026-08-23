import { Link } from 'react-router-dom';
import { newsItems as bundledNews, type NewsItem } from '../data/news';
import { homePage as bundledHome, type HomePage as HomeData } from '../data/home';
import { PageHero } from '../components/PageHero';
import { Seo } from '../components/Seo';
import { pageSeo } from '../data/seo';
import { Pagination } from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { usePublished } from '../hooks/usePublished';

export function NewsPage() {
  // Published CMS articles; the bundled list covers the moment before the
  // first response (and keeps the page rendering if the CMS is offline).
  const newsItems = usePublished<NewsItem[]>('/news', bundledNews);
  const home = usePublished<HomeData>('/pages/home', bundledHome);
  // Reuse a published home header photo (CMS `/media/...`) so the hero is not
  // stuck on a missing local `/images/icon-institute_21.jpg`.
  const heroImage = home.heroSlides[0]?.image ?? 'icon-institute_21.jpg';

  // Paginate the flat chronological list, then group whatever lands on this
  // page by year — so the year headings survive without splitting a year
  // across pages in a confusing way.
  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(newsItems);

  const byYear = pageItems.reduce<Record<string, NewsItem[]>>((acc, item) => {
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
        image={heroImage}
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
