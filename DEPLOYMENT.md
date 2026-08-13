# Deploying the ICON-INSTITUTE website & CMS

The front end is a single-page application: the public site and the CMS admin
(`/admin/...`) are one build, served as static files.

## Dokploy (current host) — fix refresh 404s

If hard-refresh on `/news`, `/admin/login`, etc. returns **`404 Not Found
nginx/…`**, Dokploy is serving `dist` with stock nginx and **no SPA fallback**.

Your deploy log shows exactly that path:

1. Nixpacks builds the Vite app (`npm run build` → `dist/`)
2. Dokploy then builds a tiny image: `FROM nginx:alpine` + `COPY ./dist .`
3. That image ignores this repo’s `nginx.conf`, `Dockerfile`, and `serve -s`

### Fix — pick one, then redeploy

**A. Recommended — Build type: Dockerfile**

| Setting | Value |
| --- | --- |
| Build type | `Dockerfile` |
| Dockerfile path | `Dockerfile` |
| Docker context | `.` |
| Container port | `80` |

This image already ships `nginx.conf` with
`try_files $uri $uri/ /index.html`.

**B. Keep Nixpacks + Publish Directory `dist`**

| Setting | Value |
| --- | --- |
| Build type | `Nixpacks` |
| Publish Directory | `dist` |
| **Single Page Application (SPA)** | **enabled** (required) |
| Container port | `80` |

Without the SPA checkbox, Dokploy’s generated nginx has no `try_files` and
every deep link 404s on refresh.

**C. Nixpacks without Publish Directory**

| Setting | Value |
| --- | --- |
| Build type | `Nixpacks` |
| Publish Directory | *(empty)* |
| Container port | `3000` (or whatever `PORT` is) |

Nixpacks then runs `serve -s dist`, which rewrites unknown paths to
`index.html`.

After changing settings, redeploy and verify:

```bash
curl -I https://<site-domain>/admin/login   # must be 200, not 404
curl -I https://<site-domain>/news          # must be 200, not 404
```

---

## Two things must be right

### 1. SPA fallback — otherwise every page except `/` returns 404

React Router uses the History API, so the web server must serve `index.html`
for any path that is not a real file. Without this, `/news`, `/jobs`,
`/projects` and `/admin/login` return **404** on a direct visit or hard reload —
the site only works if you land on `/` and navigate by clicking.

This repository ships the fix several ways; use whichever your host supports:

| Host style | File | What it does |
| --- | --- | --- |
| Dokploy (Dockerfile) | `Dockerfile` + `nginx.conf` | `try_files $uri $uri/ /index.html` |
| Dokploy (Nixpacks + publish dir) | Dokploy **SPA** checkbox | same `try_files` in generated nginx |
| Dokploy (Nixpacks, no publish dir) | `nixpacks.toml` / `npm start` | `serve -s dist` |
| Netlify, Cloudflare Pages | `public/_redirects` | `/* /index.html 200` |
| Other nginx | `nginx.conf` | copy into the server block |

Plain nginx, if you configure the server yourself:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Apache (`.htaccess`):

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 2. `VITE_API_BASE_URL` — baked in at build time

Vite inlines environment variables during `npm run build`, so this must be set
**before** the build, not at runtime:

```
VITE_API_BASE_URL=https://iconinstitue.api.dev.codexcape.solutions/api/v1
```

With the Dockerfile, pass it as a build argument:

```bash
docker build --build-arg VITE_API_BASE_URL=https://iconinstitue.api.dev.codexcape.solutions/api/v1 -t icon-site .
docker run -p 8080:80 icon-site
```

A build made with the local default (`http://127.0.0.1:8000/api/v1`) will not
reach the deployed API — and because the site is served over HTTPS, browsers
block plain-HTTP API calls as mixed content. The API must be on HTTPS too.

## Backend CORS

The API only answers browsers from origins listed in its `CORS_ORIGINS`. The
deployed front end is already included:

```
CORS_ORIGINS=https://iconinstitute.dev.codexcape.solutions
```

Add any new front-end domain there (no trailing slash) and restart the API.

## Verifying a deployment

```bash
curl https://<api-domain>/health            # {"status":"ok","database":"up"}
curl -I https://<site-domain>/admin/login   # must be 200, not 404
```

Full acceptance run, from the backend project:

```bash
python -m scripts.verify_cms_to_site --base-url https://<api-domain>
```

That walks every CMS module through create → publish → *appears on the public
site* → edit → archive, which is the behaviour the project is judged on.
