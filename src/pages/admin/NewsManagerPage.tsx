import { useMemo, useState, type FormEvent } from 'react';
import { EmptyRow, FilterBar } from '../../components/admin/AdminUI';
import { Pagination } from '../../components/Pagination';
import {
  CMS_STATUS_OPTIONS,
  CmsStatusPill,
  FileField,
  ImageField,
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
import { api, type NewsItem } from '../../lib/api';

const PAGE_SIZE = 10;

type Draft = {
  title: string;
  date: string;
  author: string;
  image: string;
  excerpt: string;
  body: string[];
  attachment: string;
  attachment_label: string;
  contact_email: string;
};

const EMPTY: Draft = {
  title: '',
  date: '',
  author: '',
  image: '',
  excerpt: '',
  body: [],
  attachment: '',
  attachment_label: '',
  contact_email: '',
};

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

  const [actionError, setActionError] = useState('');
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [scheduleFor, setScheduleFor] = useState<NewsItem | null>(null);
  const [versionsFor, setVersionsFor] = useState<NewsItem | null>(null);

  const onChanged = (_: NewsItem, message: string) => {
    showToast(message);
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
      author: item.author ?? '',
      image: item.image ?? '',
      excerpt: item.excerpt ?? '',
      body: item.body ?? [],
      attachment: item.attachment ?? '',
      attachment_label: item.attachment_label ?? '',
      contact_email: item.contact_email ?? '',
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
      author: draft.author || null,
      image: draft.image || null,
      excerpt: draft.excerpt || null,
      body: draft.body.filter((p) => p.trim()),
      attachment: draft.attachment || null,
      attachment_label: draft.attachment_label || null,
      contact_email: draft.contact_email || null,
    };
    try {
      if (editing) {
        await api.news.update(editing.id, payload);
        showToast(`Saved “${draft.title}”.`);
      } else {
        await api.news.create(payload);
        showToast(`Created draft “${draft.title}”. Submit it for review when ready.`);
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
        <Modal
          title={editing ? 'Edit news article' : 'New news article'}
          subtitle={editing ? editing.title : 'Saved as a draft — nothing appears on the website until it is published.'}
          badge={editing && <CmsStatusPill status={editing.cms_status} />}
          onClose={closeForm}
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
            <FormSection title="Article">
              <Wide>
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
              </Wide>
              <label>
                Date *
                <input
                  type="date"
                  required
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
                <span className="field-hint">Shown as e.g. “24. July 2026”.</span>
              </label>
              <label>
                Author
                <input
                  type="text"
                  value={draft.author}
                  onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                  placeholder="Holger Thoma"
                />
                <span className="field-hint">By-line under the headline.</span>
              </label>
              <Wide>
                <label>
                  Lead paragraph
                  <textarea
                    rows={2}
                    value={draft.excerpt}
                    onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                  />
                  <span className="field-hint">
                    Opens the article, and is used on listings and in search results.
                  </span>
                </label>
              </Wide>
            </FormSection>

            <FormSection title="Image">
              <Wide>
                <ImageField
                  label="Article image"
                  value={draft.image}
                  onChange={(image) => setDraft({ ...draft, image })}
                  hint="Shown on the news listing and at the top of the article."
                />
              </Wide>
            </FormSection>

            <FormSection
              title="Body"
              hint="Write **bold**, *italic* and [link text](https://example.com) — they are rendered on the article page."
            >
              <Wide>
                <LinesEditor
                  label="Article text"
                  value={draft.body}
                  onChange={(body) => setDraft({ ...draft, body })}
                  rows={12}
                  hint="One paragraph per line."
                />
              </Wide>
            </FormSection>

            <FormSection
              title="Attachment and contact"
              hint="Newsletters and reports offered at the end of the article."
            >
              <Wide>
                <FileField
                  label="Downloadable document"
                  value={draft.attachment}
                  onChange={(attachment) => setDraft({ ...draft, attachment })}
                  hint="Appears as a download button under the article."
                />
              </Wide>
              <label>
                Download link wording
                <input
                  type="text"
                  value={draft.attachment_label}
                  onChange={(e) => setDraft({ ...draft, attachment_label: e.target.value })}
                  placeholder="Download the latest newsletter here"
                />
              </label>
              <label>
                Contact email
                <input
                  type="email"
                  value={draft.contact_email}
                  onChange={(e) => setDraft({ ...draft, contact_email: e.target.value })}
                  placeholder="ipa2022@icon-institute.de"
                />
                <span className="field-hint">
                  Shown as a contact address at the end of the article.
                </span>
              </label>
            </FormSection>
          </fieldset>
        </Modal>
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
