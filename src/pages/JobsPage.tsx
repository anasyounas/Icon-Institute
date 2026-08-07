import { jobsPage } from '../data/jobs';
import { PageHero } from '../components/PageHero';

export function JobsPage() {
  return (
    <div className="jobs-page">
      <PageHero title="JOBS" image="icon_institute_jobs.jpg" />
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
          <p className="muted">
            No permanent staff vacancies are listed in the current snapshot.
            Please send a speculative application to the address above.
          </p>
        </div>
      </section>
    </div>
  );
}
