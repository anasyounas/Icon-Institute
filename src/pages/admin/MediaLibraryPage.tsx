import { useMemo, useRef, useState } from 'react';
import { EmptyRow, FilterBar } from '../../components/admin/AdminUI';
import { Pagination } from '../../components/Pagination';
import { errorText, formatWhen, useApiList } from '../../components/admin/cms';
import { FormSection, Modal, Wide } from '../../components/admin/Modal';
import { confirmToast, showToast } from '../../components/admin/Toast';
import { useAuth } from '../../hooks/useAuth';
import { api, assetUrl, type MediaItem } from '../../lib/api';

const PAGE_SIZE = 12;

function kb(size: number): string {
  return size >= 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} KB`;
}

export function MediaLibraryPage() {
  const { can } = useAuth();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({ search: q || undefined, type: type || undefined }),
    [q, type]
  );
  const { rows, total, totalPages, loading, error, reload } = useApiList<MediaItem>(
    (p) => api.media.list(p),
    params,
    page,
    PAGE_SIZE
  );

  const [actionError, setActionError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [altEditing, setAltEditing] = useState<MediaItem | null>(null);
  const [altValue, setAltValue] = useState('');
  const replaceTarget = useRef<MediaItem | null>(null);
  const replaceInput = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null, replaceId?: string) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setActionError('');
    try {
      for (const file of Array.from(files)) {
        const item = await api.media.upload(file, '', replaceId);
        const savedKb = Math.max(0, item.original_size - item.size);
        showToast(
          `Uploaded ${item.name}` +
            (savedKb > 1024 ? ` — optimised, saved ${kb(savedKb)}.` : '.')
        );
        if (replaceId) break; // replacing swaps exactly one file
      }
      reload();
    } catch (err) {
      setActionError(errorText(err));
    } finally {
      setUploading(false);
    }
  };

  const saveAlt = async () => {
    if (!altEditing) return;
    try {
      await api.media.updateAlt(altEditing.id, altValue);
      showToast(`Alt text updated for ${altEditing.name}.`);
      setAltEditing(null);
      reload();
    } catch (err) {
      setActionError(errorText(err));
    }
  };

  const remove = async (item: MediaItem) => {
    if (
      !(await confirmToast(
        `Delete ${item.name}? Pages still referencing it will show their fallback.`
      ))
    ) {
      return;
    }
    try {
      await api.media.remove(item.id);
      showToast(`${item.name} deleted.`);
      reload();
    } catch (err) {
      setActionError(errorText(err));
    }
  };

  const copyUrl = async (item: MediaItem) => {
    await navigator.clipboard?.writeText(assetUrl(item.url));
    showToast(`Link to ${item.name} copied.`);
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="admin-page">
      <h1>Media Library</h1>
      <p className="admin-banner">
        Images and documents for the whole website. Uploads are optimised
        automatically and stored in the CMS database, so every page that uses a
        file can always load it.
      </p>

      {(error || actionError) && (
        <p className="admin-login__error" role="alert">
          {error || actionError}
        </p>
      )}

      {can('media:write') && (
        <label className={`upload-box ${uploading ? 'is-busy' : ''}`}>
          <span className="upload-box__label">
            <span className="upload-box__icon" aria-hidden="true">
              ↑
            </span>
            <span>
              <strong>{uploading ? 'Uploading…' : 'Upload media'}</strong>
              <span className="upload-box__hint">
                Images (JPG, PNG, WebP, GIF) and documents (PDF, DOC, XLS, ZIP), up
                to 25 MB. Images are optimised automatically.
              </span>
            </span>
          </span>
          <input
            type="file"
            multiple
            className="upload-box__input"
            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.mp4,.webm"
            disabled={uploading}
            onChange={(e) => {
              void upload(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      )}

      {/* hidden input backing the per-row Replace action */}
      <input
        ref={replaceInput}
        type="file"
        hidden
        accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip"
        onChange={(e) => {
          const target = replaceTarget.current;
          if (target) void upload(e.target.files, target.id);
          e.target.value = '';
        }}
      />

      <FilterBar
        search={{
          id: 'media-q',
          label: 'Search media',
          value: q,
          placeholder: 'File name or alt text…',
          onChange: (v) => {
            setQ(v);
            setPage(1);
          },
        }}
        selects={[
          {
            id: 'media-type',
            label: 'Type',
            value: type,
            onChange: (v) => {
              setType(v);
              setPage(1);
            },
            allLabel: 'All types',
            options: [
              { value: 'image', label: 'Images' },
              { value: 'document', label: 'Documents' },
              { value: 'video', label: 'Videos' },
            ],
          },
        ]}
        resultCount={rows.length}
        totalCount={total}
        onReset={() => {
          setQ('');
          setType('');
          setPage(1);
        }}
      />

      {altEditing && (
        <Modal
          title="Alt text"
          subtitle={altEditing.name}
          onClose={() => setAltEditing(null)}
          onSubmit={(e) => {
            e.preventDefault();
            void saveAlt();
          }}
          footer={
            <div className="cms-modal__buttons">
              <button type="button" className="btn btn--light" onClick={() => setAltEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary">
                Save alt text
              </button>
            </div>
          }
        >
          <fieldset className="cms-fieldset">
            <FormSection
              title="Description"
              hint="Read aloud by screen readers and used by search engines."
            >
              {altEditing.type === 'image' && (
                <Wide>
                  <img
                    src={assetUrl(altEditing.url)}
                    alt=""
                    className="cms-alt-preview"
                  />
                </Wide>
              )}
              <Wide>
                <label>
                  Describe what the image shows
                  <input
                    type="text"
                    value={altValue}
                    autoFocus
                    onChange={(e) => setAltValue(e.target.value)}
                    placeholder="ICON-INSTITUTE team at a workshop in Albania"
                  />
                </label>
              </Wide>
            </FormSection>
          </fieldset>
        </Modal>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Preview</th>
              <th scope="col">File</th>
              <th scope="col">Type</th>
              <th scope="col">Size</th>
              <th scope="col">Alt text</th>
              <th scope="col">Uploaded</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={7}>Loading media…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={7}>No media matches the current filters.</EmptyRow>
            ) : (
              rows.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.type === 'image' ? (
                      <img
                        src={assetUrl(item.url)}
                        alt={item.alt || item.name}
                        className="admin-media-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <span className="admin-media-thumb admin-media-thumb--doc">
                        {item.extension.replace('.', '').toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td className="admin-table__num">
                    {kb(item.size)}
                    {item.original_size > item.size && (
                      <span className="field-hint"> (was {kb(item.original_size)})</span>
                    )}
                  </td>
                  <td>{item.alt || '—'}</td>
                  <td className="admin-table__num">{formatWhen(item.created_at)}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="row-action" onClick={() => void copyUrl(item)}>
                        Copy URL
                      </button>
                      {can('media:write') && (
                        <>
                          <button
                            type="button"
                            className="row-action"
                            onClick={() => {
                              setAltEditing(item);
                              setAltValue(item.alt);
                            }}
                          >
                            Alt
                          </button>
                          <button
                            type="button"
                            className="row-action"
                            onClick={() => {
                              replaceTarget.current = item;
                              replaceInput.current?.click();
                            }}
                          >
                            Replace
                          </button>
                        </>
                      )}
                      {can('media:delete') && (
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
        label="files"
        variant="admin"
      />
    </div>
  );
}
