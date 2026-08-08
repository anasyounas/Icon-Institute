import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api, type DashboardData } from '../../lib/api';
import { BarList, ColumnChart, StackedBar } from '../../components/admin/Charts';
import { PanelCard } from '../../components/admin/AdminUI';
import {
  EXPERTISE_LABELS,
  REGION_LABELS,
  errorText,
  formatWhen,
} from '../../components/admin/cms';

const modules = [
  {
    title: 'Content & Media Editor',
    desc: 'Edit page text and replace images without touching code.',
    href: '/admin/content',
  },
  {
    title: 'News Manager',
    desc: 'Add, edit and remove news articles with title, date, body and image.',
    href: '/admin/news',
  },
  {
    title: 'Jobs Manager',
    desc: 'Manage job ads with on-site application options for candidates.',
    href: '/admin/jobs',
  },
  {
    title: 'Projects Manager',
    desc: 'Manually add and edit projects (region, period, expertise, volume).',
    href: '/admin/projects',
  },
  {
    title: 'Contact Information',
    desc: 'Maintain static address, phone and email details.',
    href: '/admin/contact',
  },
];

export function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .dashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = data?.totals ?? {};
  const published = (kind: string) => data?.by_status?.[kind]?.published ?? 0;
  const inReview =
    (data?.workflow_queue &&
      Object.values(data.workflow_queue).reduce((a, b) => a + b, 0)) ??
    0;

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <h1>Dashboard</h1>
        <p>
          Welcome, {user?.name}. You are signed in as {user?.role}. Everything
          below is live CMS data — what you publish here appears on the
          website immediately.
        </p>
      </header>

      {error && (
        <p className="admin-login__error" role="alert">
          {error}
        </p>
      )}

      <section className="admin-stats" aria-label="Summary">
        <div className="admin-stat">
          <strong>{totals.projects ?? '—'}</strong>
          <span>Projects</span>
          <span className="field-hint">{published('projects')} published</span>
        </div>
        <div className="admin-stat">
          <strong>{totals.news ?? '—'}</strong>
          <span>News articles</span>
          <span className="field-hint">{published('news')} published</span>
        </div>
        <div className="admin-stat">
          <strong>{totals.open_jobs ?? '—'}</strong>
          <span>Open jobs</span>
          <span className="field-hint">
            {totals.applications ?? 0} application(s) received
          </span>
        </div>
        <div className="admin-stat">
          <strong>{totals.media ?? '—'}</strong>
          <span>Media files</span>
          <span className="field-hint">{totals.pages ?? 0} editable pages</span>
        </div>
      </section>

      <section className="admin-modules" aria-label="Content modules">
        <h2>Content modules</h2>
        <ul className="admin-module-grid">
          {modules.map((m) => (
            <li key={m.href}>
              <Link to={m.href} className="admin-module-card">
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="admin-split">
        <PanelCard
          title="Projects by region"
          subtitle="Published projects, as visitors can filter them."
        >
          <BarList
            caption="Projects by region"
            data={(data?.projects_by_region ?? []).map((d) => ({
              label: REGION_LABELS[d.label] ?? d.label,
              value: d.value,
            }))}
          />
        </PanelCard>

        <PanelCard title="Projects by expertise">
          <BarList
            caption="Projects by expertise"
            data={(data?.projects_by_expertise ?? []).map((d) => ({
              label: EXPERTISE_LABELS[d.label] ?? d.label,
              value: d.value,
            }))}
          />
        </PanelCard>
      </div>

      <div className="admin-split">
        <PanelCard title="News articles per year" subtitle="Published articles.">
          <ColumnChart caption="News per year" data={data?.news_by_year ?? []} />
        </PanelCard>

        <PanelCard
          title="Approval queue"
          subtitle={
            inReview > 0
              ? `${inReview} item(s) waiting for review.`
              : 'Nothing is waiting for approval.'
          }
          action={
            <Link to="/admin/workflow" className="btn btn--light">
              Open workflow
            </Link>
          }
        >
          <StackedBar
            caption="Items in review by type"
            segments={[
              { label: 'News', value: data?.workflow_queue?.news ?? 0 },
              { label: 'Jobs', value: data?.workflow_queue?.jobs ?? 0 },
              { label: 'Projects', value: data?.workflow_queue?.projects ?? 0 },
            ]}
          />
        </PanelCard>
      </div>

      {data && data.recent_activity.length > 0 && (
        <section>
          <h2>Recent activity</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">User</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_activity.map((row) => (
                  <tr key={row.id}>
                    <td className="admin-table__num">{formatWhen(row.created_at)}</td>
                    <td>{row.actor_email ?? '—'}</td>
                    <td>{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
