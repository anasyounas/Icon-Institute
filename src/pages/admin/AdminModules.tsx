import { useState } from 'react';
import { contactPage } from '../../data/contact';
import { jobsPage } from '../../data/jobs';
import { newsItems } from '../../data/news';
import { sampleProjects } from '../../data/projects';
import { pageSeo } from '../../data/seo';
import {
  mockAuditLog,
  mockBackups,
  mockMedia,
  mockSchedule,
  mockVersions,
  mockWorkflow,
} from '../../data/admin/mockData';
import { DEMO_USERS } from '../../data/admin/demoUsers';

function DemoBanner({ children }: { children: string }) {
  return <p className="admin-banner">{children}</p>;
}

function SaveBar({ label = 'Save changes' }: { label?: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="admin-savebar">
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => {
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2500);
        }}
      >
        {label}
      </button>
      {saved && (
        <span className="status-inline" role="status">
          Saved locally for this demo (not written to disk).
        </span>
      )}
    </div>
  );
}

export function ContentMediaPage() {
  return (
    <div className="admin-page">
      <h1>Content & Media Editor</h1>
      <DemoBanner>
        Edit any page’s text and replace images through the CMS — no code
        required. Demo form only.
      </DemoBanner>
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <label>
          Page
          <select defaultValue="home">
            <option value="home">Home</option>
            <option value="about-us">About Us</option>
            <option value="expertise">Expertise hub</option>
            <option value="download">Download</option>
          </select>
        </label>
        <label>
          Section headline
          <input type="text" defaultValue="Welcome to ICON-INSTITUTE" />
        </label>
        <label>
          Body text
          <textarea
            rows={6}
            defaultValue="ICON-INSTITUTE Consulting Group delivers concepts, consulting and training for international development cooperation."
          />
        </label>
        <label>
          Replace image
          <input type="file" accept="image/*" />
        </label>
        <label>
          Image alt text
          <input type="text" defaultValue="ICON-INSTITUTE team at work" />
        </label>
        <SaveBar label="Save draft" />
      </form>
    </div>
  );
}

