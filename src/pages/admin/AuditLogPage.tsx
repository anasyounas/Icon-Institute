import { useCallback, useEffect, useState } from 'react';
import { EmptyRow, FilterBar } from '../../components/admin/AdminUI';
import { Pagination } from '../../components/Pagination';
import { ApiError, api, type AuditEntry } from '../../lib/api';

const PAGE_SIZE = 25;

/** `auth.login.success` reads better as `Auth · login · success`. */
function labelAction(action: string): string {
  return action
    .split('.')
    .map((part) => part.replace(/_/g, ' '))
    .join(' · ')
    .replace(/^./, (c) => c.toUpperCase());
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.valueOf()) ? iso : date.toLocaleString();
}

export function AuditLogPage() {
  const [q, setQ] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.audit.list({
        search: q || undefined,
        action: action || undefined,
        page,
        page_size: PAGE_SIZE,
      });
      setRows(result.items);
      setTotal(result.total);
      setTotalPages(result.total_pages);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not load the audit log.'
      );
      setRows([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [q, action, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [q, action]);

  useEffect(() => {
    api.audit
      .actions()
      .then(setActions)
      .catch(() => setActions([]));
  }, []);

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="admin-page">
      <h1>Audit log</h1>
      <p className="admin-banner">
        Every sign-in, permission change and content action is recorded here.
        Entries are append-only — the CMS never edits or deletes them.
      </p>

      {error && (
        <p className="admin-login__error" role="alert">
          {error}
        </p>
      )}

      <FilterBar
        search={{
          id: 'audit-q',
          label: 'Search audit log',
          value: q,
          placeholder: 'User, action or description…',
          onChange: setQ,
        }}
        selects={[
          {
            id: 'audit-action',
            label: 'Action',
            value: action,
            onChange: setAction,
            allLabel: 'All actions',
            options: actions.map((a) => ({ value: a, label: labelAction(a) })),
          },
        ]}
        resultCount={rows.length}
        totalCount={total}
        onReset={() => {
          setQ('');
          setAction('');
        }}
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">User</th>
              <th scope="col">Action</th>
              <th scope="col">Detail</th>
              <th scope="col">Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={5}>Loading audit entries…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={5}>No log entries match the current filters.</EmptyRow>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="admin-table__num">{formatWhen(row.created_at)}</td>
                  <td>{row.actor_email ?? '—'}</td>
                  <td>
                    <code>{row.action}</code>
                  </td>
                  <td>{row.description}</td>
                  <td className="admin-table__num">{row.ip ?? '—'}</td>
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
        label="entries"
        variant="admin"
      />
    </div>
  );
}
