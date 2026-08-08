import { Link } from 'react-router-dom';
import { jobsPage as bundledJobsPage, type JobListing } from '../data/jobs';
import { PageHero } from '../components/PageHero';
import { Seo } from '../components/Seo';
import { pageSeo } from '../data/seo';
import { usePublished } from '../hooks/usePublished';

export function JobsPage() {
  // Intro texts come from the CMS-managed "Jobs page" content; the listings
  // are the published job ads.
  const pageContent = usePublished('/pages/jobs-page', bundledJobsPage);
  const listings = usePublished<JobListing[]>('/jobs', bundledJobsPage.listings);
  const jobsPage = { ...bundledJobsPage, ...pageContent, listings };

  const openJobs = jobsPage.listings.filter((j) => j.status === 'open');

  return (
    <div className="jobs-page">
      <Seo {...pageSeo.jobs} />
      <PageHero
        title="JOBS"
        image="icon_institute_jobs.jpg"
        imageAlt="Careers at ICON-INSTITUTE"
      />
      <section className="content-section">
        <div className="container narrow">
          {jobsPage.intro.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
          <p>
            <strong>{jobsPage.applicationNote}</strong>
          </p>
          <p>
            General application contact:{' '}
            <a href={`mailto:${jobsPage.email}`}>{jobsPage.email}</a>
          </p>

          <h2>{jobsPage.currentOffersNote}</h2>

          {openJobs.length === 0 ? (
            <p className="muted">
              No permanent staff vacancies are listed at the moment. Please send
              a speculative application to the address above.
            </p>
          ) : (
            <ul className="jobs-list">
              {openJobs.map((job) => (
                <li key={job.id}>
                  <article className="job-card">
                    <header className="job-card__header">
                      <h3>{job.title}</h3>
                      <p className="job-card__meta">
                        {job.type} · {job.location}
                      </p>
                      <p className="job-card__meta">
                        Expertise: {job.expertise} · Apply by{' '}
                        <time dateTime={job.deadline}>{job.deadline}</time>
                      </p>
                    </header>
                    <p>{job.summary}</p>
                    <div className="job-card__actions">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="btn btn--primary"
                      >
                        View details
                      </Link>
                      <Link
                        to={`/jobs/${job.id}/apply`}
                        className="btn btn--light"
                      >
                        Apply now
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
