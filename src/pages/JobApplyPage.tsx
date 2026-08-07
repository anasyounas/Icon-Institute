import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getJobById, jobsPage } from '../data/jobs';
import { PageHero } from '../components/PageHero';
import { Seo } from '../components/Seo';

export function JobApplyPage() {
  const { jobId } = useParams();
  const job = jobId ? getJobById(jobId) : undefined;
  const [submitted, setSubmitted] = useState(false);

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="job-apply">
      <Seo
        title={`Apply: ${job.title} | ICON-INSTITUTE`}
        description={`Application form for ${job.title}`}
        path={`/jobs/${job.id}/apply`}
        noindex
      />
      <PageHero title="APPLY" image="icon_institute_jobs.jpg" imageAlt="" />
      <section className="content-section">
        <div className="container narrow">
          <p className="back-link">
            <Link to={`/jobs/${job.id}`}>← {job.title}</Link>
          </p>
          <h2>Application: {job.title}</h2>
          <p>
            Applications are processed by ICON-INSTITUTE staff. In this frontend
            demo, the form does not upload files or send email — it demonstrates
            the candidate application UI only.
          </p>
          <p>
            You may also email your CV and certificates directly to{' '}
            <a href={`mailto:${jobsPage.email}`}>{jobsPage.email}</a>.
          </p>

          {submitted ? (
            <div className="status-box" role="status">
              <p>
                Thank you. Your application has been recorded locally for this
                demo. No data was transmitted to a server.
              </p>
              <Link to="/jobs" className="btn btn--primary">
                Back to Jobs
              </Link>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit} noValidate={false}>
              <label>
                Full name
                <input type="text" name="name" required autoComplete="name" />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                />
              </label>
              <label>
                Phone
                <input type="tel" name="phone" autoComplete="tel" />
              </label>
              <label>
                Cover letter / message
                <textarea name="message" rows={6} required />
              </label>
              <label>
                Curriculum Vitae (PDF)
                <input
                  type="file"
                  name="cv"
                  accept=".pdf,.doc,.docx"
                  required
                />
              </label>
              <label>
                Certificates (optional)
                <input
                  type="file"
                  name="certificates"
                  accept=".pdf,.doc,.docx,.zip"
                  multiple
                />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="consent" required />
                <span>
                  I agree that ICON-INSTITUTE may process my application data as
                  described in the{' '}
                  <Link to="/privacy-policy">privacy policy</Link>.
                </span>
              </label>
              <button type="submit" className="btn btn--primary">
                Submit application
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
