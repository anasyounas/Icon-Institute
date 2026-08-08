import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  EmptyRow,
  FilterBar,
  PanelCard,
  StatusPill,
} from '../../components/admin/AdminUI';
import { Pagination } from '../../components/Pagination';
import { useAuth } from '../../hooks/useAuth';
import { ApiError, api, type CmsUser, type Role } from '../../lib/api';

const ROLES: Role[] = ['Administrator', 'Publisher', 'Editor', 'Viewer'];
const PAGE_SIZE = 10;

/** Explains what each role may do, straight from the backend permission matrix. */
const ROLE_SUMMARY: Record<Role, string> = {
  Administrator: 'Full access, including users, security, backups and the audit log.',
  Publisher: 'Edits and deletes content, approves drafts, publishes and rolls back.',
  Editor: 'Creates and edits content, uploads media, submits drafts for approval.',
  Viewer: 'Read-only access to content, media and SEO metadata.',
};

type Draft = {
  name: string;
  email: string;
  role: Role;
  password: string;
  is_active: boolean;
};

const EMPTY_DRAFT: Draft = {
  name: '',
  email: '',
  role: 'Editor',
  password: '',
  is_active: true,
};

function errorText(err: unknown): string {
  if (err instanceof ApiError) {
    const lines = err.detailLines;
    return lines.length ? `${err.message} ${lines.join(' ')}` : err.message;
  }
  return 'Something went wrong. Please try again.';
}

