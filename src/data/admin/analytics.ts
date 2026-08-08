import { newsItems } from '../news';
import { sampleProjects, projectFilters } from '../projects';
import { jobsPage } from '../jobs';
import { expertiseHubCards } from '../expertise';
import { mockMedia, mockWorkflow } from './mockData';

/**
 * Dashboard figures derived from the site's own content rather than invented
 * numbers, so the charts stay truthful as the CMS data changes.
 */

const regionLabel = Object.fromEntries(
  projectFilters.regions.map((r) => [r.value, r.label])
);

const expertiseLabel = Object.fromEntries(
  projectFilters.expertise.map((e) => [e.value, e.label])
);

function countBy<T>(items: T[], key: (item: T) => string) {
  const out = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    out.set(k, (out.get(k) ?? 0) + 1);
  }
  return out;
}

function toSortedBars(counts: Map<string, number>, label?: Record<string, string>) {
  return [...counts.entries()]
    .map(([k, value]) => ({ label: label?.[k] ?? k, value }))
    .sort((a, b) => b.value - a.value);
}

/** Projects per region, highest first. */
export const projectsByRegion = toSortedBars(
  countBy(sampleProjects, (p) => p.region),
  regionLabel
);

/** Projects per expertise area. */
export const projectsByExpertise = toSortedBars(
  countBy(sampleProjects, (p) => p.expertise),
  expertiseLabel
);

/** News articles per year, oldest first so the axis reads left to right. */
export const newsByYear = [
  ...countBy(newsItems, (n) => n.date.slice(0, 4)).entries(),
]
  .map(([label, value]) => ({ label, value }))
  .sort((a, b) => Number(a.label) - Number(b.label));

/** Projects running in each of the last eight years. */
export const projectsRunningByYear = (() => {
  const years = [...new Set(sampleProjects.flatMap((p) => [p.yearStart, p.yearEnd]))];
  if (years.length === 0) return [];
  const min = Math.min(...years);
  const max = Math.max(...years);
  const from = Math.max(min, max - 7);
  const out = [];
  for (let y = from; y <= max; y++) {
    out.push({
      label: String(y),
      value: sampleProjects.filter((p) => p.yearStart <= y && p.yearEnd >= y).length,
    });
  }
  return out;
})();

/** Approval queue split by stage — the one place series identity is the point. */
export const workflowByStage = (() => {
  const counts = countBy(mockWorkflow, (w) => w.stage);
  const order = ['Draft', 'In review', 'Approved'];
  return order.map((label) => ({ label, value: counts.get(label) ?? 0 }));
})();

/** Headline counts for the KPI row. */
export const contentTotals = {
  news: newsItems.length,
  projects: sampleProjects.length,
  jobs: jobsPage.listings.length,
  openJobs: jobsPage.listings.filter((j) => j.status === 'open').length,
  media: mockMedia.length,
  expertise: expertiseHubCards.length,
  regions: projectsByRegion.length,
};

/** Trailing shape for the stat-tile sparklines. */
export const newsTrend = newsByYear.map((n) => n.value);
export const projectsTrend = projectsRunningByYear.map((p) => p.value);
