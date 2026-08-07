const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(
  path.join(__dirname, '../public/website structure.txt'),
  'utf8'
);

const marks = [
  { id: 'home', i: 0 },
  { id: 'about', i: 170304 },
  { id: 'expertise-hub', i: 330421 },
  { id: 'expertise-stats', i: 375281 },
  { id: 'expertise-economic', i: 411140 },
  { id: 'expertise-governance', i: 450071 },
  { id: 'expertise-agriculture', i: 487796 },
  { id: 'expertise-sustainability', i: 523906 },
  { id: 'projects', i: 563209 },
  { id: 'news', i: 3129796 },
  { id: 'jobs', i: 3210156 },
  { id: 'download', i: 3244056 },
  { id: 'contact', i: 3277029 },
];

function stripTags(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|header|footer)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractMain(chunk) {
  const mainMatch =
    chunk.match(/<main[\s\S]*?<\/main>/i) ||
    chunk.match(/<div class="l-main[\s\S]*?<footer/i);
  let body = mainMatch ? mainMatch[0] : chunk;
  body = body.replace(/<header[\s\S]*?<\/header>/gi, ' ');
  body = body.replace(/<footer[\s\S]*?<\/footer>/gi, ' ');
  body = body.replace(/<nav[\s\S]*?<\/nav>/gi, ' ');
  return stripTags(body);
}

function extractImages(chunk) {
  const imgs = [];
  const re = /<img[^>]+src="([^"]+)"[^>]*/gi;
  let m;
  while ((m = re.exec(chunk)) !== null) {
    const src = m[1];
    if (src.includes('data:image') || src.includes('emoji') || src.includes('smile'))
      continue;
    const altMatch = m[0].match(/alt="([^"]*)"/);
    const name = src.split('/').pop().split('?')[0];
    imgs.push({ src, alt: altMatch ? altMatch[1] : '', file: name });
  }
  const bg = /url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi;
  while ((m = bg.exec(chunk)) !== null) {
    const src = m[2];
    if (src.includes('.woff') || src.includes('font') || src.includes('.css')) continue;
    const name = src.split('/').pop().split('?')[0];
    imgs.push({ src, alt: 'background', file: name });
  }
  const seen = new Set();
  return imgs.filter((i) => {
    if (seen.has(i.file)) return false;
    seen.add(i.file);
    return true;
  });
}

function extractLinks(chunk) {
  const links = [];
  const re = /href="(https:\/\/hp\.icon-institute\.de[^"#]*|\/[a-z0-9][^"#]*)"/gi;
  let m;
  const seen = new Set();
  while ((m = re.exec(chunk)) !== null) {
    let href = m[1].replace('https://hp.icon-institute.de', '');
    if (!href.startsWith('/')) href = '/' + href;
    if (seen.has(href)) continue;
    if (href.includes('wp-') || href.includes('/feed') || href.includes('xmlrpc'))
      continue;
    seen.add(href);
    links.push(href);
  }
  return links;
}

const outDir = path.join(__dirname, '_extracted');
fs.mkdirSync(outDir, { recursive: true });

const allImages = [];
for (let i = 0; i < marks.length; i++) {
  const start = marks[i].i;
  const end = i + 1 < marks.length ? marks[i + 1].i : html.length;
  const chunk = html.slice(start, end);
  const text = extractMain(chunk);
  const images = extractImages(chunk);
  const links = extractLinks(chunk);
  allImages.push(...images.map((img) => ({ ...img, page: marks[i].id })));

  fs.writeFileSync(`${outDir}/${marks[i].id}.txt`, text);
  fs.writeFileSync(
    `${outDir}/${marks[i].id}-meta.json`,
    JSON.stringify({ images, links }, null, 2)
  );
  console.log(
    marks[i].id,
    'chars:',
    text.length,
    'imgs:',
    images.length,
    'links:',
    links.length
  );
  console.log('--- preview ---');
  console.log(text.slice(0, 800).replace(/\n/g, ' | '));
  console.log('---------------\n');
}

const seen = new Set();
const unique = allImages.filter((i) => {
  if (seen.has(i.file)) return false;
  seen.add(i.file);
  return true;
});
fs.writeFileSync(`${outDir}/ALL_IMAGES.json`, JSON.stringify(unique, null, 2));
console.log('Total unique images:', unique.length);
