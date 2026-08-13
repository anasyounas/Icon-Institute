/**
 * Migrate Asia projects from hp.icon-institute.de into the CMS API.
 *
 * Usage:
 *   CMS_EMAIL=... CMS_PASSWORD=... node scripts/migrate-asia-projects.mjs
 *   Optional: LIMIT=5 DRY_RUN=1 START=0
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '_extracted', 'asia-migration');
const API =
  process.env.CMS_API_BASE ??
  'https://iconinstitue.api.dev.codexcape.solutions/api/v1';
const WP = 'https://hp.icon-institute.de';
const EMAIL = process.env.CMS_EMAIL ?? 'admin@icon-institute.de';
const PASSWORD = process.env.CMS_PASSWORD ?? '';
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
const START = process.env.START ? Number(process.env.START) : 0;
const DRY_RUN = process.env.DRY_RUN === '1';
const REGION = 'asia';

if (!PASSWORD) {
  console.error('Set CMS_PASSWORD');
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const EXPERTISE_MAP = {
  'economic and employment promotion': 'economic-employment-promotion',
  'governance, education and social development':
    'governance-education-social-development',
  'governance, public administration':
    'governance-education-social-development',
  'infrastructure and rural development': 'agriculture-rural-development',
  'agriculture and rural development': 'agriculture-rural-development',
  'statistics, evaluation and social research':
    'statistics-evaluation-social-research',
  'sustainability management': 'sustainability-management',
};

function decodeHtml(s) {
  return String(s ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8216;|&#8217;|&lsquo;|&rsquo;/g, "'")
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, '–')
    .replace(/&euro;/gi, '€')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    )
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(html) {
  return decodeHtml(
    String(html ?? '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'ICON-CMS-Migration/1.0',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${url}: ${body.slice(0, 200)}`);
  }
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
    throw new Error(`Non-JSON ${res.status} for ${url}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} for ${url}: ${JSON.stringify(data).slice(0, 400)}`
    );
  }
  return data;
}

function mapExpertise(label) {
  const key = decodeHtml(label).toLowerCase();
  return EXPERTISE_MAP[key] ?? 'statistics-evaluation-social-research';
}

function parseEuroAmount(raw) {
  const t = decodeHtml(raw).replace(/\s/g, '');
  // German: 29.258€ or 1.234.567,89€ or 321.980 €
  const m = t.match(/([\d.]+(?:,\d+)?)/);
  if (!m) return null;
  let n = m[1];
  if (n.includes(',') && n.includes('.')) {
    n = n.replace(/\./g, '').replace(',', '.');
  } else if (n.includes(',')) {
    n = n.replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(n)) {
    n = n.replace(/\./g, '');
  }
  const value = Number(n);
  return Number.isFinite(value) ? value : null;
}

function volumeBucket(amount) {
  if (amount == null) return 'lt-100k';
  if (amount < 100_000) return 'lt-100k';
  if (amount < 300_000) return '100k-300k';
  if (amount < 500_000) return '300k-500k';
  if (amount < 1_000_000) return '500k-1m';
  if (amount < 3_000_000) return '1m-3m';
  if (amount < 5_000_000) return '3m-5m';
  return 'gt-5m';
}

function parsePeriod(raw) {
  const t = decodeHtml(raw);
  // 15/06/2025 - 31/12/2025  OR  2025 - 2026
  const range = t.match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4})\s*[-–]\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/
  );
  if (range) {
    const [, d1, m1, y1, d2, m2, y2] = range;
    return {
      periodStart: `${y1}-${m1.padStart(2, '0')}-${d1.padStart(2, '0')}`,
      periodEnd: `${y2}-${m2.padStart(2, '0')}-${d2.padStart(2, '0')}`,
      yearStart: Number(y1),
      yearEnd: Number(y2),
    };
  }
  const years = t.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (years) {
    return {
      periodStart: null,
      periodEnd: null,
      yearStart: Number(years[1]),
      yearEnd: Number(years[2]),
    };
  }
  const one = t.match(/(\d{4})/);
  if (one) {
    const y = Number(one[1]);
    return { periodStart: null, periodEnd: null, yearStart: y, yearEnd: y };
  }
  const y = new Date().getFullYear();
  return { periodStart: null, periodEnd: null, yearStart: y, yearEnd: y };
}

function parseCountries(raw) {
  const t = decodeHtml(raw);
  if (!t) return ['Various countries'];
  if (/^various/i.test(t)) return ['Various countries'];
  return t
    .split(/,|\/|;|\band\b/i)
    .map((c) => c.trim())
    .filter(Boolean);
}

function iconboxValue(html, title) {
  const re = new RegExp(
    `w-iconbox-title">${title}<\\/h6>[\\s\\S]*?w-iconbox-text"><p>([\\s\\S]*?)<\\/p>`,
    'i'
  );
  const m = html.match(re);
  return m ? stripTags(m[1]) : '';
}

function extractBody(html) {
  // Description lives in the left column; stop before the facts sidebar.
  const start = html.search(/PROJECT DESCRIPTION<\/h3>/i);
  if (start < 0) return [];
  const after = html.slice(start + 'PROJECT DESCRIPTION</h3>'.length);
  const stopCandidates = [
    after.search(/<div class="vc_col-sm-4\b/i),
    after.search(/w-iconbox-title">PERIOD</i),
    after.search(/<a class="pdf"/i),
  ].filter((i) => i >= 0);
  const end = stopCandidates.length ? Math.min(...stopCandidates) : after.length;
  let chunk = after.slice(0, end);

  // Drop leftover wrappers / trailing attachment ids like "8810865" or "(8810832)"
  chunk = chunk
    .replace(/<div class="small-countries">[\s\S]*?<\/div>/gi, '')
    .replace(/<\/?(div|span|section|h\d)[^>]*>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/(?:^|\n)\s*[\(]?\d{5,}[\)]?\s*$/gm, '');

  return chunk
    .split(/<br\s*\/?>\s*<br\s*\/?>/i)
    .map((p) => stripTags(p).replace(/^[-–•]\s+/, '').trim())
    .filter(
      (p) =>
        p &&
        p.length > 5 &&
        !/^\d{5,}$/.test(p) &&
        !/^PERIOD\b/i.test(p) &&
        !/^Download PDF/i.test(p) &&
        !/^mapICON-INSTITUTE/i.test(p)
    );
}

function extractSubtitle(html) {
  // <h3...>Title</h3><p>Subtitle</p>
  const m = html.match(
    /<h3[^>]*style="min-height:\s*84px;"[^>]*>[\s\S]*?<\/h3>\s*<p>([\s\S]*?)<\/p>/i
  );
  let sub = m
    ? stripTags(m[1])
    : (() => {
        const m2 = html.match(
          /project-image[\s\S]{0,2500}?<h3[^>]*>[\s\S]*?<\/h3>\s*<p>([\s\S]*?)<\/p>/i
        );
        return m2 ? stripTags(m2[1]) : '';
      })();
  // Source occasionally mangles ´ as A' (e.g. "IndiaA's")
  sub = sub.replace(/([A-Za-z])A's/g, "$1's").replace(/([A-Za-z])A´s/g, "$1´s");
  return sub;
}

function extractFeaturedImage(html) {
  const m = html.match(
    /w-image project-image[\s\S]*?<img[^>]+src="(https:\/\/hp\.icon-institute\.de\/wp-content\/uploads\/[^"]+)"/i
  );
  if (m) return m[1].replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
  const og = html.match(/property="og:image" content="([^"]+)"/i);
  return og ? og[1] : null;
}

function extractTitle(html, fallback) {
  const h3 = html.match(
    /<h3[^>]*style="min-height:\s*84px;"[^>]*>([\s\S]*?)<\/h3>/i
  );
  if (h3) return stripTags(h3[1]);
  const og = html.match(/property="og:title" content="([^"]+)"/i);
  if (og) {
    return decodeHtml(og[1]).replace(
      /\s*-\s*ICON-INSTITUTE.*$/i,
      ''
    );
  }
  return fallback;
}

function summarize(body, subtitle) {
  const first = (body[0] || subtitle || '').trim();
  if (first.length <= 280) return first.length >= 10 ? first : `${first} project.`;
  const cut = first.slice(0, 277);
  const sp = cut.lastIndexOf(' ');
  return `${cut.slice(0, sp > 180 ? sp : 277)}…`;
}

function normTitle(t) {
  return decodeHtml(t)
    .toLowerCase()
    .replace(/[–—−]/g, '-')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function login() {
  const data = await fetchJson(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (data.mfa_required) throw new Error('MFA required — disable or provide code flow');
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

async function collectAsiaIds() {
  const ids = [];
  for (let p = 1; p <= 20; p++) {
    const url =
      p === 1 ? `${WP}/projects-asia/` : `${WP}/projects-asia/page/${p}/`;
    const html = await fetchText(url);
    const found = [
      ...html.matchAll(
        /<article[^>]*class="[^"]*w-grid-item[^"]*"[^>]*data-id="(\d+)"/gi
      ),
    ].map((m) => m[1]);
    if (!found.length) break;
    ids.push(...found);
    console.log(`Listing page ${p}: ${found.length} projects`);
    if (!html.includes(`/projects-asia/page/${p + 1}/`)) break;
    await sleep(200);
  }
  return [...new Set(ids)];
}

async function gridItems(ids) {
  const body = new URLSearchParams();
  body.set('action', 'icoins_grid_items');
  for (const id of ids) body.append('ids[]', id);
  const data = await fetchJson(`${WP}/wp-admin/admin-ajax.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (data.ack !== 'ok') throw new Error('grid items ajax failed');
  return data.items || {};
}

async function scrapeProject(id, card) {
  const permalink =
    card?.permalink || `${WP}/?post_type=refprojects&p=${id}`;
  const html = await fetchText(permalink);
  const title = extractTitle(html, card?.title || `Project ${id}`);
  const subtitle = extractSubtitle(html);
  const body = extractBody(html);
  const imageUrl = extractFeaturedImage(html);
  const periodRaw = iconboxValue(html, 'PERIOD') || card?.period || '';
  const countryRaw = iconboxValue(html, 'COUNTRY') || card?.country || '';
  const expertiseRaw = iconboxValue(html, 'EXPERTISE') || '';
  const volumeRaw = iconboxValue(html, 'VOLUME') || '';
  const financing = iconboxValue(html, 'FINANCING') || null;
  const clientName = iconboxValue(html, 'CLIENT NAME') || null;
  const period = parsePeriod(periodRaw);
  const amount = parseEuroAmount(volumeRaw);
  const countries = parseCountries(countryRaw);

  // Prefer real project image; fall back to card expertise thumb only if needed
  let finalImage = imageUrl;
  if (!finalImage && card?.image) {
    const src = card.image.match(/src="([^"]+)"/i);
    if (src) finalImage = src[1];
  }

  return {
    wpId: id,
    permalink,
    title,
    subtitle: subtitle || null,
    countries,
    region: REGION,
    yearStart: period.yearStart,
    yearEnd: period.yearEnd,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    expertise: mapExpertise(expertiseRaw),
    expertiseLabel: expertiseRaw,
    volume: volumeBucket(amount),
    volumeAmount: volumeRaw ? decodeHtml(volumeRaw) : null,
    financing: financing || null,
    clientName: clientName || null,
    description: summarize(body, subtitle || title),
    body: body.length ? body : [summarize(body, subtitle || title)],
    imageUrl: finalImage,
    pdf: null,
  };
}

const mediaCache = new Map();

async function preloadMediaCache(token) {
  let page = 1;
  for (;;) {
    const data = await fetchJson(`${API}/media?page=${page}&page_size=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    for (const m of data.items) {
      // Map common source filenames → already-uploaded CMS urls
      const base = (m.name || '').replace(/-\d+x\d+(?=\.[^.]+$)/, '');
      if (base) mediaCache.set(`name:${base}`, m.url);
      if (m.stored_name) mediaCache.set(`stored:${m.stored_name}`, m.url);
    }
    if (page >= data.total_pages) break;
    page += 1;
  }
}

async function uploadImage(token, imageUrl, alt) {
  if (!imageUrl) return null;
  if (mediaCache.has(imageUrl)) return mediaCache.get(imageUrl);

  const name = imageUrl.split('/').pop().split('?')[0] || 'project.jpg';
  const base = name.replace(/-\d+x\d+(?=\.[^.]+$)/, '');
  if (mediaCache.has(`name:${base}`)) {
    const url = mediaCache.get(`name:${base}`);
    mediaCache.set(imageUrl, url);
    return url;
  }
  if (mediaCache.has(`name:${name}`)) {
    const url = mediaCache.get(`name:${name}`);
    mediaCache.set(imageUrl, url);
    return url;
  }

  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'ICON-CMS-Migration/1.0' },
  });
  if (!res.ok) {
    console.warn(`  image download failed ${res.status}: ${imageUrl}`);
    return null;
  }
  const buf = Buffer.from(await res.arrayBuffer());
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
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`media upload non-json: ${text.slice(0, 200)}`);
  }
  if (!up.ok) {
    throw new Error(`media upload failed: ${JSON.stringify(data).slice(0, 300)}`);
  }
  mediaCache.set(imageUrl, data.url);
  mediaCache.set(`name:${name}`, data.url);
  mediaCache.set(`name:${base}`, data.url);
  return data.url;
}

async function upsertProject(token, existingByTitle, payload) {
  const key = normTitle(payload.title);
  const existing = existingByTitle.get(key);
  const body = { ...payload };
  delete body.wpId;
  delete body.permalink;
  delete body.imageUrl;
  delete body.expertiseLabel;

  if (DRY_RUN) {
    return { action: existing ? 'would-update' : 'would-create', id: existing?.id, body };
  }

  if (existing) {
    const updated = await fetchJson(`${API}/projects/${existing.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return { action: 'updated', id: updated.id, item: updated };
  }

  const created = await fetchJson(`${API}/projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  // Admin can publish directly in most setups; try publish, then submit→approve→publish
  try {
    await fetchJson(`${API}/projects/${created.id}/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
  } catch (e1) {
    try {
      await fetchJson(`${API}/projects/${created.id}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
      await fetchJson(`${API}/projects/${created.id}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
      await fetchJson(`${API}/projects/${created.id}/publish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
    } catch (e2) {
      console.warn(`  publish failed for ${created.id}: ${e2.message}`);
    }
  }

  return { action: 'created', id: created.id, item: created };
}

async function main() {
  console.log(`API: ${API}`);
  console.log(`DRY_RUN=${DRY_RUN} START=${START} LIMIT=${LIMIT}`);
  const token = await login();
  console.log('Logged in');
  await preloadMediaCache(token);
  console.log(`Media cache entries: ${mediaCache.size}`);

  const existing = await listAllProjects(token);
  const existingByTitle = new Map();
  for (const p of existing) existingByTitle.set(normTitle(p.title), p);
  console.log(`CMS projects loaded: ${existing.length}`);

  const ids = await collectAsiaIds();
  console.log(`Asia WP ids: ${ids.length}`);
  writeFileSync(join(OUT_DIR, 'asia-ids.json'), JSON.stringify(ids, null, 2));

  // Fetch grid cards in batches
  const cards = {};
  for (let i = 0; i < ids.length; i += 40) {
    const batch = ids.slice(i, i + 40);
    Object.assign(cards, await gridItems(batch));
    await sleep(150);
  }
  writeFileSync(join(OUT_DIR, 'asia-cards.json'), JSON.stringify(cards, null, 2));

  const slice = ids.slice(START, START + (Number.isFinite(LIMIT) ? LIMIT : ids.length));
  const results = [];
  const progressPath = join(OUT_DIR, 'progress.json');

  for (let i = 0; i < slice.length; i++) {
    const id = slice[i];
    const n = START + i + 1;
    const card = cards[id] || cards[String(id)];
    process.stdout.write(`[${n}/${ids.length}] WP#${id} ${card?.title || ''} … `);
    try {
      const scraped = await scrapeProject(id, card);
      const image = await uploadImage(token, scraped.imageUrl, scraped.title);
      const payload = {
        title: scraped.title,
        subtitle: scraped.subtitle,
        countries: scraped.countries,
        region: scraped.region,
        yearStart: scraped.yearStart,
        yearEnd: scraped.yearEnd,
        periodStart: scraped.periodStart,
        periodEnd: scraped.periodEnd,
        expertise: scraped.expertise,
        volume: scraped.volume,
        volumeAmount: scraped.volumeAmount,
        financing: scraped.financing,
        clientName: scraped.clientName,
        description: scraped.description,
        body: scraped.body,
        image,
        pdf: null,
        wpId: scraped.wpId,
        permalink: scraped.permalink,
        imageUrl: scraped.imageUrl,
        expertiseLabel: scraped.expertiseLabel,
      };

      const result = await upsertProject(token, existingByTitle, payload);
      if (result.item) {
        existingByTitle.set(normTitle(result.item.title), result.item);
      } else if (!existingByTitle.has(normTitle(payload.title))) {
        existingByTitle.set(normTitle(payload.title), {
          id: result.id,
          title: payload.title,
        });
      }

      console.log(`${result.action} ${result.id || ''}`.trim());
      results.push({
        ok: true,
        wpId: id,
        title: scraped.title,
        action: result.action,
        cmsId: result.id,
        image: !!image,
        bodyParas: scraped.body.length,
      });
      writeFileSync(progressPath, JSON.stringify(results, null, 2));
      writeFileSync(
        join(OUT_DIR, `project-${id}.json`),
        JSON.stringify({ scraped, payload, result }, null, 2)
      );
    } catch (err) {
      console.log(`ERROR ${err.message}`);
      results.push({ ok: false, wpId: id, error: String(err.message || err) });
      writeFileSync(progressPath, JSON.stringify(results, null, 2));
    }
    await sleep(250);
  }

  const summary = {
    total: results.length,
    ok: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok),
    created: results.filter((r) => r.action === 'created').length,
    updated: results.filter((r) => r.action === 'updated').length,
  };
  writeFileSync(join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log('\nDone', summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
