const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../public/website structure.txt'), 'utf8');
const big = html.slice(563209, 3129796);

// Search for project titles patterns in various forms
const patterns = [
  /class="itm-title"[^>]*>([^<]+)/gi,
  /class="project-title"[^>]*>([^<]+)/gi,
  /"title"\s*:\s*"([^"]{10,120})"/g,
  /data-title="([^"]+)"/gi,
  /<h2[^>]*class="[^"]*post_title[^"]*"[^>]*>([^<]+)/gi,
  /<h3[^>]*>([^<]{20,150})<\/h3>/gi,
];

for (const re of patterns) {
  const results = [];
  let m;
  while ((m = re.exec(big)) !== null && results.length < 5) results.push(m[1]);
  console.log(re.source.slice(0, 40), '->', results.length, results.slice(0, 3));
}

// Look for region page sections
const regionMarkers = ['projects-africa', 'projects-asia', 'projects-europe', 'projects-middle', 'projects-south', 'projects-central', 'Central America'];
for (const r of regionMarkers) {
  let count = 0, idx = 0;
  while ((idx = big.indexOf(r, idx)) !== -1) { count++; idx += r.length; }
  console.log(r, 'count in projects chunk:', count);
}

// Size breakdown - is it mostly one huge script?
const scriptLens = [...big.matchAll(/<script[\s\S]*?<\/script>/gi)].map(s => s[0].length);
console.log('scripts', scriptLens.length, 'total script bytes', scriptLens.reduce((a,b)=>a+b,0), 'chunk size', big.length);
console.log('largest scripts', scriptLens.sort((a,b)=>b-a).slice(0,5));

// Check for img alt texts that might be project names
const alts = [];
const altRe = /alt="([^"]{15,120})"/gi;
let am;
while ((am = altRe.exec(big)) !== null && alts.length < 40) {
  if (!/icon|logo|Image|flag/i.test(am[1])) alts.push(am[1]);
}
console.log('alts', [...new Set(alts)].slice(0, 20));
