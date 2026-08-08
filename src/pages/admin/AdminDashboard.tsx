import { Link } from 'react-router-dom';
import { mockAuditLog, mockWorkflow } from '../../data/admin/mockData';
import { useDemoAuth } from '../../hooks/useDemoAuth';
import {
  BarList,
  ColumnChart,
  Sparkline,
  StackedBar,
} from '../../components/admin/Charts';
import { PanelCard, StatusPill } from '../../components/admin/AdminUI';
import {
  contentTotals,
  newsByYear,
  newsTrend,
  projectsByExpertise,
  projectsByRegion,
  projectsRunningByYear,
  projectsTrend,
  workflowByStage,
} from '../../data/admin/analytics';

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
  const { user } = useDemoAuth();

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <h1>Dashboard</h1>
        <p>
          Welcome, {user?.name}. This is a frontend-only CMS demonstration for
          ICON-INSTITUTE. Publishing regenerates the static site locally when the
          real backend is installed — here the workflow UI is shown for demo.
        </p>
      </header>

      <section className="admin-stats" aria-label="Summary">
        <div className="admin-stat">
          <strong>{contentTotals.projects}</strong>
          <span>Projects</span>
          <span className="admin-stat__spark">
            <Sparkline values={projectsTrend} label="Projects running per year" />
          </span>
        </div>
        <div className="admin-stat">
          <strong>{contentTotals.news}</strong>
          <span>News articles</span>
          <span className="admin-stat__spark">
            <Sparkline values={newsTrend} label="News published per year" />
          </span>
        </div>
        <div className="admin-stat">
          <strong>{contentTotals.openJobs}</strong>
          <span>Open vacancies</span>
        </div>
        <div className="admin-stat">
          <strong>{mockWorkflow.length}</strong>
          <span>Items in workflow</span>
        </div>
      </section>

      <div className="admin-chart-grid">
        <PanelCard
          title="Projects running per year"
          subtitle="Counted from every project whose period covers that year."
        >
          <ColumnChart
            data={projectsRunningByYear}
            caption="Projects running per year"
            unit="projects"
          />
        </PanelCard>

        <PanelCard
          title="News published per year"
          subtitle="Article count by publication year."
        >
          <ColumnChart data={newsByYear} caption="News published per year" unit="articles" />
        </PanelCard>

        <PanelCard title="Projects by region" subtitle="Across all recorded regions.">
          <BarList data={projectsByRegion} caption="Projects by region" />
        </PanelCard>

        <PanelCard title="Projects by expertise" subtitle="Distribution across expertise areas.">
          <BarList data={projectsByExpertise} caption="Projects by expertise area" />
        </PanelCard>
      </div>

      <div className="admin-split">
        <PanelCard
          title="Approval queue"
          subtitle="Where items currently sit in the workflow."
          action={
            <Link to="/admin/workflow" className="btn btn--light">
              Open workflow
            </Link>
          }
        >
          <StackedBar segments={workflowByStage} caption="Workflow items by stage" />
          <ul className="admin-simple-list">
            {mockWorkflow.map((w) => (
              <li key={w.id}>
                <strong>{w.title}</strong>
                <span>
                  <StatusPill value={w.stage} /> {w.assignee}
                </span>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard
          title="Publishing pipeline"
          subtitle="Every step runs locally on ICON-INSTITUTE's server."
          action={
            <Link to="/admin/publish" className="btn btn--light">
              Open console
            </Link>
          }
        >
          <ol className="admin-pipeline">
            <li>Edit in CMS</li>
            <li>Generate static website</li>
            <li>Preview</li>
            <li>Publish</li>
            <li>Rollback if required</li>
          </ol>
        </PanelCard>
      </div>

      <section>
        <h2>Content modules</h2>
        <div className="admin-module-grid">
          {modules.map((m) => (
            <Link key={m.href} to={m.href} className="admin-module-card">
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>

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
              {mockAuditLog.slice(0, 4).map((row) => (
                <tr key={row.id}>
                  <td className="admin-table__num">{row.time}</td>
                  <td>{row.user}</td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
