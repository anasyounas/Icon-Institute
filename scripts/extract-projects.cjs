const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(
  path.join(__dirname, '../public/website structure.txt'),
  'utf8'
);

const projectsHtml = html.slice(563209, 3129796);
const newsHtml = html.slice(3129796, 3210156);

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .trim();
}

function extractTitles(chunk, limit = 500) {
  const titles = [];
  const re = /class="[^"]*post_title[^"]*"[^>]*>([^<]+)</gi;
  let m;
  while ((m = re.exec(chunk)) !== null && titles.length < limit) {
    const t = decode(m[1]);
    if (t && t.length > 3) titles.push(t);
  }
  return [...new Set(titles)];
}

// Project cards often have data attributes or structure with country/period
function extractProjectArticles(chunk) {
  const projects = [];
  // Look for article.projects or grid items linking to projects
  const re =
    /<article[^>]*class="[^"]*projects[^"]*"[^>]*>[\s\S]*?<\/article>/gi;
  let m;
  while ((m = re.exec(chunk)) !== null) {
    const block = m[0];
    const title =
      (block.match(/class="[^"]*post_title[^"]*"[^>]*>([^<]+)/i) || [])[1] ||
      '';
    const href =
      (block.match(/href="(https:\/\/hp\.icon-institute\.de\/[^"]+|\/[^"]+)"/i) ||
        [])[1] || '';
    const img =
      (block.match(/src="(https:\/\/hp\.icon-institute\.de\/wp-content\/uploads\/[^"]+)"/i) ||
        [])[1] || '';
    if (title) {
      projects.push({
        title: decode(title),
        href: href.replace('https://hp.icon-institute.de', ''),
        image: img ? img.split('/').pop() : null,
      });
    }
  }
  return projects;
}

// Also try bu-item style project listings from the interactive map
function extractBuItems(chunk) {
  const items = [];
  const re = /<bu-item[\s\S]*?<\/bu-item>/gi;
  let m;
  while ((m = re.exec(chunk)) !== null) {
    const block = m[0];
    const title =
      (block.match(/<bu-title[^>]*>([^<]+)/i) ||
        block.match(/alt="([^"]+)"/i) ||
        [])[1] || '';
    const country =
      (block.match(/<bu-country[^>]*>([^<]+)/i) || [])[1] || '';
    const period =
      (block.match(/<bu-period[^>]*>([^<]+)/i) || [])[1] || '';
    const expertise =
      (block.match(/<bu-expertise[^>]*>([^<]+)/i) || [])[1] || '';
    if (title) {
      items.push({
        title: decode(title),
        country: decode(country),
        period: decode(period),
        expertise: decode(expertise),
      });
    }
  }
  return items;
}

// JSON data embedded for map
function extractMapData(chunk) {
  const match = chunk.match(/var\s+projects\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

const articles = extractProjectArticles(projectsHtml);
const buItems = extractBuItems(projectsHtml);
const titles = extractTitles(projectsHtml, 200);
const mapData = extractMapData(projectsHtml);

console.log('articles', articles.length);
console.log('buItems', buItems.length);
console.log('titles', titles.length);
console.log('mapData', mapData ? mapData.length : null);
console.log('sample titles', titles.slice(0, 15));
console.log('sample articles', articles.slice(0, 5));
console.log('sample bu', buItems.slice(0, 5));

// News
const newsTitles = extractTitles(newsHtml, 100);
console.log('\nnews', newsTitles.length);
newsTitles.forEach((t) => console.log('-', t));

// Find news with dates
const newsItems = [];
const newsRe =
  /<article[\s\S]*?class="[^"]*post_title[^"]*"[^>]*>([^<]+)[\s\S]*?(?:datetime="([^"]+)"|>(\d{1,2}\.\s*\w+\s*\d{4}))/gi;
let nm;
while ((nm = newsRe.exec(newsHtml)) !== null && newsItems.length < 80) {
  newsItems.push({
    title: decode(nm[1]),
    date: nm[2] || nm[3] || '',
  });
}
console.log('newsItems', newsItems.length, newsItems.slice(0, 10));

const out = path.join(__dirname, '_extracted');
fs.writeFileSync(
  path.join(out, 'projects-data.json'),
  JSON.stringify(
    { articles, buItems, titles, mapData: mapData ? mapData.slice(0, 5) : null },
    null,
    2
  )
);
fs.writeFileSync(
  path.join(out, 'news-data.json'),
  JSON.stringify({ newsTitles, newsItems }, null, 2)
);

// Also dump a portion of projects HTML structure clues
const clue = projectsHtml.slice(0, 50000);
const classNames = [...clue.matchAll(/class="([^"]{0,80})"/g)].map((x) => x[1]);
const uniqueClasses = [...new Set(classNames)].filter(
  (c) => /project|grid|post|bu-|card/i.test(c)
);
console.log('\nrelevant classes', uniqueClasses.slice(0, 40));
