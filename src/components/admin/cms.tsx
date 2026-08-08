/**
 * Shared building blocks for the live CMS modules: list-loading hook,
 * workflow actions, schedule and version dialogs, media picker, and the
 * site's filter vocabularies.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ApiError,
  api,
  assetUrl,
  type CmsEnvelope,
  type CmsStatus,
  type MediaItem,
  type Page as ApiPage,
  type VersionEntry,
} from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { StatusPill } from './AdminUI';

/* --------------------------------------------------------------- helpers */

export function errorText(err: unknown): string {
  if (err instanceof ApiError) {
    const lines = err.detailLines;
    return lines.length ? `${err.message} ${lines.join(' ')}` : err.message;
  }
  return 'Something went wrong. Please try again.';
}

export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.valueOf()) ? String(iso) : date.toLocaleString();
}

export const STATUS_LABEL: Record<CmsStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
};

export const REGION_LABELS: Record<string, string> = {
  africa: 'Africa',
  asia: 'Asia',
  'central-america-caribbean': 'Central America Caribbean',
  europe: 'Europe',
  'middle-east': 'Middle East',
  'south-america': 'South America',
};

export const EXPERTISE_LABELS: Record<string, string> = {
  'economic-employment-promotion': 'Economic and Employment Promotion',
  'governance-education-social-development':
    'Governance, Education and Social Development',
  'agriculture-rural-development': 'Agriculture and Rural Development',
  'statistics-evaluation-social-research':
    'Statistics, Evaluation and Social Research',
  'sustainability-management': 'Sustainability Management',
};

export const VOLUME_LABELS: Record<string, string> = {
  'lt-100k': '< 100k',
  '100k-300k': '100k - 300k',
  '300k-500k': '300k - 500k',
  '500k-1m': '500k - 1m',
  '1m-3m': '1m - 3m',
  '3m-5m': '3m - 5m',
  'gt-5m': '> 5m',
};

export const CMS_STATUS_OPTIONS = (
  Object.entries(STATUS_LABEL) as [CmsStatus, string][]
).map(([value, label]) => ({ value, label }));

export function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

/* ------------------------------------------------------------ list hook */

