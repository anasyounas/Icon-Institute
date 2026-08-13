/**
 * Migrate Download / Information Material from hp.icon-institute.de into the CMS.
 *
 * Scrapes brochure titles + PDF (or flipbook) links, uploads PDFs to /media,
 * then PUT + publish the `download` page document.
 *
 * Usage:
 *   CMS_PASSWORD=... node scripts/migrate-downloads.mjs
 *   Optional: DRY_RUN=1 CMS_EMAIL=... CMS_API_BASE=...
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API =
  process.env.CMS_API_BASE ??
  'https://iconinstitue.api.dev.codexcape.solutions/api/v1';
const WP = 'https://hp.icon-institute.de';
const EMAIL = process.env.CMS_EMAIL ?? 'admin@icon-institute.de';
const PASSWORD = process.env.CMS_PASSWORD ?? '';
const DRY_RUN = process.env.DRY_RUN === '1';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '_extracted', 'downloads-migration');
mkdirSync(OUT, { recursive: true });

if (!PASSWORD) {
  console.error('Set CMS_PASSWORD');
  process.exit(1);
}

const SOURCE_URL = `${WP}/download/information-material/`;
const HUB_URL = `${WP}/download/`;
const VIDEOS_URL = `${WP}/download/videos/`;

const ANNIVERSARY_DESCRIPTION =
  'Celebrating 50 years of ICON-INSTITUTE expertise in international cooperation.';

function decodeHtml(s) {
  return String(s ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8216;|&#8217;|&lsquo;|&rsquo;/g, "'")
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, '–')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(html) {
  return decodeHtml(String(html ?? '').replace(/<[^>]+>/g, ' '));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ICON-CMS-Migration/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
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
    throw new Error(`Non-JSON ${res.status} ${url}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} ${url}: ${JSON.stringify(data).slice(0, 400)}`
    );
  }
  return { data, res };
}

async function login() {
  const { data } = await fetchJson(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  return data.tokens.access_token;
}

const mediaCache = new Map();

async function preloadMedia(token) {
  let page = 1;
  for (;;) {
    const { data } = await fetchJson(
      `${API}/media?page=${page}&page_size=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    for (const m of data.items) {
      const base = (m.name || '').replace(/-\d+x\d+(?=\.[^.]+$)/, '');
      if (base) mediaCache.set(`name:${base}`, m.url);
      mediaCache.set(`name:${m.name}`, m.url);
    }
    if (page >= data.total_pages) break;
    page += 1;
  }
}

async function uploadFile(token, fileUrl, alt) {
  if (!fileUrl) return null;
  if (mediaCache.has(fileUrl)) return mediaCache.get(fileUrl);

  const name = decodeURIComponent(
    fileUrl.split('/').pop().split('?')[0] || 'file.bin'
  );
  const base = name.replace(/-\d+x\d+(?=\.[^.]+$)/, '');
  if (mediaCache.has(`name:${base}`)) {
    const u = mediaCache.get(`name:${base}`);
    mediaCache.set(fileUrl, u);
    return u;
  }
  if (mediaCache.has(`name:${name}`)) {
    const u = mediaCache.get(`name:${name}`);
    mediaCache.set(fileUrl, u);
    return u;
  }

  if (DRY_RUN) {
    console.log(`  would-upload ${name}`);
    return fileUrl;
  }

  const res = await fetch(fileUrl, {
    headers: { 'User-Agent': 'ICON-CMS-Migration/1.0' },
  });
  if (!res.ok) {
    console.warn(`  download failed ${res.status}: ${fileUrl}`);
    return null;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get('content-type') || 'application/octet-stream';
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
  if (!up.ok) throw new Error(`upload failed: ${text.slice(0, 300)}`);
  mediaCache.set(fileUrl, data.url);
  mediaCache.set(`name:${name}`, data.url);
  mediaCache.set(`name:${base}`, data.url);
  return data.url;
}

/**
 * Parse information-material rows: each <h5> title paired with the first
 * href in the same table row (PDF or flipbook).
 */
