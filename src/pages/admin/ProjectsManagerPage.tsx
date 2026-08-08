import { useMemo, useState, type FormEvent } from 'react';
import { EmptyRow, FilterBar } from '../../components/admin/AdminUI';
import { Pagination } from '../../components/Pagination';
import {
  CMS_STATUS_OPTIONS,
  CmsStatusPill,
  EXPERTISE_LABELS,
  LinesEditor,
  MediaPickerDialog,
  REGION_LABELS,
  ScheduleDialog,
  VOLUME_LABELS,
  VersionsDialog,
  WorkflowActions,
  errorText,
  toOptions,
  useApiList,
} from '../../components/admin/cms';
import { confirmToast, showToast } from '../../components/admin/Toast';
import { useAuth } from '../../hooks/useAuth';
import { api, assetUrl, type ProjectItem } from '../../lib/api';

const PAGE_SIZE = 10;

type Draft = {
  title: string;
  subtitle: string;
  countries: string[];
  region: string;
  yearStart: string;
  yearEnd: string;
  periodStart: string;
  periodEnd: string;
  expertise: string;
  volume: string;
  volumeAmount: string;
  financing: string;
  clientName: string;
  description: string;
  body: string[];
  image: string;
  pdf: string;
};

const EMPTY: Draft = {
  title: '',
  subtitle: '',
  countries: [],
  region: 'africa',
  yearStart: '',
  yearEnd: '',
  periodStart: '',
  periodEnd: '',
  expertise: 'economic-employment-promotion',
  volume: 'lt-100k',
  volumeAmount: '',
  financing: '',
  clientName: '',
  description: '',
  body: [],
  image: '',
  pdf: '',
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
  /** Which field the media picker is currently filling. */
  const [picker, setPicker] = useState<'image' | 'pdf' | null>(null);

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
      subtitle: item.subtitle ?? '',
      countries: item.countries?.length
        ? item.countries
        : item.country
          ? [item.country]
          : [],
      region: item.region,
      yearStart: String(item.yearStart),
      yearEnd: String(item.yearEnd),
      periodStart: item.periodStart ?? '',
      periodEnd: item.periodEnd ?? '',
      expertise: item.expertise,
      volume: item.volume,
      volumeAmount: item.volumeAmount ?? '',
      financing: item.financing ?? '',
      clientName: item.clientName ?? '',
      description: item.description,
      body: item.body ?? [],
      image: item.image ?? '',
      pdf: item.pdf ?? '',
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
    const countries = draft.countries.map((c) => c.trim()).filter(Boolean);
    if (countries.length === 0) {
      setFormError('Enter at least one country.');
      setSaving(false);
      return;
    }
    if (draft.periodStart && draft.periodEnd && draft.periodEnd < draft.periodStart) {
      setFormError('The exact end date cannot be before the start date.');
      setSaving(false);
      return;
    }

    const payload = {
      title: draft.title,
      subtitle: draft.subtitle || null,
      countries,
      region: draft.region,
      yearStart: start,
      yearEnd: end,
      periodStart: draft.periodStart || null,
      periodEnd: draft.periodEnd || null,
      expertise: draft.expertise,
      volume: draft.volume,
      volumeAmount: draft.volumeAmount || null,
      financing: draft.financing || null,
      clientName: draft.clientName || null,
      description: draft.description,
      body: draft.body.filter((p) => p.trim()),
      image: draft.image || null,
      pdf: draft.pdf || null,
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
    if (!(await confirmToast(`Delete the project “${item.title}”?`))) return;
    try {
      await api.projects.remove(item.id);
      setNotice(`Deleted “${item.title}”.`);
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
            <h3 className="admin-subhead">Heading</h3>
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
              Subtitle
              <input
                type="text"
                value={draft.subtitle}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                placeholder="Integrated water catchment management in Zambia (AWARE 2.0)"
              />
              <span className="field-hint">
                The longer descriptive line shown under the title on the project page.
              </span>
            </label>
            <label>
              Featured image
              <span className="admin-image-field">
                {draft.image && (
                  <img
                    src={assetUrl(
                      draft.image.startsWith('/') || draft.image.startsWith('http')
                        ? draft.image
                        : `/images/${draft.image}`
                    )}
                    alt=""
                    className="admin-image-field__preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <input
                  type="text"
                  value={draft.image}
                  placeholder="Choose from the media library →"
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                />
                <button
                  type="button"
                  className="btn btn--light"
                  onClick={() => setPicker('image')}
                >
                  Choose / upload
                </button>
              </span>
            </label>

            <h3 className="admin-subhead">Project facts (shown with icons)</h3>
            <label>
              Countries *
              <input
                type="text"
                required
                value={draft.countries.join(', ')}
                onChange={(e) =>
                  setDraft({ ...draft, countries: e.target.value.split(',') })
                }
                placeholder="Zambia — or Burkina Faso, Ghana, Nigeria"
              />
              <span className="field-hint">
                Separate several countries with commas. A project may span many.
              </span>
            </label>
            <label>
              Region * (drives the regional project pages and the filter)
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
              <span className="field-hint">Used by the visitor's year filter.</span>
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
              Exact start date
              <input
                type="date"
                value={draft.periodStart}
                onChange={(e) => setDraft({ ...draft, periodStart: e.target.value })}
              />
              <span className="field-hint">
                Optional. When both dates are set the project page shows the exact
                period, e.g. 01/12/2025 - 31/01/2028.
              </span>
            </label>
            <label>
              Exact end date
              <input
                type="date"
                value={draft.periodEnd}
                onChange={(e) => setDraft({ ...draft, periodEnd: e.target.value })}
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
              <span className="field-hint">
                Also picks the icon shown on the project card and page.
              </span>
            </label>
            <label>
              Volume bracket * (for the visitor's volume filter)
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
              Exact contract value
              <input
                type="text"
                value={draft.volumeAmount}
                onChange={(e) => setDraft({ ...draft, volumeAmount: e.target.value })}
                placeholder="321.980 €"
              />
              <span className="field-hint">
                Shown on the project page instead of the bracket when filled in.
              </span>
            </label>
            <label>
              Financing
              <input
                type="text"
                value={draft.financing}
                onChange={(e) => setDraft({ ...draft, financing: e.target.value })}
                placeholder="Bundesministerium für Wirtschaftliche Zusammenarbeit (BMZ)"
              />
            </label>
            <label>
              Client name
              <input
                type="text"
                value={draft.clientName}
                onChange={(e) => setDraft({ ...draft, clientName: e.target.value })}
                placeholder="Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH"
              />
            </label>

            <h3 className="admin-subhead">Description</h3>
            <label>
              Summary *
              <textarea
                rows={3}
                required
                minLength={10}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
              <span className="field-hint">
                Short text used in listings and as the page's SEO description.
              </span>
            </label>
            <LinesEditor
              label="Full project description"
              value={draft.body}
              onChange={(body) => setDraft({ ...draft, body })}
              rows={9}
              hint="One paragraph per line. Falls back to the summary when empty."
            />
            <label>
              Project PDF
              <span className="admin-image-field">
                <input
                  type="text"
                  value={draft.pdf}
                  placeholder="Optional download shown on the project page"
                  onChange={(e) => setDraft({ ...draft, pdf: e.target.value })}
                />
                <button
                  type="button"
                  className="btn btn--light"
                  onClick={() => setPicker('pdf')}
                >
                  Choose / upload
                </button>
              </span>
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

      {picker && (
        <MediaPickerDialog
          kind={picker === 'pdf' ? 'document' : 'image'}
          onClose={() => setPicker(null)}
          onSelect={(m) =>
            setDraft((d) => ({ ...d, [picker]: m.url }) as Draft)
          }
        />
      )}
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