type ListState<T> = {
  rows: T[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string;
};

/**
 * Server-backed list with search/filters/pagination. `params` is compared by
 * JSON identity so callers can pass a fresh object each render.
 */
export function useApiList<T>(
  fetcher: (params: Record<string, unknown>) => Promise<ApiPage<T>>,
  params: Record<string, unknown>,
  page: number,
  pageSize: number
) {
  const [state, setState] = useState<ListState<T>>({
    rows: [],
    total: 0,
    totalPages: 0,
    loading: true,
    error: '',
  });
  const paramsKey = JSON.stringify(params);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));

    fetcherRef
      .current({ ...JSON.parse(paramsKey), page, page_size: pageSize })
      .then((result) => {
        if (cancelled) return;
        setState({
          rows: result.items,
          total: result.total,
          totalPages: result.total_pages,
          loading: false,
          error: '',
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ rows: [], total: 0, totalPages: 0, loading: false, error: errorText(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [paramsKey, page, pageSize, tick]);

  return { ...state, reload };
}

/* ------------------------------------------------------ workflow actions */

type ContentApi<T extends CmsEnvelope> = {
  submit: (id: string, note?: string) => Promise<T>;
  approve: (id: string, note?: string) => Promise<T>;
  requestChanges: (id: string, note: string) => Promise<T>;
  publishItem: (id: string) => Promise<T>;
  archive: (id: string) => Promise<T>;
};

/**
 * The row-level workflow buttons, filtered by both the item's current status
 * and the signed-in user's permissions.
 */
export function WorkflowActions<T extends CmsEnvelope>({
  item,
  module,
  onChanged,
  onError,
}: {
  item: CmsEnvelope;
  module: ContentApi<T>;
  onChanged: (updated: T, message: string) => void;
  onError: (message: string) => void;
}) {
  const { can } = useAuth();
  const [busy, setBusy] = useState(false);

  const run = async (
    label: string,
    action: () => Promise<T>,
    message: string
  ) => {
    setBusy(true);
    try {
      onChanged(await action(), message);
    } catch (err) {
      onError(`${label} failed. ${errorText(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const status = item.cms_status;
  const buttons: ReactNode[] = [];

  if (status === 'draft' && can('workflow:submit')) {
    buttons.push(
      <button
        key="submit"
        type="button"
        className="row-action"
        disabled={busy}
        onClick={() => void run('Submit', () => module.submit(item.id), 'Submitted for review.')}
      >
        Submit
      </button>
    );
  }
  if (status === 'in_review' && can('workflow:approve')) {
    buttons.push(
      <button
        key="approve"
        type="button"
        className="row-action"
        disabled={busy}
        onClick={() => void run('Approve', () => module.approve(item.id), 'Approved.')}
      >
        Approve
      </button>,
      <button
        key="changes"
        type="button"
        className="row-action"
        disabled={busy}
        onClick={() => {
          const note = window.prompt('What should the editor change?');
          if (note) {
            void run(
              'Request changes',
              () => module.requestChanges(item.id, note),
              'Sent back to draft with your note.'
            );
          }
        }}
      >
        Request changes
      </button>
    );
  }
  if (
    (status === 'approved' || status === 'draft' || status === 'in_review' || status === 'archived') &&
    can('publish:run')
  ) {
    buttons.push(
      <button
        key="publish"
        type="button"
        className="row-action"
        disabled={busy}
        onClick={() =>
          void run('Publish', () => module.publishItem(item.id), 'Published — now live on the website.')
        }
      >
        Publish
      </button>
    );
  }
  if (status === 'published' && can('publish:run')) {
    buttons.push(
      <button
        key="archive"
        type="button"
        className="row-action"
        disabled={busy}
        onClick={() =>
          void run('Archive', () => module.archive(item.id), 'Archived — removed from the website.')
        }
      >
        Archive
      </button>
    );
  }

  return <>{buttons}</>;
}

/* -------------------------------------------------------- schedule dialog */

export function ScheduleDialog<T extends CmsEnvelope>({
  item,
  module,
  onClose,
  onSaved,
}: {
  item: CmsEnvelope;
  module: { schedule: (id: string, publishAt: string | null, archiveAt: string | null) => Promise<T> };
  onClose: () => void;
  onSaved: (updated: T, message: string) => void;
}) {
  const toLocal = (iso: string | null) => (iso ? iso.slice(0, 16) : '');
  const [publishAt, setPublishAt] = useState(toLocal(item.schedule_publish_at));
  const [archiveAt, setArchiveAt] = useState(toLocal(item.schedule_archive_at));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const updated = await module.schedule(
        item.id,
        publishAt ? new Date(publishAt).toISOString() : null,
        archiveAt ? new Date(archiveAt).toISOString() : null
      );
      onSaved(
        updated,
        publishAt || archiveAt ? 'Schedule saved.' : 'Schedule cleared.'
      );
      onClose();
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Schedule">
      <div className="admin-modal__card">
        <h2>Schedule</h2>
        <p className="admin-panel-card__sub">
          The scheduler checks once a minute, locally on this server.
        </p>
        <fieldset className="admin-form" disabled={busy}>
          <label>
            Publish at
            <input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
            />
          </label>
          <label>
            Archive at
            <input
              type="datetime-local"
              value={archiveAt}
              onChange={(e) => setArchiveAt(e.target.value)}
            />
          </label>
        </fieldset>
        {error && (
          <p className="admin-login__error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-savebar">
          <button type="button" className="btn btn--primary" onClick={() => void submit()} disabled={busy}>
            Save schedule
          </button>
          <button
            type="button"
            className="btn btn--light"
            disabled={busy}
            onClick={() => {
              setPublishAt('');
              setArchiveAt('');
            }}
          >
            Clear fields
          </button>
          <button type="button" className="btn btn--light" onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- versions dialog */

export function VersionsDialog<T extends CmsEnvelope>({
  item,
  title,
  module,
  onClose,
  onRestored,
}: {
  item: CmsEnvelope;
  title: string;
  module: {
    versions: (id: string) => Promise<VersionEntry[]>;
    restoreVersion: (id: string, version: number) => Promise<T>;
  };
  onClose: () => void;
  onRestored: (updated: T, message: string) => void;
}) {
  const { can } = useAuth();
  const [rows, setRows] = useState<VersionEntry[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    module
      .versions(item.id)
      .then((r) => {
        if (!cancelled) setRows(r);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const restore = async (version: number) => {
    setBusy(true);
    setError('');
    try {
      const updated = await module.restoreVersion(item.id, version);
      onRestored(updated, `Restored version ${version}.`);
      onClose();
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Version history">
      <div className="admin-modal__card admin-modal__card--wide">
        <h2>Version history</h2>
        <p className="admin-panel-card__sub">{title}</p>
        {error && (
          <p className="admin-login__error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Version</th>
                <th scope="col">Saved</th>
                <th scope="col">By</th>
                <th scope="col">Note</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr>
                  <td colSpan={5} className="admin-table__empty">
                    Loading versions…
                  </td>
                </tr>
              ) : (
                rows.map((v) => (
                  <tr key={v.version}>
                    <td className="admin-table__num">v{v.version}</td>
                    <td className="admin-table__num">{formatWhen(v.created_at)}</td>
                    <td>{v.author ?? '—'}</td>
                    <td>{v.note ?? '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="row-action"
                        disabled={busy || v.version === item.version || !can('version:restore')}
                        title={
                          v.version === item.version
                            ? 'This is the current version'
                            : !can('version:restore')
                              ? 'Your role cannot restore versions'
                              : undefined
                        }
                        onClick={() => void restore(v.version)}
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="admin-savebar">
          <button type="button" className="btn btn--light" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- media picker */

export function MediaPickerDialog({
  onSelect,
  onClose,
  kind = 'image',
}: {
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
  kind?: 'image' | 'document';
}) {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.media
      .list({ search: search || undefined, type: kind, page_size: 60 })
      .then((r) => setRows(r.items))
      .catch((err: unknown) => setError(errorText(err)))
      .finally(() => setLoading(false));
  }, [search, kind]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const item = await api.media.upload(file, file.name.replace(/\.\w+$/, ''));
      onSelect(item);
      onClose();
    } catch (err) {
      setError(errorText(err));
      setUploading(false);
    }
  };

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Choose media">
      <div className="admin-modal__card admin-modal__card--wide">
        <h2>{kind === 'image' ? 'Choose an image' : 'Choose a document'}</h2>

        <div className="admin-media-picker__bar">
          <input
            type="search"
            placeholder="Search the media library…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label className="btn btn--primary admin-media-picker__upload">
            {uploading ? 'Uploading…' : 'Upload new'}
            <input
              type="file"
              hidden
              accept={kind === 'image' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx,.zip'}
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
        </div>

        {error && (
          <p className="admin-login__error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="admin-table__empty">Loading media…</p>
        ) : rows.length === 0 ? (
          <p className="admin-table__empty">No files match. Upload one above.</p>
        ) : (
          <ul className="admin-media-grid">
            {rows.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="admin-media-tile"
                  onClick={() => {
                    onSelect(m);
                    onClose();
                  }}
                  title={m.alt || m.name}
                >
                  {m.type === 'image' ? (
                    <img src={assetUrl(m.url)} alt={m.alt || m.name} loading="lazy" />
                  ) : (
                    <span className="admin-media-tile__doc">{m.extension}</span>
                  )}
                  <span className="admin-media-tile__name">{m.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="admin-savebar">
          <button type="button" className="btn btn--light" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- list of strings */

/** Edits a list of paragraphs / bullet lines as one textarea, one per line. */
export function LinesEditor({
  label,
  value,
  onChange,
  hint,
  rows = 4,
  required = false,
}: {
  label: string;
  value: string[];
  onChange: (lines: string[]) => void;
  hint?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <textarea
        rows={rows}
        required={required}
        value={value.join('\n')}
        onChange={(e) => onChange(e.target.value.split('\n'))}
      />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

/** Status pill with the human label for a CMS status. */
export function CmsStatusPill({ status }: { status: CmsStatus }) {
  return <StatusPill value={STATUS_LABEL[status] ?? status} />;
}
