import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  projectFilters,
  projectRegions,
  projectsPage,
  sampleProjects as bundledProjects,
  type SampleProject,
} from '../data/projects';
import { homePage as bundledHome, type HomePage as HomeData } from '../data/home';
import { PageHero } from '../components/PageHero';
import { ProjectCard } from '../components/ProjectCard';
import { Seo } from '../components/Seo';
import { pageSeo } from '../data/seo';
import { Pagination } from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { usePublished } from '../hooks/usePublished';

export function ProjectsPage() {
  // The published project catalogue, maintained through the CMS Projects
  // Manager. Filtering and search still run entirely in the browser.
  const sampleProjects = usePublished<SampleProject[]>('/projects', bundledProjects);
  const home = usePublished<HomeData>('/pages/home', bundledHome);
  // Reuse the published home "Projects Worldwide" image (CMS `/media/...`) so
  // the map is not stuck on a missing local `/images/icon_projects.jpg`.
  const mapImage = home.projectsWorldwide.image || 'icon_projects.jpg';
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [recent, setRecent] = useState('');
  const [year, setYear] = useState('');
  const [expertise, setExpertise] = useState('');
  const [volume, setVolume] = useState('');

  const filtered = useMemo(() => {
    const currentYear = new Date().getFullYear();
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
  }, [sampleProjects, query, region, recent, year, expertise, volume]);

  const { page, totalPages, pageItems, setPage, from, to, total } = usePagination(
    filtered,
    { resetKey: [query, region, recent, year, expertise, volume].join('|') }
  );

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
        image={mapImage}
        imageAlt="ICON projects worldwide"
      />

      <section className="content-section">
        <div className="container">
          <p className="lede">{projectsPage.intro}</p>

          <div className="projects-map">
            {/*
            <PlaceholderImage
              src={mapImage}
              alt="World map highlighting ICON project regions"
              className="projects-map__img"
            />
            */}
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

          <div className="projects-grid" id="projects-list">
            {pageItems.map((p) => (
              <ProjectCard key={p.slug ?? p.id} project={p} />
            ))}
            {filtered.length === 0 && (
              <p role="status">No projects match the selected search and filters.</p>
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
            scrollToId="projects-list"
          />
        </div>
      </section>
    </div>
  );
}
