import { useEffect, useMemo, useState } from 'react';
import { PanelCard } from '../../components/admin/AdminUI';
import { ImageField, errorText, formatWhen } from '../../components/admin/cms';
import { showToast } from '../../components/admin/Toast';
import { useAuth } from '../../hooks/useAuth';
import { api, type PageDetail, type PageInfo } from '../../lib/api';

/* ---------------------------------------------------------------- helpers */

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const IMAGE_KEY = /image|logo|background|img|photo|hero(?!es)/i;
const IMAGE_VALUE = /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i;

function isImageField(key: string, value: Json): boolean {
  if (typeof value !== 'string') return false;
  return IMAGE_KEY.test(key) || IMAGE_VALUE.test(value);
}

function labelize(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

function setAtPath(root: Json, path: (string | number)[], value: Json): Json {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const copy = [...root];
    copy[head as number] = setAtPath(copy[head as number], rest, value);
    return copy;
  }
  if (root && typeof root === 'object') {
    const copy = { ...(root as { [key: string]: Json }) };
    copy[head as string] = setAtPath(copy[head as string], rest, value);
    return copy;
  }
  return root;
}

/* ------------------------------------------------------------ field editor */

function Field({
  fieldKey,
  value,
  path,
  onEdit,
  depth,
}: {
  fieldKey: string;
  value: Json;
  path: (string | number)[];
  onEdit: (path: (string | number)[], value: Json) => void;
  depth: number;
}) {
  const label = labelize(String(fieldKey));

  if (isImageField(String(fieldKey), value)) {
    return (
      <div className="cms-field-wide">
        <ImageField
          label={label}
          value={value as string}
          onChange={(url) => onEdit(path, url)}
        />
      </div>
    );
  }

  if (typeof value === 'string') {
    // Long prose gets a textarea and the full width; short values pair up
    // two per row so a page does not become one endless column.
    const isLong = value.length > 90;
    const field = (
      <label>
        {label}
        {isLong ? (
          <textarea
            rows={Math.min(10, Math.max(3, Math.ceil(value.length / 80)))}
            value={value}
            onChange={(e) => onEdit(path, e.target.value)}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onEdit(path, e.target.value)}
          />
        )}
      </label>
    );
    return isLong ? <div className="cms-field-wide">{field}</div> : field;
  }

  if (typeof value === 'number') {
    return (
      <label>
        {label}
        <input
          type="number"
          value={value}
          onChange={(e) => onEdit(path, Number(e.target.value))}
        />
      </label>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <label>
        {label}
        <select
          value={String(value)}
          onChange={(e) => onEdit(path, e.target.value === 'true')}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
    );
  }

  if (Array.isArray(value)) {
    // Array of plain strings → one line per entry.
    if (value.every((v) => typeof v === 'string')) {
      return (
        <div className="cms-field-wide">
          <label>
            {label}
            <textarea
              rows={Math.min(12, Math.max(3, value.length + 1))}
              value={(value as string[]).join('\n')}
              onChange={(e) => onEdit(path, e.target.value.split('\n'))}
            />
            <span className="field-hint">One entry per line.</span>
          </label>
        </div>
      );
    }
    // Array of objects → repeatable cards.
    return (
      <div className="admin-json-group cms-field-wide">
        <p className="admin-json-group__label">{label}</p>
        {value.map((entry, index) => (
          // The first entry starts open so the shape of a list is visible
          // without clicking; the rest stay collapsed to keep the page short.
          <details key={index} className="admin-json-item" open={index === 0}>
            <summary>
              {typeof entry === 'object' && entry !== null && !Array.isArray(entry)
                ? String(
                    (entry as { [k: string]: Json }).title ??
                      (entry as { [k: string]: Json }).label ??
                      (entry as { [k: string]: Json }).name ??
                      (entry as { [k: string]: Json }).year ??
                      `${label} ${index + 1}`
                  )
                : `${label} ${index + 1}`}
              <button
                type="button"
                className="row-action row-action--danger admin-json-item__remove"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Remove this entry?')) {
                    onEdit(
                      path,
                      value.filter((_, i) => i !== index)
                    );
                  }
                }}
              >
                Remove
              </button>
            </summary>
            <Field
              fieldKey={String(index)}
              value={entry}
              path={[...path, index]}
              onEdit={onEdit}
              depth={depth + 1}
            />
          </details>
        ))}
        {value.length > 0 && (
          <button
            type="button"
            className="btn btn--light"
            onClick={() => {
              // New entries start as a copy of the last one — every key present.
              const template = JSON.parse(JSON.stringify(value[value.length - 1])) as Json;
              onEdit(path, [...value, template]);
            }}
          >
            Add another
          </button>
        )}
      </div>
    );
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    // An entry inside a repeatable list is keyed by its position; the card
    // around it already says which one it is, so no "0" heading.
    const isListEntry = /^\d+$/.test(String(fieldKey));
    const group = (
      <div
        className={
          depth === 0 || isListEntry ? 'admin-json-root' : 'admin-json-nested'
        }
      >
        {depth > 0 && !isListEntry && (
          <p className="admin-json-group__label">{label}</p>
        )}
        <div className="cms-form-grid">
          {entries.map(([childKey, childValue]) => (
            <Field
              key={childKey}
              fieldKey={childKey}
              value={childValue}
              path={[...path, childKey]}
              onEdit={onEdit}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
    // Nested groups own a full row so their inner two columns line up.
    return depth === 0 || isListEntry ? group : <div className="cms-field-wide">{group}</div>;
  }

  return null;
}

/* ------------------------------------------------------------------- page */

export function ContentMediaPage() {
  const { can } = useAuth();
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selected, setSelected] = useState('home');
  const [detail, setDetail] = useState<PageDetail | null>(null);
  const [data, setData] = useState<Json | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api.pages
      .list()
      .then(setPages)
      .catch((err: unknown) => setError(errorText(err)));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setNotice('');
    setDirty(false);
    api.pages
      .get(selected)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setData(d.draft as Json);
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
  }, [selected]);

  const onEdit = (path: (string | number)[], value: Json) => {
    setData((current) => (current === null ? current : setAtPath(current, path, value)));
    setDirty(true);
  };

  const run = async (label: string, action: () => Promise<PageDetail>) => {
    setBusy(true);
    setError('');
    try {
      const updated = await action();
      setDetail(updated);
      setData(updated.draft as Json);
      setDirty(false);
      setNotice(label);
      showToast(label);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const saveDraft = () =>
    run('Saved as draft. Visitors still see the published version until you publish.', () =>
      api.pages.saveDraft(selected, data as Record<string, unknown>)
    );

  const publish = () =>
    run('Published — the website now shows this content.', async () => {
      // Save first so what gets published is what is on screen.
      if (dirty) {
        await api.pages.saveDraft(selected, data as Record<string, unknown>);
      }
      return api.pages.publish(selected);
    });

  const discard = () =>
    run('Draft discarded — back to the live version.', () => api.pages.discard(selected));

  const hasUnpublished = dirty || (detail?.has_unpublished_changes ?? false);

  const pageOptions = useMemo(
    () => pages.map((p) => ({ value: p.page, label: p.label })),
    [pages]
  );

  return (
    <div className="admin-page">
      <h1>Content &amp; Media Editor</h1>
      <p className="admin-banner">
        Edit any page's text and images without touching code. Changes are saved
        as a draft first; the public site updates only when you publish.
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

      <PanelCard
        title="Page"
        action={
          detail && (
            <span className="field-hint">
              v{detail.version} · last edited {formatWhen(detail.updated_at)}
              {detail.updated_by ? ` by ${detail.updated_by}` : ''}
              {hasUnpublished ? ' · unpublished changes' : ' · in sync with the site'}
            </span>
          )
        }
      >
        <div className="admin-form">
          <label>
            Choose a page to edit
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {pageOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PanelCard>

      {loading ? (
        <p className="admin-table__empty">Loading page content…</p>
      ) : (
        data !== null && (
          <form
            className="admin-form-card is-editing"
            onSubmit={(e) => {
              e.preventDefault();
              void saveDraft();
            }}
          >
            <fieldset className="admin-form" disabled={busy || !can('content:write')}>
              <Field
                fieldKey={detail?.label ?? selected}
                value={data}
                path={[]}
                onEdit={onEdit}
                depth={0}
              />
            </fieldset>

            <div className="admin-savebar">
              {can('content:write') && (
                <button type="submit" className="btn btn--primary" disabled={busy || !dirty}>
                  {busy ? 'Working…' : 'Save draft'}
                </button>
              )}
              {can('publish:run') && (
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={busy || !hasUnpublished}
                  onClick={() => void publish()}
                  title={hasUnpublished ? undefined : 'Nothing to publish — the site already shows this'}
                >
                  Publish to website
                </button>
              )}
              {can('content:write') && (
                <button
                  type="button"
                  className="btn btn--light"
                  disabled={busy || !hasUnpublished}
                  onClick={() => {
                    if (window.confirm('Throw away all unpublished changes on this page?')) {
                      void discard();
                    }
                  }}
                >
                  Discard draft
                </button>
              )}
            </div>
          </form>
        )
      )}

    </div>
  );
}
