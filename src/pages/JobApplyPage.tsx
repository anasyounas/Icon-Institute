import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { jobsPage as bundledJobsPage, type JobListing } from '../data/jobs';
import { PageHero } from '../components/PageHero';
import { Seo } from '../components/Seo';
import { usePublished } from '../hooks/usePublished';
import { API_ORIGIN } from '../lib/api';

export function JobApplyPage() {
  const { jobId } = useParams();
  const listings = usePublished<JobListing[]>('/jobs', bundledJobsPage.listings);
  const job = jobId ? listings.find((j) => j.id === jobId) : undefined;
  const applicationEmail =
    (job as { application_email?: string } | undefined)?.application_email ??
    bundledJobsPage.email;

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const formEl = e.currentTarget;
    const fields = new FormData(formEl);
    const body = new FormData();
    body.append('job_slug', job.id);
    body.append('name', String(fields.get('name') ?? ''));
    body.append('email', String(fields.get('email') ?? ''));
    body.append('phone', String(fields.get('phone') ?? ''));
    body.append('message', String(fields.get('message') ?? ''));

    const cv = fields.get('cv');
    if (cv instanceof File && cv.size > 0) body.append('cv', cv);
    for (const cert of fields.getAll('certificates')) {
      if (cert instanceof File && cert.size > 0) body.append('certificates', cert);
    }

    try {
      const response = await fetch(`${API_ORIGIN}/api/v1/public/applications`, {
        method: 'POST',
        body,
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
          details?: unknown;
        } | null;
        throw new Error(
          payload?.message ?? 'Your application could not be submitted. Please try again.'
        );
      }
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Your application could not be submitted. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
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
            Your application is delivered directly to ICON-INSTITUTE and stored
            on their own server — no third-party service is involved.
          </p>
          <p>
            You may also email your CV and certificates directly to{' '}
            <a href={`mailto:${applicationEmail}`}>{applicationEmail}</a>.
          </p>

          {submitted ? (
            <div className="status-box" role="status">
              <p>
                Thank you — your application for <strong>{job.title}</strong>{' '}
                has been received. ICON-INSTITUTE staff will review it and get
                back to you.
              </p>
              <Link to="/jobs" className="btn btn--primary">
                Back to Jobs
              </Link>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
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
                <textarea name="message" rows={6} required minLength={10} />
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

              {error && (
                <p className="admin-login__error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
