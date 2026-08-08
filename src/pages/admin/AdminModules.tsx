import { useMemo, useState } from 'react';
import { contactPage } from '../../data/contact';
import { jobsPage } from '../../data/jobs';
import { newsItems } from '../../data/news';
import { projectFilters, sampleProjects } from '../../data/projects';
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
import {
  EmptyRow,
  FilterBar,
  LockableForm,
  PanelCard,
  RowActions,
  StatusPill,
  UploadBox,
} from '../../components/admin/AdminUI';
import { Pagination } from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

function DemoBanner({ children }: { children: string }) {
  return <p className="admin-banner">{children}</p>;
}

/** Case-insensitive "does any field contain the query" helper. */
function matches(query: string, ...fields: (string | number | undefined)[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => String(f ?? '').toLowerCase().includes(q));
}

function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------- Content & media */

export function ContentMediaPage() {
  return (
    <div className="admin-page">
      <h1>Content & Media Editor</h1>
      <DemoBanner>
        Edit any page’s text and replace images through the CMS — no code
        required. Demo form only.
      </DemoBanner>

      <LockableForm title="Page content" saveLabel="Save draft">
        {() => (
          <>
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
            <UploadBox
              id="content-image"
              label="Replace image"
              hint="PNG or JPG, up to 5 MB. Optimised automatically on upload."
              accept="image/*"
            />
            <label>
              Image alt text
              <input type="text" defaultValue="ICON-INSTITUTE team at work" />
            </label>
          </>
        )}
      </LockableForm>
    </div>
  );
}

/* ------------------------------------------------------------------ News */

export function NewsManagerPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [year, setYear] = useState('');

  // Stable demo status so filtering stays consistent between renders.
  const rows = useMemo(
    () =>
      newsItems.map((n, i) => ({
        ...n,
        status: i === 0 ? 'Draft' : 'Published',
        year: n.date.slice(0, 4),
      })),
    []
  );

  const years = useMemo(
    () => [...new Set(rows.map((r) => r.year))].sort((a, b) => Number(b) - Number(a)),
    [rows]
  );

  const filtered = rows.filter(
    (n) =>
      matches(q, n.title) &&
      (!status || n.status === status) &&
      (!year || n.year === year)
  );

  const reset = () => {
    setQ('');
    setStatus('');
    setYear('');
  };

  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(filtered, { resetKey: [q, status, year].join('|') });

  return (
    <div className="admin-page">
      <h1>News Manager</h1>
      <DemoBanner>
        Add, edit and remove news articles (title, date, body, image). Backend
        search across CMS content is demonstrated below.
      </DemoBanner>

      <FilterBar
        search={{
          id: 'news-q',
          label: 'Search news',
          value: q,
          placeholder: 'Search titles…',
          onChange: setQ,
        }}
        selects={[
          {
            id: 'news-status',
            label: 'Status',
            value: status,
            onChange: setStatus,
            allLabel: 'All statuses',
            options: [
              { value: 'Published', label: 'Published' },
              { value: 'Draft', label: 'Draft' },
            ],
          },
          {
            id: 'news-year',
            label: 'Year',
            value: year,
            onChange: setYear,
            allLabel: 'All years',
            options: years.map((y) => ({ value: y, label: y })),
          },
        ]}
        resultCount={filtered.length}
        totalCount={rows.length}
        onReset={reset}
        action={
          <button type="button" className="btn btn--primary">
            Add news article
          </button>
        }
      />

      <Table head={['Date', 'Title', 'Status', 'Actions']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={4}>No news articles match the current filters.</EmptyRow>
        ) : (
          pageItems.map((n) => (
            <tr key={n.slug}>
              <td className="admin-table__num">{n.dateLabel}</td>
              <td>{n.title}</td>
              <td>
                <StatusPill value={n.status} />
              </td>
              <td>
                <RowActions onUpload={() => {}} uploadLabel="Image" />
              </td>
            </tr>
          ))
        )}
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="articles"
        variant="admin"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ Jobs */

