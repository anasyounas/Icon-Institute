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
const OUT = join(__dirname, '_extracted', 'news-migration');
mkdirSync(OUT, { recursive: true });

if (!PASSWORD) {
  console.error('Set CMS_PASSWORD');
  process.exit(1);
}

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

function norm(s) {
  return decodeHtml(s)
    .toLowerCase()
    .replace(/[–—−]/g, '-')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
    throw new Error(`HTTP ${res.status} ${url}: ${JSON.stringify(data).slice(0, 400)}`);
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

async function listCmsNews(token) {
  const items = [];
  let page = 1;
  for (;;) {
    const { data } = await fetchJson(
      `${API}/news?page=${page}&page_size=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    items.push(...data.items);
    if (page >= data.total_pages) break;
    page += 1;
  }
  return items;
}

async function listWpPosts() {
  const posts = [];
  let page = 1;
  for (;;) {
    const res = await fetch(
      `${WP}/wp-json/wp/v2/posts?per_page=50&page=${page}&_embed=1`,
      { headers: { 'User-Agent': 'ICON-CMS-Migration/1.0' } }
    );
    if (res.status === 400) break;
    if (!res.ok) throw new Error(`WP posts ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || !batch.length) break;
    posts.push(...batch);
    const totalPages = Number(res.headers.get('x-wp-totalpages') || '1');
    console.log(`WP news page ${page}/${totalPages}: ${batch.length}`);
    if (page >= totalPages) break;
    page += 1;
    await sleep(150);
  }
  return posts;
}

function featuredUrl(post) {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;
  return (
    media.source_url ||
    media.media_details?.sizes?.large?.source_url ||
    media.media_details?.sizes?.full?.source_url ||
    null
  );
}

function extractPdfs(html) {
  const urls = [];
  const re = /href="([^"]+\.pdf[^"]*)"/gi;
  let m;
  while ((m = re.exec(html || ''))) {
    let u = m[1].replace(/&amp;/g, '&');
    if (u.startsWith('/')) u = `${WP}${u}`;
    if (!urls.includes(u)) urls.push(u);
  }
  return urls;
}

function attachmentLabel(url, html) {
  const re = new RegExp(
    `href="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>([^<]{3,120})<`,
    'i'
  );
  const m = (html || '').match(re);
  if (m) {
    const t = stripTags(m[1]);
    if (t && !/^https?:/i.test(t)) return t;
  }
  const name = decodeURIComponent(url.split('/').pop() || 'Download');
  return name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim() || 'Download PDF';
}

const mediaCache = new Map();

async function preloadMedia(token) {
  let page = 1;
  for (;;) {
    const { data } = await fetchJson(`${API}/media?page=${page}&page_size=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
  const name = decodeURIComponent(fileUrl.split('/').pop().split('?')[0] || 'file.bin');
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

function matchCms(cmsItems, post) {
  const slug = post.slug;
  const title = norm(stripTags(post.title?.rendered || ''));
  // Prefer slug startsWith / exact-ish (CMS slugs may be truncated)
  let hit = cmsItems.find((n) => n.slug === slug || slug.startsWith(n.slug) || n.slug.startsWith(slug));
  if (hit) return hit;
  hit = cmsItems.find((n) => norm(n.title) === title);
  if (hit) return hit;
  // fuzzy: cms title contained in wp title or vice versa
  hit = cmsItems.find((n) => {
    const t = norm(n.title);
    return t.length > 20 && (title.includes(t) || t.includes(title));
  });
  return hit || null;
}

async function main() {
  const token = await login();
  console.log('Logged in');
  await preloadMedia(token);
  console.log('Media cache', mediaCache.size);

  const cms = await listCmsNews(token);
  console.log('CMS news', cms.length);
  const posts = await listWpPosts();
  console.log('WP news', posts.length);
  writeFileSync(
    join(OUT, 'wp-posts-index.json'),
    JSON.stringify(
      posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: stripTags(p.title?.rendered),
        link: p.link,
        featured: featuredUrl(p),
        pdfs: extractPdfs(p.content?.rendered),
      })),
      null,
      2
    )
  );

  const results = [];
  const usedCms = new Set();

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const title = stripTags(post.title?.rendered);
    const cmsItem = matchCms(
      cms.filter((c) => !usedCms.has(c.id)),
      post
    );
    process.stdout.write(`[${i + 1}/${posts.length}] ${title.slice(0, 60)} … `);

    if (!cmsItem) {
      console.log('NO CMS MATCH');
      results.push({ ok: false, title, slug: post.slug, error: 'no cms match' });
      continue;
    }
    usedCms.add(cmsItem.id);

    try {
      const feat = featuredUrl(post);
      const pdfs = extractPdfs(post.content?.rendered);
      // Also scrape live page for PDFs if content empty of PDFs
      let pageHtml = post.content?.rendered || '';
      if (!pdfs.length && post.link) {
        try {
          const pageRes = await fetch(post.link, {
            headers: { 'User-Agent': 'ICON-CMS-Migration/1.0' },
          });
          pageHtml = await pageRes.text();
        } catch {
          /* ignore */
        }
      }
      const allPdfs = pdfs.length ? pdfs : extractPdfs(pageHtml);
      const image = feat ? await uploadFile(token, feat, title) : cmsItem.image;
      let attachment = cmsItem.attachment || null;
      let attachment_label = cmsItem.attachment_label || null;
      if (allPdfs[0]) {
        attachment = await uploadFile(token, allPdfs[0], title);
        attachment_label = attachmentLabel(allPdfs[0], pageHtml);
      }

      const patch = {
        image: image || null,
        attachment: attachment || null,
        attachment_label: attachment_label || null,
      };

      if (DRY_RUN) {
        console.log('would-update', cmsItem.id, patch);
        results.push({ ok: true, action: 'would-update', cmsId: cmsItem.id, title, ...patch, source: post.link });
      } else {
        await fetchJson(`${API}/news/${cmsItem.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patch),
        });
        console.log(
          `updated ${cmsItem.id} img=${!!image} pdf=${!!attachment}`
        );
        results.push({
          ok: true,
          action: 'updated',
          cmsId: cmsItem.id,
          title,
          image,
          attachment,
          source: post.link,
        });
      }
      writeFileSync(join(OUT, 'progress.json'), JSON.stringify(results, null, 2));
    } catch (err) {
      console.log('ERROR', err.message);
      results.push({ ok: false, title, slug: post.slug, error: String(err.message || err) });
      writeFileSync(join(OUT, 'progress.json'), JSON.stringify(results, null, 2));
    }
    await sleep(200);
  }

  const unmatchedCms = cms.filter((c) => !usedCms.has(c.id));
  const summary = {
    wp: posts.length,
    cms: cms.length,
    updated: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok),
    unmatchedCms: unmatchedCms.map((c) => ({ id: c.id, title: c.title, slug: c.slug })),
  };
  writeFileSync(join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log('\nDone', {
    updated: summary.updated,
    failed: summary.failed.length,
    unmatchedCms: summary.unmatchedCms.length,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
