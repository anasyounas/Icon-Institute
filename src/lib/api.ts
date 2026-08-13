/**
 * Client for the local CMS API.
 *
 * Access tokens are held in memory only; the refresh token is the sole value
 * that survives a reload, and it rotates on every use — replaying an old one
 * makes the server revoke the whole session family.
 */

const API_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://127.0.0.1:8000/api/v1';

/** Origin of the backend, for assets it serves directly (e.g. /media/...). */
export const API_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, '');

/** Absolute URL for a backend-served asset; passes through full URLs. */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (/^(https?:|data:)/.test(path)) return path;
  if (path.startsWith('/media/')) return `${API_ORIGIN}${path}`;
  if (path.startsWith('/')) return path;
  // Bare filenames are site-bundled assets under /images/
  return `/images/${path}`;
}

const REFRESH_STORAGE_KEY = 'icon-cms.refresh-token';

/* --------------------------------------------------------------- types */

export type Role = 'Administrator' | 'Publisher' | 'Editor' | 'Viewer';

export type CmsUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  two_factor_enabled: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  permissions: string[];
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
};

export type LoginSuccess = {
  mfa_required: false;
  tokens: TokenPair;
  user: CmsUser;
};

export type LoginMfaChallenge = {
  mfa_required: true;
  mfa_token: string;
  expires_in: number;
};

export type LoginResult = LoginSuccess | LoginMfaChallenge;

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type AuditEntry = {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  description: string;
  entity_type: string | null;
  entity_id: string | null;
  ip: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
};

export type TwoFactorSetup = {
  secret: string;
  otpauth_uri: string;
  qr_code_data_uri: string;
};

export type SessionInfo = {
  id: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string;
  ip: string | null;
  user_agent: string | null;
};

/* ------------------------------------------------------- content types */

export type CmsStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export type CmsEnvelope = {
  id: string;
  slug: string;
  cms_status: CmsStatus;
  version: number;
  review_note: string | null;
  schedule_publish_at: string | null;
  schedule_archive_at: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
  submitted_by: string | null;
  approved_by: string | null;
  published_at: string | null;
};

export type NewsItem = CmsEnvelope & {
  title: string;
  date: string;
  dateLabel: string;
  author: string | null;
  image: string | null;
  excerpt: string | null;
  body: string[];
  attachment: string | null;
  attachment_label: string | null;
  contact_email: string | null;
};

export type JobItem = CmsEnvelope & {
  title: string;
  location: string;
  type: 'Permanent' | 'Short-term expert' | 'Freelance';
  expertise: string;
  published: string;
  deadline: string;
  status: 'open' | 'closed';
  summary: string;
  description: string[];
  requirements: string[];
  application_email: string | null;
};

export type ProjectItem = CmsEnvelope & {
  title: string;
  subtitle: string | null;
  /** Joined display string, derived from `countries` by the backend. */
  country: string;
  countries: string[];
  region: string;
  yearStart: number;
  yearEnd: number;
  periodStart: string | null;
  periodEnd: string | null;
  /** Pre-formatted period, e.g. `01/12/2025 - 31/01/2028`. */
  periodLabel: string;
  expertise: string;
  volume: string;
  volumeAmount: string | null;
  financing: string | null;
  clientName: string | null;
  description: string;
  body: string[];
  image: string | null;
  pdf: string | null;
};

export type MediaItem = {
  id: string;
  name: string;
  stored_name: string;
  url: string;
  type: 'image' | 'document' | 'video';
  extension: string;
  size: number;
  original_size: number;
  width: number | null;
  height: number | null;
  alt: string;
  uploaded_by: string | null;
  created_at: string | null;
};

export type PageInfo = {
  id: string;
  page: string;
  label: string;
  version: number;
  has_unpublished_changes: boolean;
  updated_by: string | null;
  updated_at: string | null;
  published_by: string | null;
  published_at: string | null;
};

export type PageDetail = PageInfo & {
  draft: Record<string, unknown>;
  published: Record<string, unknown>;
};

export type SeoEntry = {
  id: string;
  key: string;
  path: string;
  title: string;
  description: string;
  image?: string | null;
  type?: string | null;
  noindex?: boolean | null;
  version: number;
  updated_by: string | null;
  updated_at: string | null;
};

export type VersionEntry = {
  version: number;
  author: string | null;
  created_at: string;
  note: string | null;
};

export type VersionDetail = VersionEntry & { data: Record<string, unknown> };

export type SiteVersionRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  version: number;
  title: string;
  author: string | null;
  note: string | null;
  created_at: string;
};

export type ScheduledRow = {
  entity_type: string;
  id: string;
  title: string;
  cms_status: CmsStatus;
  schedule_publish_at: string | null;
  schedule_archive_at: string | null;
};