export function JobsManagerPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const types = [...new Set(jobsPage.listings.map((j) => j.type))];
  const statuses = [...new Set(jobsPage.listings.map((j) => j.status))];

  const filtered = jobsPage.listings.filter(
    (j) =>
      matches(q, j.title, j.location, j.expertise) &&
      (!type || j.type === type) &&
      (!status || j.status === status)
  );

  const reset = () => {
    setQ('');
    setType('');
    setStatus('');
  };

  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(filtered, { resetKey: [q, type, status].join('|') });

  return (
    <div className="admin-page">
      <h1>Jobs Manager</h1>
      <DemoBanner>
        Manage job ads on the website with application options for candidates.
      </DemoBanner>

      <FilterBar
        search={{
          id: 'jobs-q',
          label: 'Search jobs',
          value: q,
          placeholder: 'Title, location or expertise…',
          onChange: setQ,
        }}
        selects={[
          {
            id: 'jobs-type',
            label: 'Type',
            value: type,
            onChange: setType,
            allLabel: 'All types',
            options: types.map((t) => ({ value: t, label: t })),
          },
          {
            id: 'jobs-status',
            label: 'Status',
            value: status,
            onChange: setStatus,
            allLabel: 'All statuses',
            options: statuses.map((s) => ({ value: s, label: s })),
          },
        ]}
        resultCount={filtered.length}
        totalCount={jobsPage.listings.length}
        onReset={reset}
        action={
          <button type="button" className="btn btn--primary">
            Add job ad
          </button>
        }
      />

      <Table head={['Title', 'Type', 'Deadline', 'Status', 'Actions']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={5}>No job ads match the current filters.</EmptyRow>
        ) : (
          pageItems.map((j) => (
            <tr key={j.id}>
              <td>{j.title}</td>
              <td>{j.type}</td>
              <td className="admin-table__num">{j.deadline}</td>
              <td>
                <StatusPill value={j.status} />
              </td>
              <td>
                <RowActions />
              </td>
            </tr>
          ))
        )}
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="jobs"
        variant="admin"
      />

      <LockableForm title="Edit selected job (demo)">
        {() => (
          <>
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
          </>
        )}
      </LockableForm>
    </div>
  );
}

/* -------------------------------------------------------------- Projects */

export function ProjectsManagerPage() {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [expertise, setExpertise] = useState('');
  const [volume, setVolume] = useState('');

  const filtered = sampleProjects.filter(
    (p) =>
      matches(q, p.title, p.country, p.description) &&
      (!region || p.region === region) &&
      (!expertise || p.expertise === expertise) &&
      (!volume || p.volume === volume)
  );

  const reset = () => {
    setQ('');
    setRegion('');
    setExpertise('');
    setVolume('');
  };

  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(filtered, { resetKey: [q, region, expertise, volume].join('|') });

  return (
    <div className="admin-page">
      <h1>Projects Manager</h1>
      <DemoBanner>
        Manually add and edit project entries (region, running period, expertise,
        volume) — replaces the former automated upload connection.
      </DemoBanner>

      <FilterBar
        search={{
          id: 'projects-q',
          label: 'Search projects',
          value: q,
          placeholder: 'Title, country or keyword…',
          onChange: setQ,
        }}
        selects={[
          {
            id: 'projects-region',
            label: 'Region',
            value: region,
            onChange: setRegion,
            allLabel: 'All regions',
            options: projectFilters.regions,
          },
          {
            id: 'projects-expertise',
            label: 'Expertise',
            value: expertise,
            onChange: setExpertise,
            allLabel: 'All expertise',
            options: projectFilters.expertise,
          },
          {
            id: 'projects-volume',
            label: 'Volume',
            value: volume,
            onChange: setVolume,
            allLabel: 'Any volume',
            options: projectFilters.volumes,
          },
        ]}
        resultCount={filtered.length}
        totalCount={sampleProjects.length}
        onReset={reset}
        action={
          <button type="button" className="btn btn--primary">
            Add project
          </button>
        }
      />

      <Table head={['Title', 'Region', 'Period', 'Volume', 'Actions']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={5}>No projects match the current filters.</EmptyRow>
        ) : (
          pageItems.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.region}</td>
              <td className="admin-table__num">
                {p.yearStart}–{p.yearEnd}
              </td>
              <td>{p.volume}</td>
              <td>
                <RowActions />
              </td>
            </tr>
          ))
        )}
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="projects"
        variant="admin"
      />
    </div>
  );
}

