/**
 * Workflow & system screens, all backed by the live API:
 * Draft & Preview · Approval Workflow · Version History · Scheduled
 * Publishing · Publish & Rollback · Backups.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyRow, FilterBar, PanelCard, StatusPill } from '../../components/admin/AdminUI';
import {
  CmsStatusPill,
  errorText,
  formatWhen,
} from '../../components/admin/cms';
import { confirmToast, showToast } from '../../components/admin/Toast';
import { useAuth } from '../../hooks/useAuth';
import {
  api,
  assetUrl,
  authorizedDownload,
  type BackupRecord,
  type CmsEnvelope,
  type JobItem,
  type NewsItem,
  type ProjectItem,
  type ScheduledRow,
  type SiteBuild,
  type SiteVersionRow,
} from '../../lib/api';

type EntityType = 'news' | 'jobs' | 'projects';

const TYPE_LABEL: Record<string, string> = {
  news: 'News',
  jobs: 'Job',
  projects: 'Project',
  page: 'Page',
  seo: 'SEO',
};

const modules = {
  news: api.news,
  jobs: api.jobs,
  projects: api.projects,
} as const;

/* ------------------------------------------------------- Draft & preview */

export function DraftPreviewPage() {
  const [type, setType] = useState<EntityType>('news');
  const [items, setItems] = useState<CmsEnvelope[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    modules[type]
      .list({ page_size: 100 })
      .then((result) => {
        if (cancelled) return;
        const drafts = result.items.filter((i) => i.cms_status !== 'published');
        setItems(drafts.length ? drafts : result.items);
        setSelectedId((current) =>
          current && result.items.some((i) => i.id === current)
            ? current
            : (drafts[0] ?? result.items[0])?.id ?? ''
        );
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
  }, [type]);

  const selected = items.find((i) => i.id === selectedId);

  return (
    <div className="admin-page">
      <h1>Draft mode &amp; preview</h1>
      <p className="admin-banner">
        See how an unpublished item will look before it goes live. Only
        published content ever reaches the public website.
      </p>

      {error && (
        <p className="admin-login__error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-form" style={{ maxWidth: '48rem' }}>
        <label>
          Content type
          <select value={type} onChange={(e) => setType(e.target.value as EntityType)}>
            <option value="news">News articles</option>
            <option value="jobs">Job ads</option>
            <option value="projects">Projects</option>
          </select>
        </label>
        <label>
          Item {loading && '(loading…)'}
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {(i as { title?: string }).title ?? i.slug} — {i.cms_status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selected && (
        <div className="admin-preview-frame">
          <p className="admin-badge">
            Preview · <CmsStatusPill status={selected.cms_status} /> · v{selected.version}
            {selected.updated_by ? ` · last edited by ${selected.updated_by}` : ''}
          </p>
          {type === 'news' && <NewsPreview item={selected as NewsItem} />}
          {type === 'jobs' && <JobPreview item={selected as JobItem} />}
          {type === 'projects' && <ProjectPreview item={selected as ProjectItem} />}
        </div>
      )}
    </div>
  );
}

function NewsPreview({ item }: { item: NewsItem }) {
  const image = item.image
    ? assetUrl(item.image.startsWith('/') || item.image.startsWith('http') ? item.image : `/images/${item.image}`)
    : '';
  return (
    <article>
      <h3>{item.title}</h3>
      <time dateTime={item.date}>{item.dateLabel || item.date}</time>
      {image && (
        <img
          src={image}
          alt=""
          style={{ maxWidth: '20rem', display: 'block', margin: '0.75rem 0' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      {item.excerpt && (
        <p>
          <em>{item.excerpt}</em>
        </p>
      )}
      {(item.body ?? []).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </article>
  );
}

function JobPreview({ item }: { item: JobItem }) {
  return (
    <article>
      <h3>{item.title}</h3>
      <p>
        {item.type} · {item.location}
      </p>
      <p>
        Expertise: {item.expertise} · Apply by {item.deadline}
      </p>
      <p>
        <em>{item.summary}</em>
      </p>
      {(item.description ?? []).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      <h4>Requirements</h4>
      <ul>
        {(item.requirements ?? []).map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </article>
  );
}

function ProjectPreview({ item }: { item: ProjectItem }) {
  return (
    <article>
      <h3>{item.title}</h3>
      <p>
        {item.country} · {item.yearStart}–{item.yearEnd}
      </p>
      <p>{item.description}</p>
    </article>
  );
}

/* ----------------------------------------------------- Approval workflow */

type QueueItem = CmsEnvelope & { title?: string; entity_type: EntityType };

export function WorkflowPage() {
  const { can } = useAuth();
  const [stage, setStage] = useState('in_review');
  const [rows, setRows] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all(
      (Object.keys(modules) as EntityType[]).map((t) =>
        modules[t]
          .list({ cms_status: stage || undefined, page_size: 100 })
          .then((result) =>
            result.items.map((i) => ({ ...i, entity_type: t }) as QueueItem)
          )
      )
    )
      .then((lists) => {
        if (cancelled) return;
        setRows(
          lists
            .flat()
            .sort(
              (a, b) =>
                new Date(b.updated_at ?? 0).valueOf() - new Date(a.updated_at ?? 0).valueOf()
            )
        );
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
  }, [stage, tick]);

  const act = async (row: QueueItem, action: 'approve' | 'publish' | 'changes') => {
    const module = modules[row.entity_type];
    try {
      if (action === 'approve') {
        await module.approve(row.id);
        setNotice(`Approved “${row.title ?? row.slug}”.`);
      } else if (action === 'publish') {
        await module.publishItem(row.id);
        setNotice(`Published “${row.title ?? row.slug}”.`);
      } else {
        const note = window.prompt('What should the editor change?');
        if (!note) return;
        await module.requestChanges(row.id, note);
        setNotice(`Sent “${row.title ?? row.slug}” back to draft.`);
      }
      setTick((t) => t + 1);
    } catch (err) {
      setError(errorText(err));
    }
  };

  return (
    <div className="admin-page">
      <h1>Approval workflow</h1>
      <p className="admin-banner">
        Editors submit drafts; Publishers and Administrators approve and
        publish. Every decision lands in the audit log.
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
        selects={[
          {
            id: 'wf-stage',
            label: 'Stage',
            value: stage,
            onChange: setStage,
            allLabel: 'All stages',
            options: [
              { value: 'draft', label: 'Draft' },
              { value: 'in_review', label: 'In review' },
              { value: 'approved', label: 'Approved' },
            ],
          },
        ]}
        resultCount={rows.length}
        totalCount={rows.length}
        onReset={() => setStage('in_review')}
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Type</th>
              <th scope="col">Stage</th>
              <th scope="col">Last edited</th>
              <th scope="col">By</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={6}>Loading workflow queue…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6}>
                Nothing waiting in this stage — all clear.
              </EmptyRow>
            ) : (
              rows.map((row) => (
                <tr key={`${row.entity_type}-${row.id}`}>
                  <td>
                    {row.title ?? row.slug}
                    {row.review_note && (
                      <span className="field-hint"> · note: {row.review_note}</span>
                    )}
                  </td>
                  <td>{TYPE_LABEL[row.entity_type]}</td>
                  <td>
                    <CmsStatusPill status={row.cms_status} />
                  </td>
                  <td className="admin-table__num">{formatWhen(row.updated_at)}</td>
                  <td>{row.updated_by ?? '—'}</td>
                  <td>
                    <div className="row-actions">
                      {row.cms_status === 'in_review' && can('workflow:approve') && (
                        <>
                          <button type="button" className="row-action" onClick={() => void act(row, 'approve')}>
                            Approve
                          </button>
                          <button type="button" className="row-action" onClick={() => void act(row, 'changes')}>
                            Request changes
                          </button>
                        </>
                      )}
                      {(row.cms_status === 'approved' || row.cms_status === 'in_review') &&
                        can('publish:run') && (
                          <button type="button" className="row-action" onClick={() => void act(row, 'publish')}>
                            Publish
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

/* ------------------------------------------------------- Version history */

export function VersionHistoryPage() {
  const [entityType, setEntityType] = useState('');
  const [rows, setRows] = useState<SiteVersionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.versions
      .recent(entityType || undefined)
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
  }, [entityType]);

  return (
    <div className="admin-page">
      <h1>Version history</h1>
      <p className="admin-banner">
        Every save of every item is kept as a numbered version. Restore any
        version from the item's “Versions” button in its manager — restoring
        never silently changes what is live.
      </p>

      {error && (
        <p className="admin-login__error" role="alert">
          {error}
        </p>
      )}

      <FilterBar
        selects={[
          {
            id: 'ver-type',
            label: 'Content type',
            value: entityType,
            onChange: setEntityType,
            allLabel: 'All content',
            options: [
              { value: 'news', label: 'News' },
              { value: 'jobs', label: 'Jobs' },
              { value: 'projects', label: 'Projects' },
              { value: 'page', label: 'Pages' },
              { value: 'seo', label: 'SEO' },
            ],
          },
        ]}
        resultCount={rows.length}
        totalCount={rows.length}
        onReset={() => setEntityType('')}
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Saved</th>
              <th scope="col">Item</th>
              <th scope="col">Type</th>
              <th scope="col">Version</th>
              <th scope="col">Author</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={6}>Loading version history…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6}>No versions recorded yet.</EmptyRow>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="admin-table__num">{formatWhen(row.created_at)}</td>
                  <td>{row.title || row.entity_id}</td>
                  <td>{TYPE_LABEL[row.entity_type] ?? row.entity_type}</td>
                  <td className="admin-table__num">v{row.version}</td>
                  <td>{row.author ?? '—'}</td>
                  <td>{row.note ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --------------------------------------------------- Scheduled publishing */

export function ScheduledPage() {
  const { can } = useAuth();
  const [rows, setRows] = useState<ScheduledRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.schedule
      .list()
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
  }, [tick]);

  const cancelSchedule = async (row: ScheduledRow) => {
    try {
      await modules[row.entity_type as EntityType].schedule(row.id, null, null);
      setNotice(`Schedule cleared for “${row.title}”.`);
      setTick((t) => t + 1);
    } catch (err) {
      setError(errorText(err));
    }
  };

  const runNow = async () => {
    try {
      const result = await api.schedule.runNow();
      setNotice(result.message);
      setTick((t) => t + 1);
    } catch (err) {
      setError(errorText(err));
    }
  };

  return (
    <div className="admin-page">
      <h1>Scheduled publishing &amp; archive</h1>
      <p className="admin-banner">
        Items go live or move to the archive automatically at the times set on
        them. The scheduler runs once a minute on this server — no external
        service involved.
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

      {can('publish:run') && (
        <div className="admin-savebar">
          <button type="button" className="btn btn--light" onClick={() => void runNow()}>
            Run scheduler now
          </button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Type</th>
              <th scope="col">Status</th>
              <th scope="col">Publishes</th>
              <th scope="col">Archives</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={6}>Loading schedule…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6}>
                Nothing is scheduled. Use the “Schedule” action on any news
                article, job ad or project.
              </EmptyRow>
            ) : (
              rows.map((row) => (
                <tr key={`${row.entity_type}-${row.id}`}>
                  <td>{row.title}</td>
                  <td>{TYPE_LABEL[row.entity_type]}</td>
                  <td>
                    <CmsStatusPill status={row.cms_status} />
                  </td>
                  <td className="admin-table__num">{formatWhen(row.schedule_publish_at)}</td>
                  <td className="admin-table__num">{formatWhen(row.schedule_archive_at)}</td>
                  <td>
                    <div className="row-actions">
                      {can('schedule:manage') && (
                        <button
                          type="button"
                          className="row-action row-action--danger"
                          onClick={() => void cancelSchedule(row)}
                        >
                          Cancel schedule
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

/* --------------------------------------------------- Publish & rollback */

export function PublishPage() {
  const { can } = useAuth();
  const [builds, setBuilds] = useState<SiteBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.publish
      .builds()
      .then((r) => {
        if (!cancelled) setBuilds(r);
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
  }, [tick]);

  const run = async (label: string, action: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await action();
      setNotice(label);
      setTick((t) => t + 1);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const live = builds.find((b) => b.status === 'published');

  return (
    <div className="admin-page">
      <h1>Publish &amp; rollback</h1>
      <p className="admin-banner">
        CMS → Generate Static Website → Preview → Publish → Rollback. Every
        step runs locally on ICON-INSTITUTE's server — no external transfer.
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
        title="Pipeline"
        subtitle={
          live
            ? `Live build: #${live.number} (${formatWhen(live.published_at)})`
            : 'No build has been published yet.'
        }
      >
        <ol className="admin-pipeline">
          <li className="is-done">CMS content ready</li>
          <li className={builds.length > 0 ? 'is-done' : ''}>Generate static website</li>
          <li className={builds.length > 0 ? 'is-done' : ''}>Preview</li>
          <li className={live ? 'is-done' : ''}>Publish</li>
          <li className={builds.length > 1 ? 'is-done' : ''}>Rollback available</li>
        </ol>
        {can('publish:run') && (
          <div className="admin-savebar">
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={() =>
                void run('Static site build generated — review it, then publish.', () =>
                  api.publish.generate()
                )
              }
            >
              {busy ? 'Working…' : 'Generate static website'}
            </button>
            <a
              className="btn btn--light"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview the website
            </a>
          </div>
        )}
      </PanelCard>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Build</th>
              <th scope="col">Created</th>
              <th scope="col">Author</th>
              <th scope="col">Content</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={6}>Loading builds…</EmptyRow>
            ) : builds.length === 0 ? (
              <EmptyRow colSpan={6}>
                No builds yet — generate the first one above.
              </EmptyRow>
            ) : (
              builds.map((build) => (
                <tr key={build.id}>
                  <td>
                    #{build.number} — {build.label}
                  </td>
                  <td className="admin-table__num">{formatWhen(build.created_at)}</td>
                  <td>{build.author}</td>
                  <td className="admin-table__num">
                    {build.counts.news ?? 0} news · {build.counts.jobs ?? 0} jobs ·{' '}
                    {build.counts.projects ?? 0} projects
                  </td>
                  <td>
                    <StatusPill value={build.status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      {build.status === 'preview' && can('publish:run') && (
                        <button
                          type="button"
                          className="row-action"
                          disabled={busy}
                          onClick={() =>
                            void run(`Build #${build.number} is now live.`, () =>
                              api.publish.publishBuild(build.id)
                            )
                          }
                        >
                          Publish
                        </button>
                      )}
                      {build.status !== 'published' && can('publish:rollback') && (
                        <button
                          type="button"
                          className="row-action"
                          disabled={busy}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Roll the whole site back to build #${build.number}? ` +
                                  'All content changes made since then are replaced by the snapshot.'
                              )
                            ) {
                              void run(`Rolled back to build #${build.number}.`, () =>
                                api.publish.rollback(build.id)
                              );
                            }
                          }}
                        >
                          Restore
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

/* --------------------------------------------------------------- Backups */

export function BackupsPage() {
  const { can } = useAuth();
  const [rows, setRows] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.backups
      .list()
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
  }, [tick]);

  const runBackup = async () => {
    setBusy(true);
    setError('');
    try {
      const record = await api.backups.run();
      setNotice(`Backup ${record.filename} created (${Math.round(record.size / 1024)} KB).`);
      reload();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const restore = async (record: BackupRecord) => {
    if (
      !window.confirm(
        `Restore ${record.filename}? All CMS content is replaced by the backup. ` +
          'User accounts are NOT touched.'
      )
    ) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.backups.restore(record.id, false);
      setNotice(`Restored ${record.filename}.`);
      reload();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (record: BackupRecord) => {
    if (!(await confirmToast(`Delete backup ${record.filename}?`))) return;
    try {
      await api.backups.remove(record.id);
      setNotice(`Deleted ${record.filename}.`);
      showToast(`Deleted ${record.filename}.`);
      reload();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const totalCount = useMemo(() => rows.length, [rows]);

  return (
    <div className="admin-page">
      <h1>Backup &amp; recovery</h1>
      <p className="admin-banner">
        Full dumps of CMS content, user accounts, configuration and the media
        index, stored on this server. A daily backup runs automatically; you
        can also run one before any risky change.
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

      <PanelCard title="Policy">
        <ul className="admin-checklist">
          <li>Automatic backup: daily, from the CMS's own scheduler</li>
          <li>Scope: content, media index, versions, builds, users, sessions</li>
          <li>Restore: content only by default — accounts are opt-in via the API</li>
          <li>Restoration testing: use “Restore” on a fresh manual backup</li>
        </ul>
        {can('backup:manage') && (
          <div className="admin-savebar">
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={() => void runBackup()}
            >
              {busy ? 'Working…' : 'Run backup now'}
            </button>
          </div>
        )}
      </PanelCard>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Backup</th>
              <th scope="col">Created</th>
              <th scope="col">Size</th>
              <th scope="col">Contents</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={5}>Loading backups…</EmptyRow>
            ) : totalCount === 0 ? (
              <EmptyRow colSpan={5}>
                No backups yet — run the first one above.
              </EmptyRow>
            ) : (
              rows.map((record) => (
                <tr key={record.id}>
                  <td>
                    {record.label}
                    <br />
                    <code className="field-hint">{record.filename}</code>
                  </td>
                  <td className="admin-table__num">{formatWhen(record.created_at)}</td>
                  <td className="admin-table__num">{Math.round(record.size / 1024)} KB</td>
                  <td className="admin-table__num">
                    {record.counts.news ?? 0} news · {record.counts.jobs ?? 0} jobs ·{' '}
                    {record.counts.projects ?? 0} projects · {record.media_count} media
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="row-action"
                        onClick={() =>
                          void authorizedDownload(
                            api.backups.downloadUrl(record.id),
                            record.filename
                          ).catch((err: unknown) => setError(errorText(err)))
                        }
                      >
                        Download
                      </button>
                      {can('backup:manage') && (
                        <>
                          <button
                            type="button"
                            className="row-action"
                            disabled={busy}
                            onClick={() => void restore(record)}
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            className="row-action row-action--danger"
                            onClick={() => void remove(record)}
                          >
                            Delete
                          </button>
                        </>
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