export type SiteBuild = {
  id: string;
  number: number;
  label: string;
  status: 'preview' | 'published' | 'archived';
  author: string;
  created_at: string;
  published_at: string | null;
  counts: Record<string, number>;
  site_counts: Record<string, number>;
};

export type BackupRecord = {
  id: string;
  filename: string;
  label: string;
  size: number;
  author: string;
  automatic: boolean;
  created_at: string;
  counts: Record<string, number>;
  media_count: number;
};

export type ApplicationRecord = {
  id: string;
  job_slug: string;
  job_title: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  files: { kind: string; name: string; stored_name: string; size: number }[];
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  created_at: string;
};

export type DashboardData = {
  totals: Record<string, number>;
  by_status: Record<string, Record<string, number>>;
  projects_by_region: { label: string; value: number }[];
  projects_by_expertise: { label: string; value: number }[];
  news_by_year: { label: string; value: number }[];
  workflow_queue: Record<string, number>;
  recent_activity: {
    id: string;
    created_at: string;
    actor_email: string | null;
    description: string;
  }[];
};

/* --------------------------------------------------------------- errors */

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Policy violations come back as a list of sentences; join them for display. */
  get detailLines(): string[] {
    if (Array.isArray(this.details)) {
      return this.details.map((d) =>
        typeof d === 'string' ? d : ((d as { message?: string }).message ?? String(d))
      );
    }
    return [];
  }
}

/* ---------------------------------------------------------- token store */

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;
let onSessionLost: (() => void) | null = null;