function scrapeMaterials(html) {
  const materials = [];
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let row;
  while ((row = rowRe.exec(html || ''))) {
    const body = row[1];
    const titleM = body.match(/<h5[^>]*>([\s\S]*?)<\/h5>/i);
    if (!titleM) continue;
    const title = stripTags(titleM[1]);
    if (!title) continue;

    const hrefs = [];
    const hrefRe = /href="([^"]+)"/gi;
    let hm;
    while ((hm = hrefRe.exec(body))) {
      let u = hm[1].replace(/&amp;/g, '&');
      if (u.startsWith('/')) u = `${WP}${u}`;
      if (/^https?:\/\//i.test(u)) hrefs.push(u);
    }

    const pdf = hrefs.find((u) => /\.pdf(\?|#|$)/i.test(u)) || null;
    const flipbook =
      hrefs.find((u) => /flipbook/i.test(u)) ||
      hrefs.find((u) => !/\.pdf(\?|#|$)/i.test(u)) ||
      null;

    materials.push({
      title,
      sourceUrl: pdf || flipbook || null,
      kind: pdf ? 'pdf' : flipbook ? 'link' : 'missing',
    });
  }
  return materials;
}

function extractHubCopy(html) {
  const text = stripTags(
    (html.match(/<main[\s\S]*?<\/main>/i) || [''])[0]
  );
  const infoIntro =
    text.match(
      /Information Material\s+(Please click[\s\S]*?Expertise\.)/i
    )?.[1] ||
    'Please click below to download our Brochures and Flyers on our Expertise.';
  const videosIntro =
    text.match(
      /Videos\s+(In the following[\s\S]*?look!)/i
    )?.[1] ||
    'In the following we provide some videos concerning projects we have carried out. Do have a look!';
  return { infoIntro: infoIntro.trim(), videosIntro: videosIntro.trim() };
}

function extractVideosStatus(html) {
  const m = html.match(/<h1[^>]*>\s*Under Construction\s*<\/h1>/i);
  return m ? 'Under Construction' : 'Under Construction';
}

async function main() {
  console.log(DRY_RUN ? 'DRY RUN' : 'LIVE RUN');
  const token = await login();
  console.log('Logged in');
  await preloadMedia(token);
  console.log('Media cache', mediaCache.size);

  const [hubHtml, materialsHtml, videosHtml] = await Promise.all([
    fetchText(HUB_URL),
    fetchText(SOURCE_URL),
    fetchText(VIDEOS_URL),
  ]);
  writeFileSync(join(OUT, 'information-material.html'), materialsHtml);
  writeFileSync(join(OUT, 'download-hub.html'), hubHtml);
  writeFileSync(join(OUT, 'videos.html'), videosHtml);

  const { infoIntro, videosIntro } = extractHubCopy(hubHtml);
  const scraped = scrapeMaterials(materialsHtml);
  writeFileSync(join(OUT, 'scraped.json'), JSON.stringify(scraped, null, 2));
  console.log(`Scraped ${scraped.length} materials`);

  if (!scraped.length) {
    throw new Error('No materials found on information-material page');
  }

  const materials = [];
  const uploadMap = [];

  for (const item of scraped) {
    process.stdout.write(`  ${item.title} … `);
    let file = null;

    if (item.kind === 'pdf' && item.sourceUrl) {
      file = await uploadFile(token, item.sourceUrl, item.title);
      console.log(file || 'UPLOAD FAILED');
    } else if (item.kind === 'link' && item.sourceUrl) {
      // Flipbook / external HTML — keep absolute URL (frontend allows https).
      file = item.sourceUrl;
      console.log(`link ${file}`);
    } else {
      console.log('missing file');
    }

    const entry = { title: item.title };
    if (file) entry.file = file;
    if (/50th Anniversary/i.test(item.title)) {
      entry.description = ANNIVERSARY_DESCRIPTION;
    }
    materials.push(entry);
    uploadMap.push({
      title: item.title,
      kind: item.kind,
      sourceUrl: item.sourceUrl,
      file,
    });
    await sleep(150);
  }

  writeFileSync(join(OUT, 'upload-map.json'), JSON.stringify(uploadMap, null, 2));

  const pageData = {
    title: 'Download',
    informationMaterial: {
      title: 'Information Material',
      intro: infoIntro,
      materials,
    },
    videos: {
      title: 'Videos',
      intro: videosIntro,
      status: extractVideosStatus(videosHtml),
    },
  };

  writeFileSync(join(OUT, 'page-data.json'), JSON.stringify(pageData, null, 2));

  let before = null;
  try {
    const { data } = await fetchJson(`${API}/pages/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    before = data;
    writeFileSync(join(OUT, 'page-before.json'), JSON.stringify(before, null, 2));
  } catch (err) {
    console.warn('Could not load existing page:', err.message);
  }

  if (DRY_RUN) {
    console.log('Would PUT + publish /pages/download with', materials.length, 'materials');
  } else {
    await fetchJson(`${API}/pages/download`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: pageData }),
    });
    console.log('Saved draft /pages/download');

    await fetchJson(`${API}/pages/download/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Published /pages/download');

    const { data: after } = await fetchJson(`${API}/pages/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    writeFileSync(join(OUT, 'page-after.json'), JSON.stringify(after, null, 2));
  }

  const summary = {
    source: SOURCE_URL,
    materials: materials.length,
    pdfs: uploadMap.filter((u) => u.kind === 'pdf' && u.file).length,
    links: uploadMap.filter((u) => u.kind === 'link' && u.file).length,
    missing: uploadMap.filter((u) => !u.file).length,
    dryRun: DRY_RUN,
  };
  writeFileSync(join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log('\nDone', summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
