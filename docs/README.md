# Client documents

Documents prepared for ICON-INSTITUTE and their website host. They continue the
identity of the Technical Documentation and Technical Review Response delivered
in July 2026 — charcoal cover, gold eyebrow, burgundy numbered section bars.

| Document | Covers |
| --- | --- |
| `ICON-INSTITUTE_Security_Review_Response.pdf` | Answers to the host's questions on architecture, CMS security and file uploads |
| `ICON-INSTITUTE_Progress_Report.pdf` | What is built, what is under way, and what is needed from the client |

**These are confidential.** They live here rather than in `public/` on purpose:
`public/` is copied verbatim into the built site, so anything placed there is
downloadable by anyone who guesses the filename. Nothing in `docs/` reaches the
build.

## Editing and regenerating

Each PDF is rendered from the `.html` file beside it, which carries its own
print stylesheet (A4 margins, page breaks that keep a question with its answer
and never split a table). Edit the HTML, then from the project root:

```bash
npm install --no-save playwright   # once; --no-save keeps it out of package.json
npx playwright install chromium    # once; downloads the browser
node docs/build-pdf.mjs
```

Playwright is deliberately not a project dependency — it is only needed to
regenerate these documents, and adding it would make every install pull a
browser nobody else needs.

The script reads and writes alongside itself, so it runs from any directory,
and forces the light palette regardless of the machine's theme so the output is
identical everywhere.

Figures in the documents were taken from the running system rather than from
notes. If you regenerate after the system has moved on, re-check the counts —
endpoint totals, content counts and dependency versions all appear in the text.