/* --------------------------------------------------------------- Contact */

export function ContactInfoPage() {
  const c = contactPage.company;
  return (
    <div className="admin-page">
      <h1>Contact Information</h1>
      <DemoBanner>
        Static contact details (address, phone, email) replace the former public
        contact form.
      </DemoBanner>

      <LockableForm title="Company details">
        {() => (
          <>
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
          </>
        )}
      </LockableForm>
    </div>
  );
}

/* ----------------------------------------------------------------- Media */

export function MediaLibraryPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');

  const types = [...new Set(mockMedia.map((m) => m.type))];
  const filtered = mockMedia.filter(
    (m) => matches(q, m.name, m.alt) && (!type || m.type === type)
  );

  const reset = () => {
    setQ('');
    setType('');
  };

  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(filtered, { resetKey: [q, type].join('|') });

  return (
    <div className="admin-page">
      <h1>Media Library</h1>
      <DemoBanner>
        Media library and document management with automatic image optimisation
        (demo UI).
      </DemoBanner>

      <UploadBox
        id="media-upload"
        label="Upload media"
        hint="Drop images or documents here, or browse. Images are optimised on upload."
      />

      <FilterBar
        search={{
          id: 'media-q',
          label: 'Search media',
          value: q,
          placeholder: 'File name or alt text…',
          onChange: setQ,
        }}
        selects={[
          {
            id: 'media-type',
            label: 'Type',
            value: type,
            onChange: setType,
            allLabel: 'All types',
            options: types.map((t) => ({ value: t, label: t })),
          },
        ]}
        resultCount={filtered.length}
        totalCount={mockMedia.length}
        onReset={reset}
      />

      <Table head={['File', 'Type', 'Size', 'Alt text', 'Actions']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={5}>No media matches the current filters.</EmptyRow>
        ) : (
          pageItems.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.type}</td>
              <td className="admin-table__num">{m.size}</td>
              <td>{m.alt || '—'}</td>
              <td>
                <RowActions onUpload={() => {}} uploadLabel="Replace" />
              </td>
            </tr>
          ))
        )}
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="files"
        variant="admin"
      />
    </div>
  );
}

/* ------------------------------------------------------------------- SEO */

export function SeoManagerPage() {
  const [q, setQ] = useState('');
  const entries = Object.values(pageSeo);
  const filtered = entries.filter((p) => matches(q, p.path, p.title, p.description));

  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(filtered, { resetKey: q });

  return (
    <div className="admin-page">
      <h1>SEO Metadata</h1>
      <DemoBanner>
        SEO fields on every page — title, description, Open Graph and canonical
        path.
      </DemoBanner>

      <FilterBar
        search={{
          id: 'seo-q',
          label: 'Search pages',
          value: q,
          placeholder: 'Path, title or description…',
          onChange: setQ,
        }}
        resultCount={filtered.length}
        totalCount={entries.length}
        onReset={() => setQ('')}
      />

      <Table head={['Path', 'Meta title', 'Description', 'Actions']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={4}>No pages match the current search.</EmptyRow>
        ) : (
          pageItems.map((p) => (
            <tr key={p.path}>
              <td>
                <code>{p.path}</code>
              </td>
              <td>{p.title}</td>
              <td>{p.description}</td>
              <td>
                <RowActions disableDelete deleteTitle="Page metadata cannot be deleted" />
              </td>
            </tr>
          ))
        )}
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="pages"
        variant="admin"
      />

      <LockableForm title="Edit page SEO">
        {() => (
          <>
            <label>
              Meta title
              <input type="text" defaultValue={pageSeo.home.title} />
            </label>
            <label>
              Meta description
              <textarea rows={3} defaultValue={pageSeo.home.description} />
            </label>
          </>
        )}
      </LockableForm>
    </div>
  );
}

/* ----------------------------------------------------------- Draft/preview */

