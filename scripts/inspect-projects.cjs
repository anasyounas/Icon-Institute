const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../public/website structure.txt'), 'utf8');
const projects = html.slice(563209, Math.min(563209 + 200000, 3129796));

// Find interesting patterns
const patterns = [
  'country2region',
  'var projects',
  'project_list',
  'ref_project',
  'w-grid',
  'data-id',
  'itm-title',
  'bu-',
  'post-title',
  'entry-title',
  'Africa',
  'projects-africa',
];

for (const p of patterns) {
  const i = projects.indexOf(p);
  console.log(p, i);
  if (i >= 0) console.log('  context:', JSON.stringify(projects.slice(i, i + 200)).slice(0, 180));
}

// Write first 30k of projects body for inspection
const bodyStart = projects.indexOf('<main') >= 0 ? projects.indexOf('<main') : projects.indexOf('l-main');
fs.writeFileSync(path.join(__dirname, '_extracted/projects-snippet.html'), projects.slice(bodyStart, bodyStart + 40000));
console.log('\nbodyStart', bodyStart, 'snippet written');

// Check if project data is in JSON elsewhere in the big chunk
const big = html.slice(563209, 3129796);
const jsonMatches = [...big.matchAll(/var\s+(\w+)\s*=\s*(\{[\s\S]{0,200}|[[\s\S]{0,200})/g)].slice(0, 30);
console.log('\nvars:', jsonMatches.map(m => m[1] + ' = ' + m[2].slice(0, 60).replace(/\s+/g,' ')));

// Count project detail page markers
const markers = [...big.matchAll(/<\/body>[^<]{0,5}[^:]{0,80}:/g)].map(m => m[0].replace(/\s+/g,' ').slice(0,100));
console.log('\nmarkers count', markers.length);
console.log(markers.slice(0, 40));