export const tokens = {
  get access() {
    return accessToken;
  },
  get refresh(): string | null {
    try {
      return localStorage.getItem(REFRESH_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set(pair: TokenPair) {
    accessToken = pair.access_token;
    try {
      localStorage.setItem(REFRESH_STORAGE_KEY, pair.refresh_token);
    } catch {
      /* private browsing — the session simply will not survive a reload */
    }
  },
  clear() {
    accessToken = null;
    try {
      localStorage.removeItem(REFRESH_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
  /** Called when a session ends server-side, so the UI can send the user to /admin/login. */
  onSessionLost(handler: (() => void) | null) {
    onSessionLost = handler;
  },
};

/* ------------------------------------------------------------- requests */

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** JSON value, or a FormData for multipart uploads. */
  body?: unknown;
  /** Skip the bearer header and the refresh-and-retry behaviour. */
  anonymous?: boolean;
  signal?: AbortSignal;
};

function query(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

async function parse(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function send<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, anonymous = false, signal } = options;

  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const encode = () =>
    body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body);

  const headers: Record<string, string> = { Accept: 'application/json' };
  // FormData sets its own multipart boundary — never override it.
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  if (!anonymous && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: encode(),
      signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(
      0,
      'network_error',
      'Cannot reach the CMS server. Check that the backend is running.'
    );
  }

  // One silent refresh-and-retry when the access token has simply aged out.
  if (response.status === 401 && !anonymous && tokens.refresh) {
    try {
      const fresh = await refreshAccessToken();
      response = await fetch(`${API_BASE}${path}`, {
        method,
        headers: { ...headers, Authorization: `Bearer ${fresh}` },
        body: encode(),
        signal,
      });
    } catch {
      tokens.clear();
      onSessionLost?.();
    }
  }

  const payload = await parse(response);

  if (!response.ok) {
    const error = (payload ?? {}) as {
      error?: string;
      message?: string;
      details?: unknown;
    };
    throw new ApiError(
      response.status,
      error.error ?? 'error',
      error.message ?? `Request failed (${response.status})`,
      error.details
    );
  }

  return payload as T;
}

/**
 * Rotates the refresh token. Concurrent callers share one in-flight request so
 * a burst of 401s cannot rotate the token several times over and trip the
 * server's replay detection.
 */
async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const stored = tokens.refresh;
  if (!stored) throw new ApiError(401, 'no_session', 'Not signed in.');

  refreshPromise = send<TokenPair>('/auth/refresh', {
    method: 'POST',
    body: { refresh_token: stored },
    anonymous: true,
  })
    .then((pair) => {
      tokens.set(pair);
      return pair.access_token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/* ----------------------------------------------------------------- API */

export const api = {
  auth: {
    login: (email: string, password: string) =>
      send<LoginResult>('/auth/login', {
        method: 'POST',
        body: { email, password },
        anonymous: true,
      }),

    verifyMfa: (mfaToken: string, code: string) =>
      send<LoginSuccess>('/auth/login/2fa', {
        method: 'POST',
        body: { mfa_token: mfaToken, code },
        anonymous: true,
      }),

    me: () => send<CmsUser>('/auth/me'),

    /** Restores a session after a page reload using the stored refresh token. */
    restore: async (): Promise<CmsUser | null> => {
      if (!tokens.refresh) return null;
      try {
        await refreshAccessToken();
        return await send<CmsUser>('/auth/me');
      } catch {
        tokens.clear();
        return null;
      }
    },

    logout: (everywhere = false) =>
      send<{ message: string }>('/auth/logout', {
        method: 'POST',
        body: { refresh_token: everywhere ? null : tokens.refresh },
      }),

    sessions: () => send<SessionInfo[]>('/auth/sessions'),

    changePassword: (currentPassword: string, newPassword: string) =>
      send<{ message: string }>('/auth/password', {
        method: 'POST',
        body: { current_password: currentPassword, new_password: newPassword },
      }),

    setupTwoFactor: () =>
      send<TwoFactorSetup>('/auth/2fa/setup', { method: 'POST' }),

    enableTwoFactor: (code: string) =>
      send<{ two_factor_enabled: true; recovery_codes: string[] }>(
        '/auth/2fa/enable',
        { method: 'POST', body: { code } }
      ),

    disableTwoFactor: (password: string) =>
      send<{ message: string }>('/auth/2fa/disable', {
        method: 'POST',
        body: { password },
      }),
  },

  users: {
    list: (params: {
      search?: string;
      role?: string;
      two_factor?: boolean;
      is_active?: boolean;
      page?: number;
      page_size?: number;
    } = {}) => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '' && value !== null) {
          query.set(key, String(value));
        }
      }
      const suffix = query.toString();
      return send<Page<CmsUser>>(`/users${suffix ? `?${suffix}` : ''}`);
    },

    create: (payload: {
      name: string;
      email: string;
      password: string;
      role: Role;
      is_active?: boolean;
      must_change_password?: boolean;
    }) => send<CmsUser>('/users', { method: 'POST', body: payload }),

    update: (
      id: string,
      payload: Partial<{ name: string; email: string; role: Role; is_active: boolean }>
    ) => send<CmsUser>(`/users/${id}`, { method: 'PATCH', body: payload }),

    remove: (id: string) =>
      send<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),

    resetPassword: (id: string, newPassword: string, mustChange = true) =>
      send<{ message: string }>(`/users/${id}/password`, {
        method: 'POST',
        body: { new_password: newPassword, must_change_password: mustChange },
      }),

    resetTwoFactor: (id: string) =>
      send<{ message: string }>(`/users/${id}/2fa/reset`, { method: 'POST' }),

    unlock: (id: string) =>
      send<{ message: string }>(`/users/${id}/unlock`, { method: 'POST' }),
  },

  audit: {
    list: (params: {
      search?: string;
      actor_email?: string;
      action?: string;
      page?: number;
      page_size?: number;
    } = {}) => send<Page<AuditEntry>>(`/audit${query(params)}`),

    actions: () => send<string[]>('/audit/actions'),
  },

  news: contentModule<NewsItem>('news'),
  jobs: contentModule<JobItem>('jobs'),
  projects: contentModule<ProjectItem>('projects'),

  media: {
    list: (params: {
      search?: string;
      type?: string;
      page?: number;
      page_size?: number;
    } = {}) => send<Page<MediaItem>>(`/media${query(params)}`),

    upload: (file: File, alt = '', replaceId?: string) => {
      const form = new FormData();
      form.append('file', file);
      form.append('alt', alt);
      if (replaceId) form.append('replace_id', replaceId);
      return send<MediaItem>('/media', { method: 'POST', body: form });
    },

    updateAlt: (id: string, alt: string) =>
      send<MediaItem>(`/media/${id}`, { method: 'PATCH', body: { alt } }),

    remove: (id: string) => send<{ message: string }>(`/media/${id}`, { method: 'DELETE' }),
  },

  pages: {
    list: () => send<PageInfo[]>('/pages'),
    get: (page: string) => send<PageDetail>(`/pages/${page}`),
    saveDraft: (page: string, data: Record<string, unknown>) =>
      send<PageDetail>(`/pages/${page}`, { method: 'PUT', body: { data } }),
    publish: (page: string) =>
      send<PageDetail>(`/pages/${page}/publish`, { method: 'POST' }),
    discard: (page: string) =>
      send<PageDetail>(`/pages/${page}/discard`, { method: 'POST' }),
  },

  seo: {
    list: (search?: string) => send<SeoEntry[]>(`/seo${query({ search })}`),
    update: (key: string, changes: Partial<Omit<SeoEntry, 'id' | 'key' | 'version'>>) =>
      send<SeoEntry>(`/seo/${key}`, { method: 'PATCH', body: changes }),
    create: (entry: {
      key: string;
      title: string;
      description: string;
      path: string;
      image?: string;
      type?: string;
      noindex?: boolean;
    }) => send<SeoEntry>('/seo', { method: 'POST', body: entry }),
  },

  applications: {
    list: (params: {
      job_slug?: string;
      status?: string;
      page?: number;
      page_size?: number;
    } = {}) => send<Page<ApplicationRecord>>(`/applications${query(params)}`),

    setStatus: (id: string, status: ApplicationRecord['status']) =>
      send<ApplicationRecord>(`/applications/${id}`, { method: 'PATCH', body: { status } }),

    fileUrl: (id: string, storedName: string) =>
      `${API_BASE}/applications/${id}/files/${storedName}`,
  },

  publish: {
    builds: () => send<SiteBuild[]>('/publish/builds'),
    generate: (label?: string) =>
      send<SiteBuild>('/publish/generate', { method: 'POST', body: { label: label || null } }),
    publishBuild: (id: string) =>
      send<SiteBuild>(`/publish/builds/${id}/publish`, { method: 'POST' }),
    rollback: (id: string) =>
      send<SiteBuild>(`/publish/builds/${id}/rollback`, { method: 'POST' }),
  },

  schedule: {
    list: () => send<ScheduledRow[]>('/schedule'),
    runNow: () => send<{ message: string }>('/schedule/run-now', { method: 'POST' }),
  },

  versions: {
    recent: (entityType?: string) =>
      send<SiteVersionRow[]>(`/versions${query({ entity_type: entityType })}`),
  },

  backups: {
    list: () => send<BackupRecord[]>('/backups'),
    run: () => send<BackupRecord>('/backups/run', { method: 'POST' }),
    restore: (id: string, includeAccounts = false) =>
      send<{ message: string; restored: Record<string, number> }>(
        `/backups/${id}/restore`,
        { method: 'POST', body: { include_accounts: includeAccounts } }
      ),
    remove: (id: string) => send<{ message: string }>(`/backups/${id}`, { method: 'DELETE' }),
    downloadUrl: (id: string) => `${API_BASE}/backups/${id}/download`,
  },

  dashboard: () => send<DashboardData>('/dashboard'),

  search: (q: string) =>
    send<Record<string, { id: string; title: string; [k: string]: unknown }[]>>(
      `/search${query({ q })}`
    ),
};

/**
 * Fetches a protected file (backup, CV…) with the bearer token and hands it
 * to the browser as a download — plain links cannot send the Authorization
 * header.
 */
export async function authorizedDownload(url: string, filename: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response = await fetch(url, { headers });
  if (response.status === 401 && tokens.refresh) {
    const fresh = await refreshAccessToken();
    response = await fetch(url, { headers: { Authorization: `Bearer ${fresh}` } });
  }
  if (!response.ok) {
    throw new ApiError(response.status, 'download_failed', `Download failed (${response.status}).`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

/** Shared surface of the news / jobs / projects managers. */
function contentModule<T extends CmsEnvelope>(base: string) {
  return {
    list: (params: Record<string, unknown> = {}) =>
      send<Page<T>>(`/${base}${query(params)}`),
    get: (id: string) => send<T>(`/${base}/${id}`),
    create: (data: Record<string, unknown>) =>
      send<T>(`/${base}`, { method: 'POST', body: data }),
    update: (id: string, data: Record<string, unknown>) =>
      send<T>(`/${base}/${id}`, { method: 'PATCH', body: data }),
    remove: (id: string) =>
      send<{ message: string }>(`/${base}/${id}`, { method: 'DELETE' }),

    submit: (id: string, note?: string) =>
      send<T>(`/${base}/${id}/submit`, { method: 'POST', body: note ? { note } : {} }),
    approve: (id: string, note?: string) =>
      send<T>(`/${base}/${id}/approve`, { method: 'POST', body: note ? { note } : {} }),
    requestChanges: (id: string, note: string) =>
      send<T>(`/${base}/${id}/request-changes`, { method: 'POST', body: { note } }),
    publishItem: (id: string) => send<T>(`/${base}/${id}/publish`, { method: 'POST', body: {} }),
    archive: (id: string) => send<T>(`/${base}/${id}/archive`, { method: 'POST', body: {} }),

    schedule: (id: string, publishAt: string | null, archiveAt: string | null) =>
      send<T>(`/${base}/${id}/schedule`, {
        method: 'POST',
        body: { publish_at: publishAt, archive_at: archiveAt },
      }),

    versions: (id: string) => send<VersionEntry[]>(`/${base}/${id}/versions`),
    getVersion: (id: string, version: number) =>
      send<VersionDetail>(`/${base}/${id}/versions/${version}`),
    restoreVersion: (id: string, version: number) =>
      send<T>(`/${base}/${id}/versions/${version}/restore`, { method: 'POST', body: {} }),
  };
}
