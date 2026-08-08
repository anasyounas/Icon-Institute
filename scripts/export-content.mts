/**
 * Exports the site's bundled content data to JSON so the backend seed script
 * can migrate it into the CMS database — the "content migration" step of the
 * agreement, run from the real source of truth.
 *
 *    npx -y tsx scripts/export-content.mts
 *
 * Output: ../Backend/seed_data/*.json
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { newsItems } from '../src/data/news';
import { jobsPage } from '../src/data/jobs';
import { sampleProjects, projectsPage } from '../src/data/projects';
import { contactPage } from '../src/data/contact';
import { pageSeo, siteSeo } from '../src/data/seo';
import { homePage } from '../src/data/home';
import { aboutPage } from '../src/data/about';
import { downloadPage } from '../src/data/download';
import { expertiseHubCards, expertiseAreas } from '../src/data/expertise';
import { footer } from '../src/data/footer';
import { IMAGE_MANIFEST } from '../src/data/images';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', '..', 'Backend', 'seed_data');
mkdirSync(outDir, { recursive: true });

function write(name: string, data: unknown) {
  writeFileSync(join(outDir, name), JSON.stringify(data, null, 2), 'utf8');
  console.log(`  wrote ${name}`);
}

write('news.json', newsItems);
write('jobs.json', jobsPage);
write('projects.json', { projectsPage, sampleProjects });
write('contact.json', contactPage);
write('seo.json', { siteSeo, pageSeo });
write('home.json', homePage);
write('about.json', aboutPage);
write('download.json', downloadPage);
write('expertise.json', { expertiseHubCards, expertiseAreas });
write('footer.json', footer);
write('images.json', IMAGE_MANIFEST);

console.log('Export complete.');