export function DraftPreviewPage() {
  return (
    <div className="admin-page">
      <h1>Draft mode & preview</h1>
      <DemoBanner>
        Save as draft and preview the regenerated static pages before publishing.
      </DemoBanner>
      <div className="admin-split">
        <LockableForm title="Current draft" saveLabel="Save draft">
          {() => (
            <>
              <label>
                News item
                <input type="text" defaultValue="IPA 2022 July update" />
              </label>
              <label>
                Last edited by
                <input type="text" defaultValue="editor@icon-institute.de" />
              </label>
            </>
          )}
        </LockableForm>
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

/* -------------------------------------------------------------- Workflow */

export function WorkflowPage() {
  const [stage, setStage] = useState('');
  const [assignee, setAssignee] = useState('');

  const stages = [...new Set(mockWorkflow.map((w) => w.stage))];
  const assignees = [...new Set(mockWorkflow.map((w) => w.assignee))];

  const filtered = mockWorkflow.filter(
    (w) => (!stage || w.stage === stage) && (!assignee || w.assignee === assignee)
  );

  const reset = () => {
    setStage('');
    setAssignee('');
  };

  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(filtered, { resetKey: [stage, assignee].join('|') });

  return (
    <div className="admin-page">
      <h1>Approval workflow</h1>
      <DemoBanner>Role-based approval before content goes live.</DemoBanner>

      <FilterBar
        selects={[
          {
            id: 'wf-stage',
            label: 'Stage',
            value: stage,
            onChange: setStage,
            allLabel: 'All stages',
            options: stages.map((s) => ({ value: s, label: s })),
          },
          {
            id: 'wf-assignee',
            label: 'Assignee',
            value: assignee,
            onChange: setAssignee,
            allLabel: 'All assignees',
            options: assignees.map((a) => ({ value: a, label: a })),
          },
        ]}
        resultCount={filtered.length}
        totalCount={mockWorkflow.length}
        onReset={reset}
      />

      <Table head={['Item', 'Stage', 'Assignee', 'Actions']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={4}>No items match the current filters.</EmptyRow>
        ) : (
          pageItems.map((w) => (
            <tr key={w.id}>
              <td>{w.title}</td>
              <td>
                <StatusPill value={w.stage} />
              </td>
              <td>{w.assignee}</td>
              <td>
                <div className="row-actions">
                  <button type="button" className="row-action">
                    Approve
                  </button>
                  <button type="button" className="row-action">
                    Request changes
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="items"
        variant="admin"
      />
    </div>
  );
}

/* --------------------------------------------------------------- Versions */

export function VersionHistoryPage() {
  const [status, setStatus] = useState('');
  const statuses = [...new Set(mockVersions.map((v) => v.status))];
  const filtered = mockVersions.filter((v) => !status || v.status === status);

  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(filtered, { resetKey: status });

  return (
    <div className="admin-page">
      <h1>Version history</h1>
      <DemoBanner>
        Track published builds and restore previous versions when needed.
      </DemoBanner>

      <FilterBar
        selects={[
          {
            id: 'ver-status',
            label: 'Status',
            value: status,
            onChange: setStatus,
            allLabel: 'All statuses',
            options: statuses.map((s) => ({ value: s, label: s })),
          },
        ]}
        resultCount={filtered.length}
        totalCount={mockVersions.length}
        onReset={() => setStatus('')}
      />

      <Table head={['Version', 'Created', 'Author', 'Status', 'Actions']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={5}>No builds match the current filter.</EmptyRow>
        ) : (
          pageItems.map((v) => (
            <tr key={v.id}>
              <td>{v.label}</td>
              <td className="admin-table__num">{v.created}</td>
              <td>{v.author}</td>
              <td>
                <StatusPill value={v.status} />
              </td>
              <td>
                <div className="row-actions">
                  <button
                    type="button"
                    className="row-action"
                    disabled={v.status === 'published'}
                    title={
                      v.status === 'published' ? 'This build is already live' : undefined
                    }
                  >
                    Restore
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="builds"
        variant="admin"
      />
    </div>
  );
}

/* -------------------------------------------------------------- Scheduled */

export function ScheduledPage() {
  const [status, setStatus] = useState('');
  const statuses = [...new Set(mockSchedule.map((s) => s.status))];
  const filtered = mockSchedule.filter((s) => !status || s.status === status);

  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(filtered, { resetKey: status });

  return (
    <div className="admin-page">
      <h1>Scheduled publishing & archive</h1>
      <DemoBanner>
        Schedule go-live and archive dates for news, jobs and other content.
      </DemoBanner>

      <FilterBar
        selects={[
          {
            id: 'sched-status',
            label: 'Status',
            value: status,
            onChange: setStatus,
            allLabel: 'All statuses',
            options: statuses.map((s) => ({ value: s, label: s })),
          },
        ]}
        resultCount={filtered.length}
        totalCount={mockSchedule.length}
        onReset={() => setStatus('')}
      />

      <Table head={['Item', 'When', 'Status', 'Actions']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={4}>Nothing matches the current filter.</EmptyRow>
        ) : (
          pageItems.map((s) => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td className="admin-table__num">{s.publishAt}</td>
              <td>
                <StatusPill value={s.status} />
              </td>
              <td>
                <RowActions />
              </td>
            </tr>
          ))
        )}
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="items"
        variant="admin"
      />
    </div>
  );
}

/* ---------------------------------------------------------------- Publish */

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
      <PanelCard title="Pipeline">
        <ol className="admin-pipeline admin-pipeline--interactive">
          {steps.map((label, i) => (
            <li key={label} className={i <= step ? 'is-done' : ''}>
              {label}
            </li>
          ))}
        </ol>
        <div className="admin-savebar">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          >
            Run next step
          </button>
          <button type="button" className="btn btn--light" onClick={() => setStep(0)}>
            Reset demo
          </button>
        </div>
        {step >= 3 && (
          <p className="status-box" role="status">
            Demo: static site would now be live. Use version history to roll back.
          </p>
        )}
      </PanelCard>
    </div>
  );
}

/* ------------------------------------------------------------------ Users */

export function UsersRolesPage() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [twoFa, setTwoFa] = useState('');

  const roles = [...new Set(DEMO_USERS.map((u) => u.role))];

  const filtered = DEMO_USERS.filter(
    (u) =>
      matches(q, u.name, u.email) &&
      (!role || u.role === role) &&
      (!twoFa || String(u.twoFactorEnabled) === twoFa)
  );

  const reset = () => {
    setQ('');
    setRole('');
    setTwoFa('');
  };

  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(filtered, { resetKey: [q, role, twoFa].join('|') });

  return (
    <div className="admin-page">
      <h1>Users & roles</h1>
      <DemoBanner>
        User management with role-based permissions and secure password
        management (demo).
      </DemoBanner>

      <FilterBar
        search={{
          id: 'users-q',
          label: 'Search users',
          value: q,
          placeholder: 'Name or email…',
          onChange: setQ,
        }}
        selects={[
          {
            id: 'users-role',
            label: 'Role',
            value: role,
            onChange: setRole,
            allLabel: 'All roles',
            options: roles.map((r) => ({ value: r, label: r })),
          },
          {
            id: 'users-2fa',
            label: '2FA',
            value: twoFa,
            onChange: setTwoFa,
            allLabel: 'Any',
            options: [
              { value: 'true', label: 'Enabled' },
              { value: 'false', label: 'Off' },
            ],
          },
        ]}
        resultCount={filtered.length}
        totalCount={DEMO_USERS.length}
        onReset={reset}
        action={
          <button type="button" className="btn btn--primary">
            Add user
          </button>
        }
      />

      <Table head={['Name', 'Email', 'Role', '2FA', 'Actions']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={5}>No users match the current filters.</EmptyRow>
        ) : (
          pageItems.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <StatusPill value={u.twoFactorEnabled ? 'Enabled' : 'Off'} />
              </td>
              <td>
                <RowActions />
              </td>
            </tr>
          ))
        )}
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="users"
        variant="admin"
      />

      <LockableForm title="Reset password (demo)" saveLabel="Update password">
        {() => (
          <>
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
          </>
        )}
      </LockableForm>
    </div>
  );
}

