import { useEffect, useState, type FormEvent } from 'react';
import { EmptyRow, FilterBar } from '../../components/admin/AdminUI';
import { errorText, formatWhen } from '../../components/admin/cms';
import { useAuth } from '../../hooks/useAuth';
import { api, type SeoEntry } from '../../lib/api';

type Draft = {
  title: string;
  description: string;
  path: string;
  image: string;
  noindex: boolean;
};

export function SeoManagerPage() {
  const { can } = useAuth();
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<SeoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<SeoEntry | null>(null);
  const [draft, setDraft] = useState<Draft>({
    title: '',
    description: '',
    path: '/',
    image: '',
    noindex: false,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.seo
      .list(q || undefined)
      .then((r) => {
        if (!cancelled) setRows(r);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorText(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, reloadTick]);

  const openEdit = (entry: SeoEntry) => {
    setEditing(entry);
    setDraft({
      title: entry.title,
      description: entry.description,
      path: entry.path,
      image: entry.image ?? '',
      noindex: entry.noindex ?? false,
    });
    setFormError('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError('');
    try {
      await api.seo.update(editing.key, {
        title: draft.title,
        description: draft.description,
        path: draft.path,
        image: draft.image || null,
        noindex: draft.noindex,
      });
      setNotice(`SEO metadata for ${draft.path} updated — live on the site immediately.`);
      setEditing(null);
      setReloadTick((t) => t + 1);
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <h1>SEO Metadata</h1>
      <p className="admin-banner">
        Meta title, description, Open Graph image and indexing flag for every
        page. News articles additionally publish their own article metadata and
        Schema.org markup automatically.
      </p>

      {notice && (
        <p className="status-box" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="admin-login__error" role="alert">
          {error}
        </p>
      )}

      <FilterBar
        search={{
          id: 'seo-q',
          label: 'Search pages',
          value: q,
          placeholder: 'Path, title or description…',
          onChange: setQ,
        }}
        resultCount={rows.length}
        totalCount={rows.length}
        onReset={() => setQ('')}
      />

      {editing && (
        <form className="admin-form-card is-editing" onSubmit={submit}>
          <header className="admin-form-card__head">
            <h2>
              Edit SEO — <code>{editing.path}</code>
            </h2>
          </header>
          <fieldset className="admin-form" disabled={saving}>
            <label>
              Meta title *
              <input
                type="text"
                required
                minLength={3}
                maxLength={200}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
              <span className="field-hint">
                {draft.title.length} characters — search engines show roughly 60.
              </span>
            </label>
            <label>
              Meta description *
              <textarea
                rows={3}
                required
                minLength={10}
                maxLength={400}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
              <span className="field-hint">
                {draft.description.length} characters — aim for 150–160.
              </span>
            </label>
            <label>
              Canonical path *
              <input
                type="text"
                required
                pattern="/.*"
                value={draft.path}
                onChange={(e) => setDraft({ ...draft, path: e.target.value })}
              />
            </label>
            <label>
              Open Graph image
              <input
                type="text"
                value={draft.image}
                placeholder="/images/logo_icon.jpg"
                onChange={(e) => setDraft({ ...draft, image: e.target.value })}
              />
            </label>
            <label>
              Search engine indexing
              <select
                value={String(draft.noindex)}
                onChange={(e) => setDraft({ ...draft, noindex: e.target.value === 'true' })}
              >
                <option value="false">Index this page (normal)</option>
                <option value="true">noindex — hide from search engines</option>
              </select>
            </label>
          </fieldset>

          {formError && (
            <p className="admin-login__error" role="alert">
              {formError}
            </p>
          )}

          <div className="admin-savebar">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save SEO metadata'}
            </button>
            <button
              type="button"
              className="btn btn--light"
              onClick={() => setEditing(null)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Path</th>
              <th scope="col">Meta title</th>
              <th scope="col">Description</th>
              <th scope="col">Indexing</th>
              <th scope="col">Updated</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={6}>Loading SEO entries…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6}>No pages match the current search.</EmptyRow>
            ) : (
              rows.map((entry) => (
                <tr key={entry.key}>
                  <td>
                    <code>{entry.path}</code>
                  </td>
                  <td>{entry.title}</td>
                  <td className="admin-table__truncate">{entry.description}</td>
                  <td>{entry.noindex ? 'noindex' : 'indexed'}</td>
                  <td className="admin-table__num">{formatWhen(entry.updated_at)}</td>
                  <td>
                    <div className="row-actions">
                      {can('seo:write') && (
                        <button type="button" className="row-action" onClick={() => openEdit(entry)}>
                          Edit
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
    </div>
  );
}
