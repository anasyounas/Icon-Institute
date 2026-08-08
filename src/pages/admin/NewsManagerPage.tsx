import { useMemo, useState, type FormEvent } from 'react';
import { EmptyRow, FilterBar } from '../../components/admin/AdminUI';
import { Pagination } from '../../components/Pagination';
import {
  CMS_STATUS_OPTIONS,
  CmsStatusPill,
  LinesEditor,
  MediaPickerDialog,
  ScheduleDialog,
  VersionsDialog,
  WorkflowActions,
  errorText,
  formatWhen,
  useApiList,
} from '../../components/admin/cms';
import { confirmToast, showToast } from '../../components/admin/Toast';
import { useAuth } from '../../hooks/useAuth';
import { api, assetUrl, type NewsItem } from '../../lib/api';

const PAGE_SIZE = 10;

type Draft = {
  title: string;
  date: string;
  image: string;
  excerpt: string;
  body: string[];
};

const EMPTY: Draft = { title: '', date: '', image: '', excerpt: '', body: [] };

export function NewsManagerPage() {
  const { can } = useAuth();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({ search: q || undefined, cms_status: status || undefined }),
    [q, status]
  );
  const { rows, total, totalPages, loading, error, reload } = useApiList<NewsItem>(
    (p) => api.news.list(p),
    params,
    page,
    PAGE_SIZE
  );

  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<NewsItem | null>(null);
  const [versionsFor, setVersionsFor] = useState<NewsItem | null>(null);

  const onChanged = (_: NewsItem, message: string) => {
    setNotice(message);
    setActionError('');
    reload();
  };

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setDraft({ ...EMPTY, date: new Date().toISOString().slice(0, 10) });
    setFormError('');
  };

  const openEdit = (item: NewsItem) => {
    setEditing(item);
    setCreating(false);
    setDraft({
      title: item.title,
      date: item.date,
      image: item.image ?? '',
      excerpt: item.excerpt ?? '',
      body: item.body ?? [],
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
      title: draft.title,
      date: draft.date,
      image: draft.image || null,
      excerpt: draft.excerpt || null,
      body: draft.body.filter((p) => p.trim()),
    };
    try {
      if (editing) {
        await api.news.update(editing.id, payload);
        setNotice(`Saved “${draft.title}”.`);
      } else {
        await api.news.create(payload);
        setNotice(`Created draft “${draft.title}”. Submit it for review when ready.`);
      }
      closeForm();
      reload();
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: NewsItem) => {
    if (!(await confirmToast(`Delete “${item.title}” and its version history?`))) return;
    try {
      await api.news.remove(item.id);
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
      <h1>News Manager</h1>
      <p className="admin-banner">
        Add, edit and remove news articles — title, date, body and image, the
        same fields the live news pages render. Publishing puts an article on
        the website immediately.
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
          id: 'news-q',
          label: 'Search news',
          value: q,
          placeholder: 'Title, excerpt or body…',
          onChange: (v) => {
            setQ(v);
            setPage(1);
          },
        }}
        selects={[
          {
            id: 'news-status',
            label: 'Status',
            value: status,
            onChange: (v) => {
              setStatus(v);
              setPage(1);
            },
            allLabel: 'All statuses',
            options: CMS_STATUS_OPTIONS,
          },
        ]}
        resultCount={rows.length}
        totalCount={total}
        onReset={() => {
          setQ('');
          setStatus('');
          setPage(1);
        }}
        action={
          can('content:write') ? (
            <button type="button" className="btn btn--primary" onClick={openCreate}>
              Add news article
            </button>
          ) : undefined
        }
      />

      {(creating || editing) && (
        <form className="admin-form-card is-editing" onSubmit={submit}>
          <header className="admin-form-card__head">
            <h2>{editing ? `Edit: ${editing.title}` : 'New news article'}</h2>
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
              Date *
              <input
                type="date"
                required
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
              <span className="field-hint">
                Shown on the site as e.g. “24. July 2026”, derived automatically.
              </span>
            </label>
            <label>
              Image
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
                  onClick={() => setPickerOpen(true)}
                >
                  Choose / upload
                </button>
              </span>
            </label>
            <label>
              Excerpt
              <textarea
                rows={2}
                value={draft.excerpt}
                onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
              />
              <span className="field-hint">
                Short teaser used on the article page and in search results.
              </span>
            </label>
            <LinesEditor
              label="Article body"
              value={draft.body}
              onChange={(body) => setDraft({ ...draft, body })}
              rows={8}
              hint="One paragraph per line."
            />
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
              <th scope="col">Date</th>
              <th scope="col">Title</th>
              <th scope="col">Status</th>
              <th scope="col">Version</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={5}>Loading news…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={5}>No news articles match the current filters.</EmptyRow>
            ) : (
              rows.map((item) => (
                <tr key={item.id}>
                  <td className="admin-table__num">{item.dateLabel || item.date}</td>
                  <td>
                    {item.title}
                    {item.schedule_publish_at && (
                      <span className="field-hint">
                        {' '}
                        · publishes {formatWhen(item.schedule_publish_at)}
                      </span>
                    )}
                  </td>
                  <td>
                    <CmsStatusPill status={item.cms_status} />
                  </td>
                  <td className="admin-table__num">v{item.version}</td>
                  <td>
                    <div className="row-actions">
                      {can('content:write') && (
                        <button type="button" className="row-action" onClick={() => openEdit(item)}>
                          Edit
                        </button>
                      )}
                      <WorkflowActions
                        item={item}
                        module={api.news}
                        onChanged={onChanged}
                        onError={setActionError}
                      />
                      {can('schedule:manage') && (
                        <button
                          type="button"
                          className="row-action"
                          onClick={() => setScheduleFor(item)}
                        >
                          Schedule
                        </button>
                      )}
                      <button
                        type="button"
                        className="row-action"
                        onClick={() => setVersionsFor(item)}
                      >
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
        label="articles"
        variant="admin"
      />

      {pickerOpen && (
        <MediaPickerDialog
          onClose={() => setPickerOpen(false)}
          onSelect={(m) => setDraft((d) => ({ ...d, image: m.url }))}
        />
      )}
      {scheduleFor && (
        <ScheduleDialog
          item={scheduleFor}
          module={api.news}
          onClose={() => setScheduleFor(null)}
          onSaved={onChanged}
        />
      )}
      {versionsFor && (
        <VersionsDialog
          item={versionsFor}
          title={versionsFor.title}
          module={api.news}
          onClose={() => setVersionsFor(null)}
          onRestored={onChanged}
        />
      )}
    </div>
  );
}
