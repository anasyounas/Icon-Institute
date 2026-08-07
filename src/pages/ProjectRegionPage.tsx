import { Link, useParams } from 'react-router-dom';
import { projectRegions, sampleProjects } from '../data/projects';
import { PageHero } from '../components/PageHero';

export function ProjectRegionPage() {
  const { region } = useParams();
  const meta = projectRegions.find((r) => r.slug === region);
  const projects = sampleProjects.filter((p) => p.region === region);

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
      <PageHero title={`Projects ${meta.title}`} image="icon_projects.jpg" />
      <section className="content-section">
        <div className="container">
          <p className="lede">{meta.description}</p>
          <div className="projects-list">
            {projects.map((p) => (
              <article key={p.id} className="project-card">
                <h3>{p.title}</h3>
                <p className="project-card__meta">
                  {p.country} · {p.yearStart}–{p.yearEnd} · {p.volume}
                </p>
                <p>{p.description}</p>
              </article>
            ))}
            {projects.length === 0 && (
              <p>
                Sample projects for this region will appear here. On the live
                site, the full catalogue is loaded dynamically.
              </p>
            )}
          </div>
          <p className="back-link">
            <Link to="/projects">← All projects</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
