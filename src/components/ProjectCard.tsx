import { Link } from 'react-router-dom';
import { projectFilters, type SampleProject } from '../data/projects';
import { PlaceholderImage } from './PlaceholderImage';
import { getExpertiseIcon } from './iconMap';

const volumeLabels: Record<string, string> = Object.fromEntries(
  projectFilters.volumes.map((v) => [v.value, v.label])
);

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

/**
 * A project in a listing: expertise mark, image, title, countries and running
 * period — the fields the reference project grid shows — linking to the
 * project's own page.
 */
export function ProjectCard({ project }: { project: SampleProject }) {
  const href = `/projects/detail/${project.slug ?? project.id}`;
  const { Icon, accent } = getExpertiseIcon(project.expertise);
  const countries = project.countries?.length
    ? project.countries.join(', ')
    : project.country;

  return (
    <article className="project-card">
      <Link to={href} className="project-card__link">
        <span className="project-card__media">
          <PlaceholderImage
            src={project.image ?? 'icon_projects.jpg'}
            alt=""
            className="project-card__img"
            aspectRatio="4 / 3"
          />
          <span
            className={`icon-tile icon-tile--${accent} project-card__icon`}
            aria-hidden="true"
          >
            <Icon />
          </span>
        </span>

        <span className="project-card__body">
          <h3 className="project-card__title">{project.title}</h3>
          <span className="project-card__meta">{countries}</span>
          <span className="project-card__meta">{projectPeriod(project)}</span>
          <span className="project-card__meta project-card__meta--volume">
            {project.volumeAmount ?? volumeLabels[project.volume] ?? project.volume}
          </span>
        </span>
      </Link>
    </article>
  );
}
