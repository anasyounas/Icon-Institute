import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API =
  process.env.CMS_API_BASE ??
  'https://iconinstitue.api.dev.codexcape.solutions/api/v1';
const EMAIL = process.env.CMS_EMAIL ?? 'admin@icon-institute.de';
const PASSWORD = process.env.CMS_PASSWORD ?? '';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  return data.tokens.access_token;
}

async function listAsia(token) {
  const items = [];
  let page = 1;
  for (;;) {
    const res = await fetch(
      `${API}/projects?region=asia&page=${page}&page_size=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    items.push(...data.items);
    if (page >= data.total_pages) break;
    page += 1;
  }
  return items;
}

const token = await login();
const items = await listAsia(token);
console.log('Asia projects in CMS:', items.length);

const bad = items.filter(
  (p) =>
    /&amp;|&nbsp;/.test(p.title) ||
    !p.title?.trim() ||
    !p.image ||
    !p.body?.length ||
    /^PERIOD\b/i.test(p.body?.[0] || '') ||
    !p.subtitle
);
console.log('Flagged:', bad.length);
for (const p of bad.slice(0, 40)) {
  console.log(
    `- ${p.id} | title=${JSON.stringify(p.title)} | img=${!!p.image} | sub=${!!p.subtitle} | body=${p.body?.length} | status=${p.cms_status}`
  );
}

const samples = [
  'IKI India',
  'Modules for climate',
  'home gardens',
  'Girls Right',
];
for (const q of samples) {
  const p = items.find((x) => x.title.includes(q) || x.title.toLowerCase().includes(q.toLowerCase()));
  if (!p) {
    console.log('MISSING', q);
    continue;
  }
  console.log('\nSAMPLE', p.title);
  console.log('  subtitle:', p.subtitle);
  console.log('  image:', p.image);
  console.log('  financing:', p.financing);
  console.log('  volumeAmount:', p.volumeAmount);
  console.log('  period:', p.periodStart, '->', p.periodEnd);
  console.log('  body paras:', p.body.length);
  console.log('  body0:', p.body[0]?.slice(0, 140));
}

// Failed WP page
const html = await (await fetch('https://hp.icon-institute.de/?post_type=refprojects&p=24599')).text();
const og = (html.match(/property="og:title" content="([^"]+)"/) || [])[1];
const h3 = (html.match(/min-height:\s*84px;"[^>]*>([\s\S]*?)<\/h3>/) || [])[1];
const cards = JSON.parse(
  readFileSync(join(__dirname, '_extracted/asia-migration/asia-cards.json'), 'utf8')
);
console.log('\nFailed WP#24599');
console.log('  og:', og);
console.log('  h3:', h3);
console.log('  card:', cards['24599']);

writeFileSync(
  join(__dirname, '_extracted/asia-migration/verify.json'),
  JSON.stringify({ total: items.length, flagged: bad.map((p) => ({ id: p.id, title: p.title, image: p.image, subtitle: !!p.subtitle, body: p.body?.length, status: p.cms_status })) }, null, 2)
);
