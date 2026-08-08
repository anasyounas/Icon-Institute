import { Link, useParams } from 'react-router-dom';
import {
  projectFilters,
  projectRegions,
  sampleProjects,
} from '../data/projects';
import { PageHero } from '../components/PageHero';
import { Seo } from '../components/Seo';
import { Pagination } from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const volumeLabels: Record<string, string> = Object.fromEntries(
  projectFilters.volumes.map((v) => [v.value, v.label])
);

export function ProjectRegionPage() {
  const { region } = useParams();
  const meta = projectRegions.find((r) => r.slug === region);
  const projects = sampleProjects.filter((p) => p.region === region);

  // Called before the early return below to keep hook order stable.
  const { page, totalPages, pageItems, setPage, from, to, total } = usePagination(
    projects,
    { resetKey: region ?? '' }
  );

  if (!meta) {
    return (
      <div className="content-section container">
        <h1>Region not found</h1>
        <Link to="/projects">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="project-region">
      <Seo
        title={`Projects ${meta.title} | ICON-INSTITUTE`}
        description={meta.description}
        path={meta.href}
      />
      <PageHero
        title={`Projects ${meta.title}`}
        image="icon_projects.jpg"
        imageAlt={`ICON projects in ${meta.title}`}
      />
      <section className="content-section">
        <div className="container">
          <p className="lede">{meta.description}</p>
          <div className="projects-list" id="region-projects">
            {pageItems.map((p) => (
              <article key={p.id} className="project-card">
                <h3>{p.title}</h3>
                <p className="project-card__meta">
                  {p.country} · {p.yearStart}–{p.yearEnd} ·{' '}
                  {volumeLabels[p.volume] ?? p.volume}
                </p>
                <p>{p.description}</p>
              </article>
            ))}
            {projects.length === 0 && (
              <p role="status">
                No sample projects are listed for this region yet.
              </p>
            )}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            from={from}
            to={to}
            total={total}
            label="projects"
            scrollToId="region-projects"
          />

          <p className="back-link">
            <Link to="/projects">← All projects</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
