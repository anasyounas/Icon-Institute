import { Link, useParams } from 'react-router-dom';
import {
  projectRegions,
  sampleProjects as bundledProjects,
  type SampleProject,
} from '../data/projects';
import { PageHero } from '../components/PageHero';
import { ProjectCard } from '../components/ProjectCard';
import { Seo } from '../components/Seo';
import { Pagination } from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { usePublished } from '../hooks/usePublished';

export function ProjectRegionPage() {
  const { region } = useParams();
  const sampleProjects = usePublished<SampleProject[]>('/projects', bundledProjects);
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
          <div className="projects-grid" id="region-projects">
            {pageItems.map((p) => (
              <ProjectCard key={p.slug ?? p.id} project={p} />
            ))}
            {projects.length === 0 && (
              <p role="status">No projects are listed for this region yet.</p>
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
