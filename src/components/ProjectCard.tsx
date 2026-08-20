import { Link } from 'react-router-dom';
import { expertiseHubCards } from '../data/expertise';
import { type SampleProject } from '../data/projects';
import { PlaceholderImage } from './PlaceholderImage';

function formatDay(iso?: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** The period line as the reference listing shows it. */
export function projectPeriod(project: SampleProject): string {
  if (project.periodLabel) return project.periodLabel;
  if (project.periodStart || project.periodEnd) {
    return [formatDay(project.periodStart), formatDay(project.periodEnd)]
      .filter(Boolean)
      .join(' - ');
  }
  return `${project.yearStart} – ${project.yearEnd}`;
}

function expertiseImage(slug: string): string {
  return (
    expertiseHubCards.find((c) => c.slug === slug)?.image ??
    'icon_projects.jpg'
  );
}

/**
 * Reference listing card: expertise (business-unit) icon left, title /
 * countries / period right — two columns on region pages.
 */
export function ProjectCard({ project }: { project: SampleProject }) {
  const href = `/projects/detail/${project.slug ?? project.id}`;
  const countries = project.countries?.length
    ? project.countries.join(', ')
    : project.country;

  return (
    <article className="project-card">
      <Link to={href} className="project-card__link">
        <span className="project-card__media">
          <PlaceholderImage
            src={expertiseImage(project.expertise)}
            alt=""
            className="project-card__img"
            aspectRatio="1 / 1"
          />
        </span>

        <span className="project-card__body">
          <h3 className="project-card__title">{project.title}</h3>
          <span className="project-card__meta">{countries}</span>
          <span className="project-card__meta">{projectPeriod(project)}</span>
        </span>
      </Link>
    </article>
  );
}
