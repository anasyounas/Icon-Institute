# Deploying the ICON-INSTITUTE website & CMS

The front end is a single-page application: the public site and the CMS admin
(`/admin/...`) are one build, served as static files.

## Two things must be right

### 1. SPA fallback — otherwise every page except `/` returns 404

React Router uses the History API, so the web server must serve `index.html`
for any path that is not a real file. Without this, `/news`, `/jobs`,
`/projects` and `/admin/login` return **404** on a direct visit or hard reload —
the site only works if you land on `/` and navigate by clicking.

This repository ships the fix three ways; use whichever your host supports:

| Host style | File | What it does |
| --- | --- | --- |
| Docker / nginx | `Dockerfile` + `nginx.conf` | `try_files $uri $uri/ /index.html` |
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