/* -------------------------------------------------------------- Security */

export function SecurityPage() {
  return (
    <div className="admin-page">
      <h1>Security & 2FA</h1>
      <DemoBanner>
        Two-factor authentication, HTTPS/HSTS/CSP headers and related controls
        are specified for production. This screen is a UI preview.
      </DemoBanner>

      <PanelCard title="Production controls">
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
      </PanelCard>

      <LockableForm title="Set up authenticator app" saveLabel="Enable 2FA">
        {() => (
          <>
            <div className="admin-qr-placeholder" aria-hidden="true">
              QR
            </div>
            <label>
              Verification code
              <input type="text" inputMode="numeric" placeholder="123456" />
            </label>
          </>
        )}
      </LockableForm>
    </div>
  );
}

/* ------------------------------------------------------------- Audit log */

export function AuditLogPage() {
  const [q, setQ] = useState('');
  const [user, setUser] = useState('');

  const users = [...new Set(mockAuditLog.map((r) => r.user))];
  const filtered = mockAuditLog.filter(
    (r) => matches(q, r.action, r.user, r.time) && (!user || r.user === user)
  );

  const reset = () => {
    setQ('');
    setUser('');
  };

  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(filtered, { resetKey: [q, user].join('|') });

  return (
    <div className="admin-page">
      <h1>Audit log</h1>
      <DemoBanner>Logging and audit trails for CMS activity.</DemoBanner>

      <FilterBar
        search={{
          id: 'audit-q',
          label: 'Search audit log',
          value: q,
          placeholder: 'Filter by user or action…',
          onChange: setQ,
        }}
        selects={[
          {
            id: 'audit-user',
            label: 'User',
            value: user,
            onChange: setUser,
            allLabel: 'All users',
            options: users.map((u) => ({ value: u, label: u })),
          },
        ]}
        resultCount={filtered.length}
        totalCount={mockAuditLog.length}
        onReset={reset}
      />

      <Table head={['Time', 'User', 'Action']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={3}>No log entries match the current filters.</EmptyRow>
        ) : (
          pageItems.map((row) => (
            <tr key={row.id}>
              <td className="admin-table__num">{row.time}</td>
              <td>{row.user}</td>
              <td>{row.action}</td>
            </tr>
          ))
        )}
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="entries"
        variant="admin"
      />
    </div>
  );
}

