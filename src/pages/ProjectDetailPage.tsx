import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  projectFilters,
  projectRegions,
  sampleProjects,
  type SampleProject,
} from '../data/projects';
import { PageHero } from '../components/PageHero';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { Seo } from '../components/Seo';
import { siteSeo } from '../data/seo';
import { getPublished } from '../hooks/usePublished';
import { assetUrl } from '../lib/api';
import { expertiseHubCards } from '../data/expertise';
import {
  BankIcon,
  BriefcaseIcon,
  CalendarIcon,
  CoinsIcon,
  DownloadIcon,
  MapPinIcon,
  UsersIcon,
} from '../components/Icons';

const expertiseLabels: Record<string, string> = Object.fromEntries(
  projectFilters.expertise.map((e) => [e.value, e.label])
);
const volumeLabels: Record<string, string> = Object.fromEntries(
  projectFilters.volumes.map((v) => [v.value, v.label])
);

/** `2025-12-01` → `01/12/2025`, the format the reference pages use. */
function formatDay(iso?: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

function periodText(project: SampleProject): string {
  if (project.periodLabel) return project.periodLabel;
  if (project.periodStart || project.periodEnd) {
    return [formatDay(project.periodStart), formatDay(project.periodEnd)]
      .filter(Boolean)
      .join(' - ');
  }
  return `${project.yearStart} – ${project.yearEnd}`;
}

/** One icon-labelled fact, as on the original project pages. */
function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarIcon;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="project-fact">
      <span className="project-fact__icon" aria-hidden="true">
        <Icon />
      </span>
      <div className="project-fact__body">
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>
    </div>
  );
}

export function ProjectDetailPage() {
  const { slug } = useParams();

  // Bundled data covers the first paint and the CMS-offline case; the
  // published record replaces it as soon as it arrives.
  const [project, setProject] = useState<SampleProject | undefined>(() =>
    sampleProjects.find((p) => (p.slug ?? p.id) === slug)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getPublished<SampleProject>(`/projects/${slug}`)
      .then((live) => {
        if (cancelled) return;
        if (live) setProject(live);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!project) {
    return (
      <div className="content-section container">
        <h1>{loading ? 'Loading project…' : 'Project not found'}</h1>
        {!loading && (
          <p className="back-link">
            <Link to="/projects">← All projects</Link>
          </p>
        )}
      </div>
    );
  }

  const region = projectRegions.find((r) => r.slug === project.region);
  const expertiseLabel = expertiseLabels[project.expertise] ?? project.expertise;
  const expertiseImage =
    project.image ??
    expertiseHubCards.find((card) => card.slug === project.expertise)?.image;
  const body = project.body?.filter((p) => p.trim()) ?? [];
  const paragraphs = body.length > 0 ? body : [project.description];
  const countries = project.countries?.length
    ? project.countries.join(', ')
    : project.country;

  return (
    <div className="project-detail">
      <Seo
        title={`${project.title} | Projects | ICON-INSTITUTE`}
        description={project.subtitle ?? project.description}
        path={`/projects/detail/${project.slug ?? project.id}`}
        type="article"
        image={project.image ?? siteSeo.defaultImage}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Project',
          name: project.title,
          description: project.subtitle ?? project.description,
          areaServed: countries,
          startDate: project.periodStart ?? String(project.yearStart),
          endDate: project.periodEnd ?? String(project.yearEnd),
          funder: project.financing
            ? { '@type': 'Organization', name: project.financing }
            : undefined,
          provider: { '@type': 'Organization', name: siteSeo.siteName },
        }}
      />

      <PageHero
        title={project.title}
        compact
        image={project.image}
        imageAlt={project.title}
      />

      <section className="content-section">
        <div className="container">
          <p className="back-link">
            <Link to="/projects">← All projects</Link>
            {region && (
              <>
                {' · '}
                <Link to={region.href}>Projects {region.title}</Link>
              </>
            )}
          </p>

          <div className="project-detail__grid">
            <article className="project-detail__main">
              <header className="project-detail__header">
                {expertiseImage && (
                  <PlaceholderImage
                    src={expertiseImage}
                    alt=""
                    className="project-detail__expertise-image"
                    aspectRatio="1 / 1"
                  />
                )}
                <div>
                  <h2>{project.title}</h2>
                  {project.subtitle && (
                    <p className="project-detail__subtitle">{project.subtitle}</p>
                  )}
                </div>
              </header>

              {project.image && (
                <PlaceholderImage
                  src={project.image}
                  alt={project.title}
                  className="project-detail__img"
                  aspectRatio="16 / 9"
                />
              )}

              <h3 className="project-detail__section-title">Project description</h3>
              {paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}

              {project.pdf && (
                <p className="project-detail__download">
                  <a
                    className="btn btn--primary"
                    href={assetUrl(project.pdf)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <DownloadIcon className="btn__icon" aria-hidden="true" />
                    Download PDF
                  </a>
                </p>
              )}
            </article>

            <aside className="project-detail__facts" aria-label="Project facts">
              <dl className="project-facts">
                <Fact icon={CalendarIcon} label="Period" value={periodText(project)} />
                <Fact icon={MapPinIcon} label="Country" value={countries} />
                <Fact icon={BriefcaseIcon} label="Expertise" value={expertiseLabel} />
                <Fact
                  icon={CoinsIcon}
                  label="Volume"
                  value={project.volumeAmount ?? volumeLabels[project.volume] ?? project.volume}
                />
                <Fact icon={BankIcon} label="Financing" value={project.financing} />
                <Fact icon={UsersIcon} label="Client name" value={project.clientName} />
              </dl>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
