/**
 * Upload images for published CMS projects that have none, using the original
 * site photo when the page exists, otherwise the same expertise thumb the
 * source listing uses.
 *
 *   CMS_PASSWORD=... node scripts/remigrate-missing-project-images.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API =
  process.env.CMS_API_BASE ??
  'https://iconinstitue.api.dev.codexcape.solutions/api/v1';
const WP = 'https://hp.icon-institute.de';
const EMAIL = process.env.CMS_EMAIL ?? 'admin@icon-institute.de';
const PASSWORD = process.env.CMS_PASSWORD ?? '';
const DRY_RUN = process.env.DRY_RUN === '1';

if (!PASSWORD) {
  console.error('Set CMS_PASSWORD');
  process.exit(1);
}

const OUT = join(__dirname, '_extracted', 'missing-images');
mkdirSync(OUT, { recursive: true });

const EXPERTISE_THUMBS = {
  'economic-employment-promotion':
    `${WP}/wp-content/uploads/2019/05/economic-and-employment-promotion.png`,
  'governance-education-social-development':
    `${WP}/wp-content/uploads/2019/06/governance-public-administration.jpg`,
  'agriculture-rural-development':
    `${WP}/wp-content/uploads/2019/06/infrastructure-and-rural-development.jpg`,
  'statistics-evaluation-social-research':
    `${WP}/wp-content/uploads/2019/10/statistics-evaluation-and-social-research-1.png`,
  'sustainability-management':
    `${WP}/wp-content/uploads/2023/01/Sustainable-supply-chains-1.png`,
};

const KNOWN_PAGES = {
  'tei-op-vet': `${WP}/refprojects/ptechnical-assistance-of-the-tei-op-vetp/`,
  'prior-learning-egypt': `${WP}/refprojects/prior-learning-policy-development/`,
  'benchlearning-task-among-public-employment-services':
    `${WP}/refprojects/benchlearning-among-public-employment-services/`,
  'benchlearning-pes':
    `${WP}/refprojects/benchlearning-among-public-employment-services/`,
};

function extractFeaturedImage(html) {
  const m = html.match(
    /w-image project-image[\s\S]*?<img[^>]+src="(https:\/\/hp\.icon-institute\.de\/wp-content\/uploads\/[^"]+)"/i
  );
  if (m) return m[1].replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
  const og = html.match(/property="og:image" content="([^"]+)"/i);
  const url = og ? og[1] : null;
  if (!url) return null;
  if (/logo_icon|icon_projects/i.test(url)) return null;
  return url;
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'ICON-CMS-Migration/1.0',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Non-JSON ${res.status} for ${url}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} for ${url}: ${JSON.stringify(data).slice(0, 400)}`
    );
  }
  return data;
}

async function login() {
  const data = await fetchJson(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (data.mfa_required) throw new Error('MFA required');
  return data.tokens.access_token;
}

async function listAllProjects(token) {
  const items = [];
  let page = 1;
  for (;;) {
    const data = await fetchJson(
      `${API}/projects?page=${page}&page_size=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    items.push(...data.items);
    if (page >= data.total_pages) break;
    page += 1;
  }
  return items;
}

const mediaCache = new Map();

async function uploadImage(token, imageUrl, alt) {
  if (!imageUrl) return null;
  if (mediaCache.has(imageUrl)) return mediaCache.get(imageUrl);

  const name = imageUrl.split('/').pop().split('?')[0] || 'project.jpg';
  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'ICON-CMS-Migration/1.0' },
  });
  if (!res.ok) {
    console.warn(`  download failed ${res.status}: ${imageUrl}`);
    return null;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 800) {
    console.warn(`  download too small (${buf.length}): ${imageUrl}`);
    return null;
  }
  const type = res.headers.get('content-type') || 'image/jpeg';
  const form = new FormData();
  form.append('file', new Blob([buf], { type }), name);
  form.append('alt', alt || name);

  const up = await fetch(`${API}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await up.text();
  const data = JSON.parse(text);
  if (!up.ok) {
    throw new Error(`media upload failed: ${JSON.stringify(data).slice(0, 300)}`);
  }
  mediaCache.set(imageUrl, data.url);
  return data.url;
}

async function sourceImageFor(project) {
  const guesses = [
    KNOWN_PAGES[project.id],
    KNOWN_PAGES[project.slug],
    project.slug ? `${WP}/refprojects/${project.slug}/` : null,
  ].filter(Boolean);

  for (const url of guesses) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ICON-CMS-Migration/1.0' },
      redirect: 'follow',
    });
    if (!res.ok) continue;
    const html = await res.text();
    const featured = extractFeaturedImage(html);
    if (featured) return { source: url, imageUrl: featured };
  }

  const thumb = EXPERTISE_THUMBS[project.expertise];
  if (thumb) return { source: 'expertise-thumb', imageUrl: thumb };
  return {
    source: 'projects-map',
    imageUrl: `${WP}/wp-content/uploads/2019/06/icon_projects.jpg`,
  };
}

async function maybePublish(token, id) {
  try {
    await fetchJson(`${API}/projects/${id}/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
  } catch {
    /* already published, or workflow needs submit — image PATCH is enough */
  }
}

async function main() {
  const token = await login();
  const all = await listAllProjects(token);
  const missing = all.filter((p) => !p.image);
  console.log(`CMS projects ${all.length}; missing image ${missing.length}`);

  const results = [];
  for (const project of missing) {
    const label = `${project.title} [${project.id}]`;
    process.stdout.write(`${label} … `);
    try {
      const src = await sourceImageFor(project);
      if (DRY_RUN) {
        console.log(`would use ${src.source} ${src.imageUrl}`);
        results.push({ id: project.id, title: project.title, dry: src });
        continue;
      }
      const image = await uploadImage(token, src.imageUrl, project.title);
      if (!image) throw new Error('upload returned no url');
      const updated = await fetchJson(`${API}/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });
      await maybePublish(token, project.id);
      console.log(`${src.source} -> ${image} (${updated.cms_status || ''})`);
      results.push({
        id: project.id,
        title: project.title,
        source: src.source,
        image,
        status: updated.cms_status,
      });
    } catch (err) {
      console.log(`ERROR ${err.message}`);
      results.push({ id: project.id, title: project.title, error: String(err.message) });
    }
  }

  writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