export function NewsManagerPage() {
  const [q, setQ] = useState('');
  const filtered = newsItems.filter((n) =>
    n.title.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="admin-page">
      <h1>News Manager</h1>
      <DemoBanner>
        Add, edit and remove news articles (title, date, body, image). Backend
        search across CMS content is demonstrated below.
      </DemoBanner>
      <div className="admin-toolbar">
        <label className="admin-search">
          Search news
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles…"
          />
        </label>
        <button type="button" className="btn btn--primary">
          Add news article
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Title</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, 12).map((n, i) => (
            <tr key={n.slug}>
              <td>{n.dateLabel}</td>
              <td>{n.title}</td>
              <td>{i === 0 ? 'Draft' : 'Published'}</td>
              <td>
                <button type="button" className="btn btn--light">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function JobsManagerPage() {
  return (
    <div className="admin-page">
      <h1>Jobs Manager</h1>
      <DemoBanner>
        Manage job ads on the website with application options for candidates.
      </DemoBanner>
      <div className="admin-toolbar">
        <button type="button" className="btn btn--primary">
          Add job ad
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Type</th>
            <th scope="col">Deadline</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobsPage.listings.map((j) => (
            <tr key={j.id}>
              <td>{j.title}</td>
              <td>{j.type}</td>
              <td>{j.deadline}</td>
              <td>{j.status}</td>
              <td>
                <button type="button" className="btn btn--light">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form
        className="admin-form"
        onSubmit={(e) => e.preventDefault()}
        style={{ marginTop: '2rem' }}
      >
        <h2>Edit selected job (demo)</h2>
        <label>
          Title
          <input type="text" defaultValue={jobsPage.listings[0].title} />
        </label>
        <label>
          Application email
          <input type="email" defaultValue={jobsPage.email} />
        </label>
        <label>
          Enable on-site application form
          <select defaultValue="yes">
            <option value="yes">Yes</option>
            <option value="no">No — mailto only</option>
          </select>
        </label>
        <SaveBar />
      </form>
    </div>
  );
}

export function ProjectsManagerPage() {
  return (
    <div className="admin-page">
      <h1>Projects Manager</h1>
      <DemoBanner>
        Manually add and edit project entries (region, running period, expertise,
        volume) — replaces the former automated upload connection.
      </DemoBanner>
      <div className="admin-toolbar">
        <button type="button" className="btn btn--primary">
          Add project
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Region</th>
            <th scope="col">Period</th>
            <th scope="col">Volume</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sampleProjects.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.region}</td>
              <td>
                {p.yearStart}–{p.yearEnd}
              </td>
              <td>{p.volume}</td>
              <td>
                <button type="button" className="btn btn--light">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ContactInfoPage() {
  const c = contactPage.company;
  return (
    <div className="admin-page">
      <h1>Contact Information</h1>
      <DemoBanner>
        Static contact details (address, phone, email) replace the former public
        contact form.
      </DemoBanner>
      <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          Company name
          <input type="text" defaultValue={c.name} />
        </label>
        <label>
          Address line 1
          <input type="text" defaultValue={c.addressLines[0]} />
        </label>
        <label>
          Address line 2
          <input type="text" defaultValue={c.addressLines[1]} />
        </label>
        <label>
          Country
          <input type="text" defaultValue={c.addressLines[2]} />
        </label>
        <label>
          Phone
          <input type="text" defaultValue={c.phone} />
        </label>
        <label>
          Fax
          <input type="text" defaultValue={c.fax} />
        </label>
        <label>
          Email
          <input type="email" defaultValue={c.email} />
        </label>
        <SaveBar />
      </form>
    </div>
  );
}

export function MediaLibraryPage() {
  return (
    <div className="admin-page">
      <h1>Media Library</h1>
      <DemoBanner>
        Media library and document management with automatic image optimisation
        (demo UI).
      </DemoBanner>
      <div className="admin-toolbar">
        <button type="button" className="btn btn--primary">
          Upload media
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">File</th>
            <th scope="col">Type</th>
            <th scope="col">Size</th>
            <th scope="col">Alt text</th>
          </tr>
        </thead>
        <tbody>
          {mockMedia.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.type}</td>
              <td>{m.size}</td>
              <td>{m.alt || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SeoManagerPage() {
  const entries = Object.values(pageSeo);
  return (
    <div className="admin-page">
      <h1>SEO Metadata</h1>
      <DemoBanner>
        SEO fields on every page — title, description, Open Graph and canonical
        path.
      </DemoBanner>
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Path</th>
            <th scope="col">Meta title</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((p) => (
            <tr key={p.path}>
              <td>
                <code>{p.path}</code>
              </td>
              <td>{p.title}</td>
              <td>{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
        <h2>Edit page SEO</h2>
        <label>
          Meta title
          <input type="text" defaultValue={pageSeo.home.title} />
        </label>
        <label>
          Meta description
          <textarea rows={3} defaultValue={pageSeo.home.description} />
        </label>
        <SaveBar />
      </form>
    </div>
  );
}

export function DraftPreviewPage() {
  return (
    <div className="admin-page">
      <h1>Draft mode & preview</h1>
      <DemoBanner>
        Save as draft and preview the regenerated static pages before publishing.
      </DemoBanner>
      <div className="admin-split">
        <div>
          <h2>Current draft</h2>
          <p>
            <strong>News:</strong> IPA 2022 July update
          </p>
          <p className="muted">Last edited by editor@icon-institute.de</p>
          <SaveBar label="Save draft" />
        </div>
        <div className="admin-preview-frame">
          <p className="admin-badge">Preview pane</p>
          <h3>IPA 2022 Programme Advances Statistical Modernisation…</h3>
          <p>
            Draft article body would render here after static generation — demo
            placeholder.
          </p>
        </div>
      </div>
    </div>
  );
}

export function WorkflowPage() {
  return (
    <div className="admin-page">
      <h1>Approval workflow</h1>
      <DemoBanner>
        Role-based approval before content goes live.
      </DemoBanner>
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Stage</th>
            <th scope="col">Assignee</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockWorkflow.map((w) => (
            <tr key={w.id}>
              <td>{w.title}</td>
              <td>{w.stage}</td>
              <td>{w.assignee}</td>
              <td>
                <button type="button" className="btn btn--light">
                  Approve
                </button>{' '}
                <button type="button" className="btn btn--light">
                  Request changes
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VersionHistoryPage() {
  return (
    <div className="admin-page">
      <h1>Version history</h1>
      <DemoBanner>
        Track published builds and restore previous versions when needed.
      </DemoBanner>
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Version</th>
            <th scope="col">Created</th>
            <th scope="col">Author</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockVersions.map((v) => (
            <tr key={v.id}>
              <td>{v.label}</td>
              <td>{v.created}</td>
              <td>{v.author}</td>
              <td>{v.status}</td>
              <td>
                <button type="button" className="btn btn--light" disabled={v.status === 'published'}>
                  Restore
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScheduledPage() {
  return (
    <div className="admin-page">
      <h1>Scheduled publishing & archive</h1>
      <DemoBanner>
        Schedule go-live and archive dates for news, jobs and other content.
      </DemoBanner>
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">When</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {mockSchedule.map((s) => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>{s.publishAt}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PublishPage() {
  const [step, setStep] = useState(0);
  const steps = [
    'CMS content ready',
    'Generate static website',
    'Preview build',
    'Publish to public folder',
    'Rollback available',
  ];

  return (
    <div className="admin-page">
      <h1>Publish & rollback</h1>
      <DemoBanner>
        CMS → Generate Static Website → Preview → Publish → Rollback. All steps
        run locally on ICON-INSTITUTE’s server — no external transfer.
      </DemoBanner>
      <ol className="admin-pipeline admin-pipeline--interactive">
        {steps.map((label, i) => (
          <li key={label} className={i <= step ? 'is-done' : ''}>
            {label}
          </li>
        ))}
      </ol>
      <div className="admin-toolbar">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
        >
          Run next step
        </button>
        <button
          type="button"
          className="btn btn--light"
          onClick={() => setStep(0)}
        >
          Reset demo
        </button>
      </div>
      {step >= 3 && (
        <p className="status-box" role="status">
          Demo: static site would now be live. Use version history to roll back.
        </p>
      )}
    </div>
  );
}

export function UsersRolesPage() {
  return (
    <div className="admin-page">
      <h1>Users & roles</h1>
      <DemoBanner>
        User management with role-based permissions and secure password
        management (demo).
      </DemoBanner>
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">2FA</th>
          </tr>
        </thead>
        <tbody>
          {DEMO_USERS.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.twoFactorEnabled ? 'Enabled' : 'Off'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
        <h2>Reset password (demo)</h2>
        <label>
          New password
          <input type="password" autoComplete="new-password" />
        </label>
        <label>
          Confirm password
          <input type="password" autoComplete="new-password" />
        </label>
        <p className="field-hint">
          Production uses secure password hashing (e.g. Argon2/bcrypt). Not
          stored in this frontend demo.
        </p>
        <SaveBar label="Update password" />
      </form>
    </div>
  );
}

export function SecurityPage() {
  return (
    <div className="admin-page">
      <h1>Security & 2FA</h1>
      <DemoBanner>
        Two-factor authentication, HTTPS/HSTS/CSP headers and related controls
        are specified for production. This screen is a UI preview.
      </DemoBanner>
      <ul className="admin-checklist">
        <li>HTTPS enforced site-wide</li>
        <li>HTTP Strict Transport Security (HSTS)</li>
        <li>Content Security Policy (CSP)</li>
        <li>X-Frame-Options / X-Content-Type-Options</li>
        <li>Secure password hashing for CMS accounts</li>
        <li>2FA for CMS users</li>
        <li>Logging and audit trails</li>
        <li>Automated backups & security updates</li>
      </ul>
      <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
        <h2>Set up authenticator app</h2>
        <div className="admin-qr-placeholder" aria-hidden="true">
          QR
        </div>
        <label>
          Verification code
          <input type="text" inputMode="numeric" placeholder="123456" />
        </label>
        <SaveBar label="Enable 2FA" />
      </form>
    </div>
  );
}

export function AuditLogPage() {
  return (
    <div className="admin-page">
      <h1>Audit log</h1>
      <DemoBanner>
        Logging and audit trails for CMS activity.
      </DemoBanner>
      <label className="admin-search">
        Search audit log
        <input type="search" placeholder="Filter by user or action…" />
      </label>
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">User</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {mockAuditLog.map((row) => (
            <tr key={row.id}>
              <td>{row.time}</td>
              <td>{row.user}</td>
              <td>{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BackupsPage() {
  return (
    <div className="admin-page">
      <h1>Backup & recovery</h1>
      <DemoBanner>
        CMS, media and configuration backups with recovery procedures (demo
        listing).
      </DemoBanner>
      <ul className="admin-checklist">
        <li>Backup frequency: daily full + hourly config (planned)</li>
        <li>Restoration testing: quarterly checklist</li>
        <li>Retention: 30 daily / 12 monthly</li>
      </ul>
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Backup</th>
            <th scope="col">Time</th>
            <th scope="col">Size</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockBackups.map((b) => (
            <tr key={b.id}>
              <td>{b.label}</td>
              <td>{b.time}</td>
              <td>{b.size}</td>
              <td>
                <button type="button" className="btn btn--light">
                  Restore
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
