import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { EmptyRow, FilterBar } from '../../components/admin/AdminUI';
import { Pagination } from '../../components/Pagination';
import {
  CMS_STATUS_OPTIONS,
  CmsStatusPill,
  FileField,
  ImageField,
  MediaPickerDialog,
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
import { api, assetUrl, type MediaItem, type NewsItem, type NewsMediaRef } from '../../lib/api';

const PAGE_SIZE = 10;

type DraftMedia = NewsMediaRef & {
  url?: string | null;
};

type Draft = {
  title: string;
  date: string;
  author: string;
  image: string;
  excerpt: string;
  body: string[];
  body_html: string;
  media: DraftMedia[];
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
  body_html: '',
  media: [],
  attachment: '',
  attachment_label: '',
  contact_email: '',
};

function legacyBodyToHtml(body: string[]): string {
  const paragraphs = body.filter((p) => p.trim());
  if (!paragraphs.length) return '';
  return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('');
}

function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class: 'cms-rich-editor__content',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || '<p></p>';
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt('Enter a link URL', 'https://');
    if (!url) return;
    const sanitized = /^https?:\/\//i.test(url) || /^mailto:/i.test(url) || url.startsWith('/')
      ? url
      : `https://${url}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: sanitized }).run();
  };

  return (
    <div className="cms-rich-editor">
      <div className="cms-rich-editor__toolbar">
        <button type="button" className="row-action" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" className="row-action" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button type="button" className="row-action" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          Underline
        </button>
        <button type="button" className="row-action" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" className="row-action" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Bullets
        </button>
        <button type="button" className="row-action" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Numbers
        </button>
        <button type="button" className="row-action" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Quote
        </button>
        <button type="button" className="row-action" onClick={setLink}>
          Link
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function normalizeDraftMedia(media: DraftMedia[]): DraftMedia[] {
  return media
    .filter((entry) => entry && entry.media_id)
    .map((entry, index) => ({
      ...entry,
      type: entry.type,
      order: index + 1,
      alt: entry.alt ?? null,
      label: entry.label ?? null,
      url: entry.url ?? null,
    }));
}

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
  const [mediaKind, setMediaKind] = useState<'image' | 'video' | 'document' | null>(null);
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
      body_html: item.body_html || legacyBodyToHtml(item.body ?? []),
      media: normalizeDraftMedia(
        (item.media ?? []).map((media) => ({
          ...media,
          alt: media.alt ?? null,
          label: media.label ?? null,
          url: media.url ?? null,
        }))
      ),
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
    setMediaKind(null);
  };

  const updateMedia = (next: DraftMedia[]) => {
    setDraft((current) => ({
      ...current,
      media: normalizeDraftMedia(next),
    }));
  };

  const addMedia = (item: MediaItem) => {
    setDraft((current) => ({
      ...current,
      media: normalizeDraftMedia([
        ...current.media,
        {
          media_id: item.id,
          type: item.type,
          order: current.media.length + 1,
          alt: item.alt || null,
          label: null,
          url: item.url,
        },
      ]),
    }));
    setMediaKind(null);
  };

  const moveMedia = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const next = [...current.media];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, media: normalizeDraftMedia(next) };
    });
  };

  const removeMedia = (index: number) => {
    setDraft((current) => ({
      ...current,
      media: normalizeDraftMedia(current.media.filter((_, currentIndex) => currentIndex !== index)),
    }));
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
      body_html: draft.body_html && draft.body_html.trim() ? draft.body_html : null,
      media: draft.media.map((entry, index) => ({
        media_id: entry.media_id,
        type: entry.type,
        order: index + 1,
        alt: entry.alt || null,
        label: entry.label || null,
      })),
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
              title="Media"
              hint="Add ordered media items for this article while keeping the legacy image and attachment fields working."
            >
              <Wide>
                <div className="cms-media-field">
                  <span className="cms-media-field__label">Article media</span>
                  <div className="cms-media-field__actions">
                    <button type="button" className="btn btn--light" onClick={() => setMediaKind('image')}>
                      Add image
                    </button>
                    <button type="button" className="btn btn--light" onClick={() => setMediaKind('video')}>
                      Add video
                    </button>
                    <button type="button" className="btn btn--light" onClick={() => setMediaKind('document')}>
                      Add document
                    </button>
                  </div>

                  {draft.media.length === 0 ? (
                    <span className="field-hint">
                      No media selected yet. Existing image/attachment fields continue to work for older articles.
                    </span>
                  ) : (
                    <div className="cms-form-grid" style={{ marginTop: '0.75rem' }}>
                      {draft.media.map((media, index) => (
                        <div key={`${media.media_id}-${index}`} className="admin-json-item" style={{ width: '100%' }}>
                          <div className="admin-json-item__header" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>
                              {media.type === 'image'
                                ? 'Image'
                                : media.type === 'video'
                                  ? 'Video'
                                  : 'Document'}
                              {' '}
                              #{index + 1}
                            </span>
                            <div className="cms-media-field__actions">
                              <button type="button" className="row-action" disabled={index === 0} onClick={() => moveMedia(index, -1)}>
                                ↑
                              </button>
                              <button type="button" className="row-action" disabled={index === draft.media.length - 1} onClick={() => moveMedia(index, 1)}>
                                ↓
                              </button>
                              <button type="button" className="row-action row-action--danger" onClick={() => removeMedia(index)}>
                                Remove
                              </button>
                            </div>
                          </div>

                          {media.type === 'image' && media.url && (
                            <img src={assetUrl(media.url)} alt={media.alt || ''} style={{ maxWidth: '100%', maxHeight: '180px', display: 'block', margin: '0.5rem 0' }} loading="lazy" />
                          )}
                          {media.type === 'video' && media.url && (
                            <video src={assetUrl(media.url)} controls preload="metadata" style={{ maxWidth: '100%', maxHeight: '180px', display: 'block', margin: '0.5rem 0' }} />
                          )}
                          {media.type === 'document' && media.url && (
                            <a href={assetUrl(media.url)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', margin: '0.5rem 0' }}>
                              Open document
                            </a>
                          )}

                          <label>
                            Label
                            <input
                              type="text"
                              value={media.label ?? ''}
                              onChange={(e) => {
                                const next = [...draft.media];
                                next[index] = { ...next[index], label: e.target.value || null };
                                updateMedia(next);
                              }}
                              placeholder="Optional label"
                            />
                          </label>

                          <label>
                            Alt text
                            <input
                              type="text"
                              value={media.alt ?? ''}
                              onChange={(e) => {
                                const next = [...draft.media];
                                next[index] = { ...next[index], alt: e.target.value || null };
                                updateMedia(next);
                              }}
                              placeholder="Optional accessibility text"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Wide>
            </FormSection>

            {mediaKind && (
              <MediaPickerDialog
                kind={mediaKind}
                onClose={() => setMediaKind(null)}
                onSelect={(selected) => addMedia(selected)}
              />
            )}

            <FormSection
              title="Body"
              hint="Use the rich-text editor for styled paragraphs, lists, blockquotes and links. Legacy body text remains supported for older articles."
            >
              <Wide>
                <RichTextEditor
                  value={draft.body_html || legacyBodyToHtml(draft.body)}
                  onChange={(bodyHtml) => setDraft({ ...draft, body_html: bodyHtml })}
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
