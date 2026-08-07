import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  projectFilters,
  projectRegions,
  projectsPage,
  sampleProjects,
} from '../data/projects';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Seo } from '../components/Seo';
import { pageSeo } from '../data/seo';

const volumeLabels: Record<string, string> = Object.fromEntries(
  projectFilters.volumes.map((v) => [v.value, v.label])
);

export function ProjectsPage() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [recent, setRecent] = useState('');
  const [year, setYear] = useState('');
  const [expertise, setExpertise] = useState('');
  const [volume, setVolume] = useState('');

  const filtered = useMemo(() => {
    const currentYear = 2026;
    const q = query.trim().toLowerCase();
    return sampleProjects.filter((p) => {
      if (region && p.region !== region) return false;
      if (recent === 'last-3' && p.yearEnd < currentYear - 3) return false;
      if (recent === 'last-5' && p.yearEnd < currentYear - 5) return false;
      if (year && !(p.yearStart <= +year && p.yearEnd >= +year)) return false;
      if (expertise && p.expertise !== expertise) return false;
      if (volume && p.volume !== volume) return false;
      if (q) {
        const hay = `${p.title} ${p.country} ${p.description} ${p.region}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, region, recent, year, expertise, volume]);

  const clearFilters = () => {
    setQuery('');
    setRegion('');
    setRecent('');
    setYear('');
    setExpertise('');
    setVolume('');
  };

  return (
    <div className="projects-page">
      <Seo {...pageSeo.projects} />
      <PageHero
        title="Projects"
        image="icon_projects.jpg"
        imageAlt="ICON projects worldwide"
      />

      <section className="content-section">
        <div className="container">
          <p className="lede">{projectsPage.intro}</p>

          <div className="projects-map">
            <PlaceholderImage
              src="icon_projects.jpg"
              alt="World map highlighting ICON project regions"
              className="projects-map__img"
            />
            <div className="projects-map__regions" role="navigation" aria-label="Project regions">
              {projectRegions.map((r) => (
                <Link key={r.slug} to={r.href} className="btn btn--primary">
                  {r.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="projects-search">
            <label htmlFor="project-search">
              Search projects
              <input
                id="project-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, country or keyword…"
                autoComplete="off"
              />
            </label>
          </div>

          <div className="projects-filters" role="search" aria-label="Filter projects">
            <label>
              Region
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">All regions</option>
                {projectFilters.regions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Recent
              <select value={recent} onChange={(e) => setRecent(e.target.value)}>
                <option value="">All years</option>
                {projectFilters.recentYears.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Running in
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Any year</option>
                {projectFilters.years.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Expertise
              <select
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
              >
                <option value="">All expertise</option>
                {projectFilters.expertise.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Volume
              <select value={volume} onChange={(e) => setVolume(e.target.value)}>
                <option value="">Any volume</option>
                {projectFilters.volumes.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="projects-toolbar">
            <p aria-live="polite">
              Showing <strong>{filtered.length}</strong> of{' '}
              {sampleProjects.length} projects
            </p>
            <button type="button" className="btn btn--light" onClick={clearFilters}>
              Clear filters
            </button>
          </div>

          <div className="projects-list">
            {filtered.map((p) => (
              <article key={p.id} className="project-card">
                <h3>{p.title}</h3>
                <p className="project-card__meta">
                  {p.country} · {p.yearStart}–{p.yearEnd} ·{' '}
                  {volumeLabels[p.volume] ?? p.volume}
                </p>
                <p>{p.description}</p>
                <Link
                  to={`/projects/${p.region}`}
                  className="text-link"
                >
                  View all {p.region.replace(/-/g, ' ')} projects
                </Link>
              </article>
            ))}
            {filtered.length === 0 && (
              <p role="status">No projects match the selected search and filters.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
