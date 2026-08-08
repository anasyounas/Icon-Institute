import { useMemo, useState, type FormEvent } from 'react';
import { EmptyRow, FilterBar, PanelCard, StatusPill } from '../../components/admin/AdminUI';
import { Pagination } from '../../components/Pagination';
import {
  CMS_STATUS_OPTIONS,
  CmsStatusPill,
  LinesEditor,
  ScheduleDialog,
  VersionsDialog,
  WorkflowActions,
  errorText,
  formatWhen,
  useApiList,
} from '../../components/admin/cms';
import { FormSection, Modal, Wide } from '../../components/admin/Modal';
import { confirmToast, showToast } from '../../components/admin/Toast';
import { useAuth } from '../../hooks/useAuth';
import {
  api,
  authorizedDownload,
  type ApplicationRecord,
  type JobItem,
} from '../../lib/api';

const PAGE_SIZE = 10;
const JOB_TYPES = ['Permanent', 'Short-term expert', 'Freelance'] as const;

type Draft = {
  title: string;
  location: string;
  type: (typeof JOB_TYPES)[number];
  expertise: string;
  published: string;
  deadline: string;
  status: 'open' | 'closed';
  summary: string;
  description: string[];
  requirements: string[];
  application_email: string;
};

const EMPTY: Draft = {
  title: '',
  location: '',
  type: 'Permanent',
  expertise: '',
  published: '',
  deadline: '',
  status: 'open',
  summary: '',
  description: [],
  requirements: [],
  application_email: '',
};

/* ------------------------------------------------------------ applications */

