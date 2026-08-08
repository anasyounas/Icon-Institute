import { useMemo, useState, type FormEvent } from 'react';
import { EmptyRow, FilterBar } from '../../components/admin/AdminUI';
import { Pagination } from '../../components/Pagination';
import {
  CMS_STATUS_OPTIONS,
  CmsStatusPill,
  EXPERTISE_LABELS,
  REGION_LABELS,
  ScheduleDialog,
  VOLUME_LABELS,
  VersionsDialog,
  WorkflowActions,
  errorText,
  toOptions,
  useApiList,
} from '../../components/admin/cms';
import { useAuth } from '../../hooks/useAuth';
import { api, type ProjectItem } from '../../lib/api';

const PAGE_SIZE = 10;

type Draft = {
  title: string;
  country: string;
  region: string;
  yearStart: string;
  yearEnd: string;
  expertise: string;
  volume: string;
  description: string;
};

const EMPTY: Draft = {
  title: '',
  country: '',
  region: 'africa',
  yearStart: '',
  yearEnd: '',
  expertise: 'economic-employment-promotion',
  volume: 'lt-100k',
  description: '',
};

export function ProjectsManagerPage() {
  const { can } = useAuth();
  const [q, setQ] = useState('');
  const [cmsStatus, setCmsStatus] = useState('');
  const [region, setRegion] = useState('');
  const [expertise, setExpertise] = useState('');
  const [volume, setVolume] = useState('');
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      search: q || undefined,
      cms_status: cmsStatus || undefined,
      region: region || undefined,
      expertise: expertise || undefined,
      volume: volume || undefined,
    }),
    [q, cmsStatus, region, expertise, volume]
  );
  const { rows, total, totalPages, loading, error, reload } = useApiList<ProjectItem>(
    (p) => api.projects.list(p),
    params,
    page,
    PAGE_SIZE
  );

  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [editing, setEditing] = useState<ProjectItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [scheduleFor, setScheduleFor] = useState<ProjectItem | null>(null);
  const [versionsFor, setVersionsFor] = useState<ProjectItem | null>(null);

  const onChanged = (_: ProjectItem, message: string) => {
    setNotice(message);
    setActionError('');
    reload();
  };

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    const year = String(new Date().getFullYear());
    setDraft({ ...EMPTY, yearStart: year, yearEnd: year });
    setFormError('');
  };

  const openEdit = (item: ProjectItem) => {
    setEditing(item);
    setCreating(false);
    setDraft({
      title: item.title,
      country: item.country,
      region: item.region,
      yearStart: String(item.yearStart),
      yearEnd: String(item.yearEnd),
      expertise: item.expertise,
      volume: item.volume,
      description: item.description,
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

    const start = Number(draft.yearStart);
    const end = Number(draft.yearEnd);
    if (end < start) {
      setFormError('The end year cannot be before the start year.');
      setSaving(false);
      return;
    }

    const payload = {
      title: draft.title,
      country: draft.country,
      region: draft.region,
      yearStart: start,
      yearEnd: end,
      expertise: draft.expertise,
      volume: draft.volume,
      description: draft.description,
    };
    try {
      if (editing) {
        await api.projects.update(editing.id, payload);
        setNotice(`Saved “${draft.title}”.`);
      } else {
        await api.projects.create(payload);
        setNotice(`Created draft project “${draft.title}”.`);
      }
      closeForm();
      reload();
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: ProjectItem) => {
    if (!window.confirm(`Delete the project “${item.title}”?`)) return;
    try {
      await api.projects.remove(item.id);
      setNotice(`Deleted “${item.title}”.`);
      reload();
    } catch (err) {
      setActionError(errorText(err));
    }
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="admin-page">
      <h1>Projects Manager</h1>
      <p className="admin-banner">
        Add and edit project entries manually — region, running period,
        expertise area and volume — replacing the former automated upload
        connection. Visitors keep the exact same filters on the website.
      </p>

      {notice && (
        <p className="status-box" role="status">
          {notice}
        </p>
      )}
      {(error || actionError) && (
        <p className="admin-login__error" role="alert">
          {error || actionError}
        </p>
      )}

      <FilterBar
        search={{
          id: 'projects-q',
          label: 'Search projects',
          value: q,
          placeholder: 'Title, country or keyword…',
          onChange: (v) => {
            setQ(v);
            setPage(1);
          },
        }}
        selects={[
          {
            id: 'projects-status',
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
            id: 'projects-region',
            label: 'Region',
            value: region,
            onChange: (v) => {
              setRegion(v);
              setPage(1);
            },
            allLabel: 'All regions',
            options: toOptions(REGION_LABELS),
          },
          {
            id: 'projects-expertise',
            label: 'Expertise',
            value: expertise,
            onChange: (v) => {
              setExpertise(v);
              setPage(1);
            },
            allLabel: 'All expertise',
            options: toOptions(EXPERTISE_LABELS),
          },
          {
            id: 'projects-volume',
            label: 'Volume',
            value: volume,
            onChange: (v) => {
              setVolume(v);
              setPage(1);
            },
            allLabel: 'Any volume',
            options: toOptions(VOLUME_LABELS),
          },
        ]}
        resultCount={rows.length}
        totalCount={total}
        onReset={() => {
          setQ('');
          setCmsStatus('');
          setRegion('');
          setExpertise('');
          setVolume('');
          setPage(1);
        }}
        action={
          can('content:write') ? (
            <button type="button" className="btn btn--primary" onClick={openCreate}>
              Add project
            </button>
          ) : undefined
        }
      />

      {(creating || editing) && (
        <form className="admin-form-card is-editing" onSubmit={submit}>
          <header className="admin-form-card__head">
            <h2>{editing ? `Edit: ${editing.title}` : 'New project'}</h2>
            {editing && <CmsStatusPill status={editing.cms_status} />}
          </header>

          <fieldset className="admin-form" disabled={saving}>
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
              Country *
              <input
                type="text"
                required
                value={draft.country}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                placeholder="Germany — or “Various countries”"
              />
            </label>
            <label>
              Region *
              <select
                value={draft.region}
                onChange={(e) => setDraft({ ...draft, region: e.target.value })}
              >
                {toOptions(REGION_LABELS).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Running period — start year *
              <input
                type="number"
                required
                min={1975}
                max={2100}
                value={draft.yearStart}
                onChange={(e) => setDraft({ ...draft, yearStart: e.target.value })}
              />
            </label>
            <label>
              Running period — end year *
              <input
                type="number"
                required
                min={1975}
                max={2100}
                value={draft.yearEnd}
                onChange={(e) => setDraft({ ...draft, yearEnd: e.target.value })}
              />
            </label>
            <label>
              Expertise area *
              <select
                value={draft.expertise}
                onChange={(e) => setDraft({ ...draft, expertise: e.target.value })}
              >
                {toOptions(EXPERTISE_LABELS).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Project volume *
              <select
                value={draft.volume}
                onChange={(e) => setDraft({ ...draft, volume: e.target.value })}
              >
                {toOptions(VOLUME_LABELS).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Description *
              <textarea
                rows={4}
                required
                minLength={10}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </label>
          </fieldset>

          {formError && (
            <p className="admin-login__error" role="alert">
              {formError}
            </p>
          )}

          <div className="admin-savebar">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create draft'}
            </button>
            <button type="button" className="btn btn--light" onClick={closeForm} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Region</th>
              <th scope="col">Period</th>
              <th scope="col">Volume</th>
              <th scope="col">CMS status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={6}>Loading projects…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6}>No projects match the current filters.</EmptyRow>
            ) : (
              rows.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{REGION_LABELS[item.region] ?? item.region}</td>
                  <td className="admin-table__num">
                    {item.yearStart}–{item.yearEnd}
                  </td>
                  <td>{VOLUME_LABELS[item.volume] ?? item.volume}</td>
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
                        module={api.projects}
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
        label="projects"
        variant="admin"
      />

      {scheduleFor && (
        <ScheduleDialog
          item={scheduleFor}
          module={api.projects}
          onClose={() => setScheduleFor(null)}
          onSaved={onChanged}
        />
      )}
      {versionsFor && (
        <VersionsDialog
          item={versionsFor}
          title={versionsFor.title}
          module={api.projects}
          onClose={() => setVersionsFor(null)}
          onRestored={onChanged}
        />
      )}
    </div>
  );
}
