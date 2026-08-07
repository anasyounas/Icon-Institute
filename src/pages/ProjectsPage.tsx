import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  projectFilters,
  projectRegions,
  sampleProjects,
} from '../data/projects';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';

export function ProjectsPage() {
  const [recent, setRecent] = useState('');
  const [year, setYear] = useState('');
  const [expertise, setExpertise] = useState('');
  const [volume, setVolume] = useState('');

  const filtered = useMemo(() => {
    const currentYear = 2026;
    return sampleProjects.filter((p) => {
      if (recent === 'last-3' && p.yearEnd < currentYear - 3) return false;
      if (recent === 'last-5' && p.yearEnd < currentYear - 5) return false;
      if (year && !(p.yearStart <= +year && p.yearEnd >= +year)) return false;
      if (expertise && p.expertise !== expertise) return false;
      if (volume && p.volume !== volume) return false;
      return true;
    });
  }, [recent, year, expertise, volume]);

  return (
    <div className="projects-page">
      <PageHero title="Projects" image="icon_projects.jpg" />

      <section className="content-section">
        <div className="container">
          <p className="lede">
            Explore ICON projects worldwide. Select a region on the map links
            below or filter the sample catalogue.
          </p>

          <div className="projects-map">
            <PlaceholderImage
              src="icon_projects.jpg"
              alt="Projects worldwide map"
              className="projects-map__img"
            />
            <div className="projects-map__regions">
              {projectRegions.map((r) => (
                <Link key={r.slug} to={r.href} className="btn btn--primary">
                  {r.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="projects-filters">
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

          <div className="projects-list">
            {filtered.map((p) => (
              <article key={p.id} className="project-card">
                <h3>{p.title}</h3>
                <p className="project-card__meta">
                  {p.country} · {p.yearStart}–{p.yearEnd} · {p.volume}
                </p>
                <p>{p.description}</p>
                <Link to={`/projects/${p.region}`} className="text-link">
                  View {p.region.replace(/-/g, ' ')} projects
                </Link>
              </article>
            ))}
            {filtered.length === 0 && (
              <p>No sample projects match the selected filters.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