function ApplicationsPanel() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ status: status || undefined }), [status]);
  const { rows, total, totalPages, loading, error, reload } =
    useApiList<ApplicationRecord>((p) => api.applications.list(p), params, page, 8);
  const [actionError, setActionError] = useState('');

  const setAppStatus = async (row: ApplicationRecord, next: ApplicationRecord['status']) => {
    try {
      await api.applications.setStatus(row.id, next);
      reload();
    } catch (err) {
      setActionError(errorText(err));
    }
  };

  const from = total === 0 ? 0 : (page - 1) * 8 + 1;
  const to = Math.min(page * 8, total);

  return (
    <div className="applications-panel">
    <PanelCard
      title="Applications received"
      subtitle="Submitted by candidates through the website's application form."
    >
      {(error || actionError) && (
        <p className="admin-login__error" role="alert">
          {error || actionError}
        </p>
      )}

      <FilterBar
        selects={[
          {
            id: 'app-status',
            label: 'Status',
            value: status,
            onChange: (v) => {
              setStatus(v);
              setPage(1);
            },
            allLabel: 'All statuses',
            options: [
              { value: 'new', label: 'New' },
              { value: 'reviewed', label: 'Reviewed' },
              { value: 'shortlisted', label: 'Shortlisted' },
              { value: 'rejected', label: 'Rejected' },
            ],
          },
        ]}
        resultCount={rows.length}
        totalCount={total}
        onReset={() => {
          setStatus('');
          setPage(1);
        }}
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Received</th>
              <th scope="col">Candidate</th>
              <th scope="col">Job</th>
              <th scope="col">Files</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={6}>Loading applications…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6}>No applications yet.</EmptyRow>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="admin-table__num">{formatWhen(row.created_at)}</td>
                  <td>
                    {row.name}
                    <br />
                    <a href={`mailto:${row.email}`} className="field-hint">
                      {row.email}
                    </a>
                  </td>
                  <td>{row.job_title}</td>
                  <td>
                    {row.files.map((f) => (
                      <button
                        key={f.stored_name}
                        type="button"
                        className="row-action"
                        onClick={() =>
                          void authorizedDownload(
                            api.applications.fileUrl(row.id, f.stored_name),
                            f.name
                          ).catch((err: unknown) => setActionError(errorText(err)))
                        }
                      >
                        {f.kind === 'cv' ? 'CV' : 'Cert.'}
                      </button>
                    ))}
                  </td>
                  <td>
                    <StatusPill value={row.status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="row-action" onClick={() => void setAppStatus(row, 'reviewed')}>
                        Reviewed
                      </button>
                      <button type="button" className="row-action" onClick={() => void setAppStatus(row, 'shortlisted')}>
                        Shortlist
                      </button>
                      <button
                        type="button"
                        className="row-action row-action--danger"
                        onClick={() => void setAppStatus(row, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        from={from}
        to={to}
        total={total}
        label="applications"
        variant="admin"
      />
    </PanelCard>
    </div>
  );
}

/* ------------------------------------------------------------------- page */

export function JobsManagerPage() {
  const { can } = useAuth();
  const [q, setQ] = useState('');
  const [cmsStatus, setCmsStatus] = useState('');
  const [type, setType] = useState('');
  const [openState, setOpenState] = useState('');
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      search: q || undefined,
      cms_status: cmsStatus || undefined,
      type: type || undefined,
      status: openState || undefined,
    }),
    [q, cmsStatus, type, openState]
  );
  const { rows, total, totalPages, loading, error, reload } = useApiList<JobItem>(
    (p) => api.jobs.list(p),
    params,
    page,
    PAGE_SIZE
  );

  const [actionError, setActionError] = useState('');
  const [editing, setEditing] = useState<JobItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [scheduleFor, setScheduleFor] = useState<JobItem | null>(null);
  const [versionsFor, setVersionsFor] = useState<JobItem | null>(null);

  const onChanged = (_: JobItem, message: string) => {
    showToast(message);
    setActionError('');
    reload();
  };

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setDraft({
      ...EMPTY,
      published: new Date().toISOString().slice(0, 10),
    });
    setFormError('');
  };

  const openEdit = (item: JobItem) => {
    setEditing(item);
    setCreating(false);
    setDraft({
      title: item.title,
      location: item.location,
      type: item.type,
      expertise: item.expertise,
      published: item.published,
      deadline: item.deadline,
      status: item.status,
      summary: item.summary,
      description: item.description ?? [],
      requirements: item.requirements ?? [],
      application_email: item.application_email ?? '',
    });
    setFormError('');
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setFormError('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = {
      ...draft,
      description: draft.description.filter((p) => p.trim()),
      requirements: draft.requirements.filter((p) => p.trim()),
      application_email: draft.application_email || null,
    };
    try {
      if (editing) {
        await api.jobs.update(editing.id, payload);
        showToast(`Saved “${draft.title}”.`);
      } else {
        await api.jobs.create(payload);
        showToast(`Created draft job ad “${draft.title}”.`);
      }
      closeForm();
      reload();
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: JobItem) => {
    if (!(await confirmToast(`Delete the job ad “${item.title}”?`))) return;
    try {
      await api.jobs.remove(item.id);
      showToast(`Deleted “${item.title}”.`);
      showToast(`Deleted “${item.title}”.`);
      reload();
    } catch (err) {
      setActionError(errorText(err));
    }
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="admin-page">
      <h1>Jobs Manager</h1>
      <p className="admin-banner">
        Post and manage job ads with an on-site application option. All fields
        marked * are mandatory — the site needs each of them to render the ad.
      </p>

      {(error || actionError) && (
        <p className="admin-login__error" role="alert">
          {error || actionError}
        </p>
      )}

      <FilterBar
        search={{
          id: 'jobs-q',
          label: 'Search jobs',
          value: q,
          placeholder: 'Title, location or expertise…',
          onChange: (v) => {
            setQ(v);
            setPage(1);
          },
        }}
        selects={[
          {
            id: 'jobs-cms-status',
            label: 'CMS status',
            value: cmsStatus,
            onChange: (v) => {
              setCmsStatus(v);
              setPage(1);
            },
            allLabel: 'All statuses',
            options: CMS_STATUS_OPTIONS,
          },
          {
            id: 'jobs-type',
            label: 'Type',
            value: type,
            onChange: (v) => {
              setType(v);
              setPage(1);
            },
            allLabel: 'All types',
            options: JOB_TYPES.map((t) => ({ value: t, label: t })),
          },
          {
            id: 'jobs-open',
            label: 'Listing',
            value: openState,
            onChange: (v) => {
              setOpenState(v);
              setPage(1);
            },
            allLabel: 'Open & closed',
            options: [
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
            ],
          },
        ]}
        resultCount={rows.length}
        totalCount={total}
        onReset={() => {
          setQ('');
          setCmsStatus('');
          setType('');
          setOpenState('');
          setPage(1);
        }}
        action={
          can('content:write') ? (
            <button type="button" className="btn btn--primary" onClick={openCreate}>
              Add job ad
            </button>
          ) : undefined
        }
      />

      {(creating || editing) && (
        <Modal
          title={editing ? 'Edit job ad' : 'New job ad'}
          subtitle={
            editing
              ? editing.title
              : 'Every field marked * is needed for the site to render the ad.'
          }
          badge={editing && <CmsStatusPill status={editing.cms_status} />}
          onClose={closeForm}
          onSubmit={submit}
          busy={saving}
          size="large"
          footer={
            <>
              {formError && (
                <p className="cms-modal__error" role="alert">
                  {formError}
                </p>
              )}
              <div className="cms-modal__buttons">
                <button type="button" className="btn btn--light" onClick={closeForm} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Create draft'}
                </button>
              </div>
            </>
          }
        >
          <fieldset className="cms-fieldset" disabled={saving}>
            <FormSection title="The role">
              <label>
                Title *
                <input
                  type="text"
                  required
                  minLength={3}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </label>
              <label>
                Location *
                <input
                  type="text"
                  required
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  placeholder="Köln, Germany (with travel abroad)"
                />
              </label>
              <label>
                Contract type *
                <select
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as Draft['type'] })}
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Expertise area *
                <input
                  type="text"
                  required
                  value={draft.expertise}
                  onChange={(e) => setDraft({ ...draft, expertise: e.target.value })}
                  placeholder="Economic and Employment Promotion"
                />
              </label>
              <Wide>
                <label>
                  Summary *
                  <textarea
                    rows={2}
                    required
                    minLength={10}
                    value={draft.summary}
                    onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                  />
                  <span className="field-hint">Shown on the jobs listing.</span>
                </label>
              </Wide>
            </FormSection>

            <FormSection title="Dates and availability">
              <label>
                Listing date *
                <input
                  type="date"
                  required
                  value={draft.published}
                  onChange={(e) => setDraft({ ...draft, published: e.target.value })}
                />
              </label>
              <label>
                Application deadline *
                <input
                  type="date"
                  required
                  value={draft.deadline}
                  onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                />
              </label>
              <label>
                Listing state *
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value as 'open' | 'closed' })
                  }
                >
                  <option value="open">Open — accepting applications</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label>
                Application email
                <input
                  type="email"
                  value={draft.application_email}
                  onChange={(e) => setDraft({ ...draft, application_email: e.target.value })}
                  placeholder="cv-icon@icon-institute.de"
                />
                <span className="field-hint">
                  Leave empty to use the site-wide address.
                </span>
              </label>
            </FormSection>

            <FormSection title="Details">
              <Wide>
                <LinesEditor
                  label="Role description *"
                  value={draft.description}
                  onChange={(description) => setDraft({ ...draft, description })}
                  rows={6}
                  required
                  hint="One paragraph per line — at least one is required."
                />
              </Wide>
              <Wide>
                <LinesEditor
                  label="Requirements *"
                  value={draft.requirements}
                  onChange={(requirements) => setDraft({ ...draft, requirements })}
                  rows={6}
                  required
                  hint="One requirement per line — shown as bullets on the site."
                />
              </Wide>
            </FormSection>
          </fieldset>
        </Modal>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Type</th>
              <th scope="col">Deadline</th>
              <th scope="col">Listing</th>
              <th scope="col">CMS status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={6}>Loading jobs…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6}>No job ads match the current filters.</EmptyRow>
            ) : (
              rows.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.type}</td>
                  <td className="admin-table__num">{item.deadline}</td>
                  <td>
                    <StatusPill value={item.status} />
                  </td>
                  <td>
                    <CmsStatusPill status={item.cms_status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      {can('content:write') && (
                        <button type="button" className="row-action" onClick={() => openEdit(item)}>
                          Edit
                        </button>
                      )}
                      <WorkflowActions
                        item={item}
                        module={api.jobs}
                        onChanged={onChanged}
                        onError={setActionError}
                      />
                      {can('schedule:manage') && (
                        <button type="button" className="row-action" onClick={() => setScheduleFor(item)}>
                          Schedule
                        </button>
                      )}
                      <button type="button" className="row-action" onClick={() => setVersionsFor(item)}>
                        Versions
                      </button>
                      {can('content:delete') && (
                        <button
                          type="button"
                          className="row-action row-action--danger"
                          onClick={() => void remove(item)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      <ApplicationsPanel />

      {scheduleFor && (
        <ScheduleDialog
          item={scheduleFor}
          module={api.jobs}
          onClose={() => setScheduleFor(null)}
          onSaved={onChanged}
        />
      )}
      {versionsFor && (
        <VersionsDialog
          item={versionsFor}
          title={versionsFor.title}
          module={api.jobs}
          onClose={() => setVersionsFor(null)}
          onRestored={onChanged}
        />
      )}
    </div>
  );
}
