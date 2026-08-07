const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(
  path.join(__dirname, '../src/data/images.ts'),
  'utf8'
);
const entries = [];
const re =
  /\{\s*path:\s*'([^']+)',\s*description:\s*'((?:\\'|[^'])*)',\s*usedOn:\s*\[([^\]]+)\]/g;
let m;
while ((m = re.exec(src)) !== null) {
  entries.push({
    path: m[1],
    description: m[2].replace(/\\'/g, "'"),
    usedOn: m[3]
      .split(',')
      .map((s) => s.trim().replace(/['"]/g, ''))
      .filter(Boolean),
  });
}

function filename(p) {
  return p.replace(/^images\//, '');
}

const rows = entries.map((i) => {
  return (
    '| `' +
    filename(i.path) +
    '` | ' +
    i.description +
    ' | ' +
    i.usedOn.join(', ') +
    ' |'
  );
});

const lines = [
  '# Image checklist',
  '',
  'Place files in `public/images/` using these **exact** filenames. Until then, the UI shows labeled gray placeholders.',
  '',
  'Original assets live under https://hp.icon-institute.de/wp-content/uploads/ — download matching filenames from there.',
  '',
  '| Filename | Description | Used on |',
  '|---|---|---|',
  ...rows,
  '',
  '## PDF downloads',
  '',
  'Place in `public/downloads/`:',
  '',
  '- `50th-anniversary-brochure.pdf`',
  '- `agriculture-and-rural-development.pdf`',
  '- `economic-development.pdf`',
  '- `education-and-training.pdf`',
  '- `financial-sector-development.pdf`',
  '- `good-governance.pdf`',
  '- `statistics-social-research-and-evaluation.pdf`',
  '',
  'Total image placeholders: **' + entries.length + '**',
  '',
];

fs.mkdirSync(path.join(__dirname, '../public/images'), { recursive: true });
fs.mkdirSync(path.join(__dirname, '../public/downloads'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../public/images/.gitkeep'), '');
fs.writeFileSync(path.join(__dirname, '../public/downloads/.gitkeep'), '');
fs.writeFileSync(
  path.join(__dirname, '../public/IMAGE_CHECKLIST.md'),
  lines.join('\n')
);
console.log('Wrote checklist with', entries.length, 'images');
