import { useEffect, useState, type FormEvent } from 'react';
import { EmptyRow, FilterBar } from '../../components/admin/AdminUI';
import { ImageField, errorText, formatWhen } from '../../components/admin/cms';
import { FormSection, Modal, Wide } from '../../components/admin/Modal';
import { showToast } from '../../components/admin/Toast';
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
      showToast(`SEO metadata for ${draft.path} updated — live on the site immediately.`);
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
        <Modal
          title="Edit SEO metadata"
          subtitle={editing.path}
          onClose={() => setEditing(null)}
          onSubmit={submit}
          busy={saving}
          footer={
            <>
              {formError && (
                <p className="cms-modal__error" role="alert">
                  {formError}
                </p>
              )}
              <div className="cms-modal__buttons">
                <button
                  type="button"
                  className="btn btn--light"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save SEO metadata'}
                </button>
              </div>
            </>
          }
        >
          <fieldset className="cms-fieldset" disabled={saving}>
            <FormSection
              title="Search result"
              hint="How this page appears in Google and when shared."
            >
              <Wide>
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
              </Wide>
              <Wide>
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
              </Wide>
            </FormSection>

            <FormSection title="Address and indexing">
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
                Search engine indexing
                <select
                  value={String(draft.noindex)}
                  onChange={(e) => setDraft({ ...draft, noindex: e.target.value === 'true' })}
                >
                  <option value="false">Index this page (normal)</option>
                  <option value="true">noindex — hide from search engines</option>
                </select>
              </label>
              <Wide>
                <ImageField
                  label="Sharing image (Open Graph)"
                  value={draft.image}
                  onChange={(image) => setDraft({ ...draft, image })}
                  hint="Shown when the page is shared on social media."
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
