import { Link } from 'react-router-dom';
import { mockAuditLog, mockWorkflow } from '../../data/admin/mockData';
import { useDemoAuth } from '../../hooks/useDemoAuth';

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
          <strong>5</strong>
          <span>CMS modules</span>
        </div>
        <div className="admin-stat">
          <strong>3</strong>
          <span>Items in workflow</span>
        </div>
        <div className="admin-stat">
          <strong>#184</strong>
          <span>Latest static build</span>
        </div>
        <div className="admin-stat">
          <strong>Daily</strong>
          <span>Automated backups</span>
        </div>
      </section>

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

      <div className="admin-split">
        <section>
          <h2>Publishing pipeline</h2>
          <ol className="admin-pipeline">
            <li>Edit in CMS</li>
            <li>Generate static website</li>
            <li>Preview</li>
            <li>Publish</li>
            <li>Rollback if required</li>
          </ol>
          <Link to="/admin/publish" className="btn btn--primary">
            Open publish console
          </Link>
        </section>
        <section>
          <h2>Approval queue</h2>
          <ul className="admin-simple-list">
            {mockWorkflow.map((w) => (
              <li key={w.id}>
                <strong>{w.title}</strong>
                <span>
                  {w.stage} · {w.assignee}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h2>Recent activity</h2>
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
                <td>{row.time}</td>
                <td>{row.user}</td>
                <td>{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