/* --------------------------------------------------------------- Backups */

export function BackupsPage() {
  const [q, setQ] = useState('');
  const filtered = mockBackups.filter((b) => matches(q, b.label, b.time));

  const { page, totalPages, pageItems, setPage, from, to, total } =
    usePagination(filtered, { resetKey: q });

  return (
    <div className="admin-page">
      <h1>Backup & recovery</h1>
      <DemoBanner>
        CMS, media and configuration backups with recovery procedures (demo
        listing).
      </DemoBanner>

      <PanelCard title="Policy">
        <ul className="admin-checklist">
          <li>Backup frequency: daily full + hourly config (planned)</li>
          <li>Restoration testing: quarterly checklist</li>
          <li>Retention: 30 daily / 12 monthly</li>
        </ul>
      </PanelCard>

      <FilterBar
        search={{
          id: 'backup-q',
          label: 'Search backups',
          value: q,
          placeholder: 'Label or date…',
          onChange: setQ,
        }}
        resultCount={filtered.length}
        totalCount={mockBackups.length}
        onReset={() => setQ('')}
        action={
          <button type="button" className="btn btn--primary">
            Run backup now
          </button>
        }
      />

      <Table head={['Backup', 'Time', 'Size', 'Actions']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={4}>No backups match the current search.</EmptyRow>
        ) : (
          pageItems.map((b) => (
            <tr key={b.id}>
              <td>{b.label}</td>
              <td className="admin-table__num">{b.time}</td>
              <td className="admin-table__num">{b.size}</td>
              <td>
                <div className="row-actions">
                  <button type="button" className="row-action">
                    Restore
                  </button>
                  <button type="button" className="row-action">
                    Download
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="backups"
        variant="admin"
      />
    </div>
  );
}
