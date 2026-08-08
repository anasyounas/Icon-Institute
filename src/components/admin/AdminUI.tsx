import type { ReactNode } from 'react';
import { useEditLock } from '../../hooks/useEditLock';

/* ------------------------------------------------------------- section card */

export function PanelCard({
  title,
  action,
  children,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-panel-card">
      <header className="admin-panel-card__head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="admin-panel-card__sub">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/* -------------------------------------------------------------- lockable form */

/**
 * Wraps a form so its fields start read-only. `children` receives the disabled
 * flag; spread it onto every input so the whole block locks together.
 */
export function LockableForm({
  children,
  saveLabel = 'Save changes',
  title,
  subtitle,
}: {
  children: (disabled: boolean) => ReactNode;
  saveLabel?: string;
  title?: string;
  subtitle?: string;
}) {
  const lock = useEditLock();

  return (
    <form
      className={`admin-form-card ${lock.isEditing ? 'is-editing' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        lock.save();
      }}
    >
      <header className="admin-form-card__head">
        <div>
          {title && <h2>{title}</h2>}
          {subtitle && <p className="admin-panel-card__sub">{subtitle}</p>}
        </div>
        <span className={`admin-lock-badge admin-lock-badge--${lock.state}`}>
          {lock.state === 'editing' ? 'Editing' : lock.state === 'saved' ? 'Saved' : 'Read only'}
        </span>
      </header>

      <fieldset className="admin-form" disabled={lock.disabled}>
        {children(lock.disabled)}
      </fieldset>

      <div className="admin-savebar">
        {lock.state === 'editing' ? (
          <>
            <button type="submit" className="btn btn--primary">
              {saveLabel}
            </button>
            <button type="button" className="btn btn--light" onClick={lock.cancel}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--light" onClick={lock.edit}>
            Edit
          </button>
        )}

        {lock.state === 'saved' && (
          <span className="status-inline" role="status">
            Saved — fields locked again (demo only, nothing written to disk).
          </span>
        )}
      </div>
    </form>
  );
}

/* ----------------------------------------------------------------- filters */

export type SelectFilter = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
};

/**
 * One filter row above the table: search on the left, dimension selects after
 * it, result count and reset on the right.
 */
export function FilterBar({
  search,
  selects = [],
  resultCount,
  totalCount,
  onReset,
  action,
}: {
  search?: {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
  };
  selects?: SelectFilter[];
  resultCount: number;
  totalCount: number;
  onReset: () => void;
  action?: ReactNode;
}) {
  const dirty =
    (search ? search.value !== '' : false) || selects.some((s) => s.value !== '');

  return (
    <div className="admin-filters">
      <div className="admin-filters__controls">
        {search && (
          <label className="admin-filters__field admin-filters__field--search" htmlFor={search.id}>
            <span>{search.label}</span>
            <input
              id={search.id}
              type="search"
              value={search.value}
              placeholder={search.placeholder}
              autoComplete="off"
              onChange={(e) => search.onChange(e.target.value)}
            />
          </label>
        )}

        {selects.map((s) => (
          <label key={s.id} className="admin-filters__field" htmlFor={s.id}>
            <span>{s.label}</span>
            <select
              id={s.id}
              value={s.value}
              onChange={(e) => s.onChange(e.target.value)}
            >
              <option value="">{s.allLabel}</option>
              {s.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="admin-filters__meta">
        <p aria-live="polite">
          Showing <strong>{resultCount}</strong> of {totalCount}
        </p>
        <button
          type="button"
          className="btn btn--light"
          onClick={onReset}
          disabled={!dirty}
        >
          Clear filters
        </button>
        {action}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- row actions */

/** Edit / Delete (and optionally Replace) for a table row. */
export function RowActions({
  onEdit,
  onDelete,
  onUpload,
  uploadLabel = 'Replace',
  disableDelete = false,
  deleteTitle,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onUpload?: () => void;
  uploadLabel?: string;
  disableDelete?: boolean;
  deleteTitle?: string;
}) {
  return (
    <div className="row-actions">
      <button type="button" className="row-action" onClick={onEdit}>
        Edit
      </button>
      {onUpload && (
        <button type="button" className="row-action" onClick={onUpload}>
          {uploadLabel}
        </button>
      )}
      <button
        type="button"
        className="row-action row-action--danger"
        onClick={onDelete}
        disabled={disableDelete}
        title={deleteTitle}
      >
        Delete
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ status */

export function StatusPill({ value }: { value: string }) {
  const key = value.toLowerCase().replace(/[^a-z]+/g, '-');
  return <span className={`status-pill status-pill--${key}`}>{value}</span>;
}

/* -------------------------------------------------------------- empty state */

export function EmptyRow({ colSpan, children }: { colSpan: number; children: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="admin-table__empty">
        {children}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ upload */

/** Dashed drop zone used by the media and content modules. */
export function UploadBox({
  label,
  hint,
  accept,
  id,
}: {
  label: string;
  hint: string;
  accept?: string;
  id: string;
}) {
  return (
    <div className="upload-box">
      <label htmlFor={id} className="upload-box__label">
        <span className="upload-box__icon" aria-hidden="true">
          ↑
        </span>
        <span>
          <strong>{label}</strong>
          <span className="upload-box__hint">{hint}</span>
        </span>
      </label>
      <input id={id} type="file" accept={accept} className="upload-box__input" />
    </div>
  );
}
