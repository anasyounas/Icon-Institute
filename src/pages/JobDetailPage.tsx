import { Link, useParams } from 'react-router-dom';
import { jobsPage as bundledJobsPage, type JobListing } from '../data/jobs';
import { PageHero } from '../components/PageHero';
import { Seo } from '../components/Seo';
import { usePublished } from '../hooks/usePublished';

export function JobDetailPage() {
  const { jobId } = useParams();
  const listings = usePublished<JobListing[]>('/jobs', bundledJobsPage.listings);
  const job = jobId ? listings.find((j) => j.id === jobId) : undefined;

  if (!job) {
    return (
      <div className="content-section container">
        <h1>Job not found</h1>
        <p>
          <Link to="/jobs">Back to Jobs</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="job-detail">
      <Seo
        title={`${job.title} | Jobs | ICON-INSTITUTE`}
        description={job.summary}
        path={`/jobs/${job.id}`}
      />
      <PageHero title="JOBS" image="icon_institute_jobs.jpg" imageAlt="" />
      <section className="content-section">
        <div className="container narrow">
          <p className="back-link">
            <Link to="/jobs">← All job offers</Link>
          </p>
          <h2>{job.title}</h2>
          <p className="job-card__meta">
            {job.type} · {job.location}
          </p>
          <p className="job-card__meta">
            Expertise: {job.expertise} · Published{' '}
            <time dateTime={job.published}>{job.published}</time> · Deadline{' '}
            <time dateTime={job.deadline}>{job.deadline}</time>
          </p>

          {job.description.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}

          <h3>Requirements</h3>
          <ul>
            {job.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <p className="job-card__actions">
            <Link to={`/jobs/${job.id}/apply`} className="btn btn--primary">
              Apply for this position
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