export function UsersRolesPage() {
  const { user: signedInUser, refreshUser } = useAuth();

  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [twoFa, setTwoFa] = useState('');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<CmsUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [editing, setEditing] = useState<CmsUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [resetTarget, setResetTarget] = useState<CmsUser | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.users.list({
        search: q || undefined,
        role: role || undefined,
        two_factor: twoFa === '' ? undefined : twoFa === 'true',
        page,
        page_size: PAGE_SIZE,
      });
      setRows(result.items);
      setTotal(result.total);
      setTotalPages(result.total_pages);
    } catch (err) {
      setError(errorText(err));
      setRows([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [q, role, twoFa, page]);

  useEffect(() => {
    void load();
  }, [load]);

  // Filter changes always return to the first page of results.
  useEffect(() => {
    setPage(1);
  }, [q, role, twoFa]);

  const reset = () => {
    setQ('');
    setRole('');
    setTwoFa('');
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setDraft(EMPTY_DRAFT);
    setFormError('');
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
    setDraft(EMPTY_DRAFT);
    setFormError('');
  };

  const startEdit = (target: CmsUser) => {
    setCreating(false);
    setEditing(target);
    setDraft({
      name: target.name,
      email: target.email,
      role: target.role,
      password: '',
      is_active: target.is_active,
    });
    setFormError('');
  };

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await api.users.update(editing.id, {
          name: draft.name,
          email: draft.email,
          role: draft.role,
          is_active: draft.is_active,
        });
        setNotice(`Updated ${draft.email}.`);
        if (editing.id === signedInUser?.id) await refreshUser();
      } else {
        await api.users.create({
          name: draft.name,
          email: draft.email,
          password: draft.password,
          role: draft.role,
          is_active: draft.is_active,
          must_change_password: true,
        });
        setNotice(`Created ${draft.email}. They must set a new password at first sign-in.`);
      }
      closeForm();
      await load();
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const act = async (label: string, action: () => Promise<{ message: string }>) => {
    setError('');
    try {
      const result = await action();
      setNotice(result.message);
      await load();
    } catch (err) {
      setError(`${label} failed. ${errorText(err)}`);
    }
  };

  const remove = (target: CmsUser) => {
    if (
      !window.confirm(
        `Delete ${target.email}? Their sessions end immediately. This cannot be undone.`
      )
    ) {
      return;
    }
    void act('Delete', () => api.users.remove(target.id));
  };

  const submitReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setSaving(true);
    setFormError('');
    try {
      const result = await api.users.resetPassword(resetTarget.id, resetPassword);
      setNotice(result.message);
      setResetTarget(null);
      setResetPassword('');
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="admin-page">
      <h1>Users &amp; roles</h1>
      <p className="admin-banner">
        User management with role-based permissions. Passwords are stored as
        Argon2id hashes and every change here is written to the audit log.
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
          id: 'users-q',
          label: 'Search users',
          value: q,
          placeholder: 'Name or email…',
          onChange: setQ,
        }}
        selects={[
          {
            id: 'users-role',
            label: 'Role',
            value: role,
            onChange: setRole,
            allLabel: 'All roles',
            options: ROLES.map((r) => ({ value: r, label: r })),
          },
          {
            id: 'users-2fa',
            label: '2FA',
            value: twoFa,
            onChange: setTwoFa,
            allLabel: 'Any',
            options: [
              { value: 'true', label: 'Enabled' },
              { value: 'false', label: 'Off' },
            ],
          },
        ]}
        resultCount={rows.length}
        totalCount={total}
        onReset={reset}
        action={
          <button type="button" className="btn btn--primary" onClick={startCreate}>
            Add user
          </button>
        }
      />

      {(creating || editing) && (
        <form className="admin-form-card is-editing" onSubmit={submitForm}>
          <header className="admin-form-card__head">
            <h2>{editing ? `Edit ${editing.email}` : 'New user'}</h2>
          </header>

          <fieldset className="admin-form" disabled={saving}>
            <label>
              Full name
              <input
                type="text"
                required
                minLength={2}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                required
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </label>
            <label>
              Role
              <select
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <span className="field-hint">{ROLE_SUMMARY[draft.role]}</span>
            </label>
            {!editing && (
              <label>
                Initial password
                <input
                  type="text"
                  required
                  autoComplete="new-password"
                  value={draft.password}
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                />
                <span className="field-hint">
                  At least 12 characters with upper case, lower case and a digit.
                  The user must replace it at first sign-in.
                </span>
              </label>
            )}
            <label>
              Status
              <select
                value={String(draft.is_active)}
                onChange={(e) =>
                  setDraft({ ...draft, is_active: e.target.value === 'true' })
                }
              >
                <option value="true">Active</option>
                <option value="false">Deactivated</option>
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
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create user'}
            </button>
            <button
              type="button"
              className="btn btn--light"
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {resetTarget && (
        <form className="admin-form-card is-editing" onSubmit={submitReset}>
          <header className="admin-form-card__head">
            <h2>Reset password for {resetTarget.email}</h2>
          </header>
          <fieldset className="admin-form" disabled={saving}>
            <label>
              New password
              <input
                type="text"
                required
                autoComplete="new-password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
              />
              <span className="field-hint">
                Share it over a separate channel. All of their sessions end
                immediately and they must choose their own password at next sign-in.
              </span>
            </label>
          </fieldset>
          {formError && (
            <p className="admin-login__error" role="alert">
              {formError}
            </p>
          )}
          <div className="admin-savebar">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Update password'}
            </button>
            <button
              type="button"
              className="btn btn--light"
              onClick={() => {
                setResetTarget(null);
                setResetPassword('');
                setFormError('');
              }}
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
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">2FA</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={6}>Loading users…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6}>No users match the current filters.</EmptyRow>
            ) : (
              rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.name}
                    {u.id === signedInUser?.id && (
                      <span className="field-hint"> — you</span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <StatusPill value={u.two_factor_enabled ? 'Enabled' : 'Off'} />
                  </td>
                  <td>
                    <StatusPill value={u.is_active ? 'Active' : 'Deactivated'} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="row-action"
                        onClick={() => startEdit(u)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="row-action"
                        onClick={() => {
                          setResetTarget(u);
                          setResetPassword('');
                          setFormError('');
                        }}
                      >
                        Password
                      </button>
                      <button
                        type="button"
                        className="row-action"
                        disabled={!u.two_factor_enabled}
                        title={
                          u.two_factor_enabled
                            ? 'Clear their authenticator enrolment'
                            : '2FA is not enabled for this user'
                        }
                        onClick={() =>
                          void act('2FA reset', () => api.users.resetTwoFactor(u.id))
                        }
                      >
                        Reset 2FA
                      </button>
                      <button
                        type="button"
                        className="row-action"
                        onClick={() => void act('Unlock', () => api.users.unlock(u.id))}
                        title="Lift a brute-force lockout early"
                      >
                        Unlock
                      </button>
                      <button
                        type="button"
                        className="row-action row-action--danger"
                        onClick={() => remove(u)}
                        disabled={u.id === signedInUser?.id}
                        title={
                          u.id === signedInUser?.id
                            ? 'You cannot delete your own account'
                            : undefined
                        }
                      >
                        Delete
                      </button>
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
        label="users"
        variant="admin"
      />

      <PanelCard title="What each role can do">
        <ul className="admin-checklist">
          {ROLES.map((r) => (
            <li key={r}>
              <strong>{r}</strong> — {ROLE_SUMMARY[r]}
            </li>
          ))}
        </ul>
      </PanelCard>
    </div>
  );
}
