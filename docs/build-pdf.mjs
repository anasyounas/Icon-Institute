/**
 * Renders the client documents to PDF with headless Chromium.
 *
 *   node docs/build-pdf.mjs
 *
 * Reads and writes alongside itself, so it works from anywhere. Each source
 * page carries its own print stylesheet, so this only supplies the paper size
 * and lets the document decide its own margins and page breaks.
 */

import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const DOCUMENTS = [
  {
    html: 'security-review-response.html',
    pdf: 'ICON-INSTITUTE_Security_Review_Response.pdf',
    title: 'Security Review Response',
  },
  {
    html: 'progress-report.html',
    pdf: 'ICON-INSTITUTE_Progress_Report.pdf',
    title: 'Progress Report',
  },
];

const browser = await chromium.launch();
// Force the light palette: these are printed documents, and the dark theme
// would otherwise be picked up from the machine's OS setting.
const context = await browser.newContext({ colorScheme: 'light' });
const page = await context.newPage();

for (const doc of DOCUMENTS) {
  const source = pathToFileURL(path.join(HERE, doc.html)).href;
  await page.goto(source, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });

  const target = path.join(HERE, doc.pdf);
  await page.pdf({
    path: target,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width:100%;padding:0 14mm;font-family:Segoe UI,Arial,sans-serif;
                  font-size:7.5pt;color:#7B756B;display:flex;
                  justify-content:space-between;">
        <span>ICON-INSTITUTE · ${doc.title}</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`,
  });

  console.log(`  ${doc.pdf}`);
}

await browser.close();
console.log(`\nWritten to ${HERE}\n`);
