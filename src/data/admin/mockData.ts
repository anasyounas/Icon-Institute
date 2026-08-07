export const mockAuditLog = [
  {
    id: 'a1',
    time: '2026-08-07 14:22',
    user: 'admin@icon-institute.de',
    action: 'Published static site build #184',
  },
  {
    id: 'a2',
    time: '2026-08-07 13:05',
    user: 'editor@icon-institute.de',
    action: 'Updated news draft “IPA 2022 highlights”',
  },
  {
    id: 'a3',
    time: '2026-08-06 17:40',
    user: 'publisher@icon-institute.de',
    action: 'Approved job listing “Project Manager”',
  },
  {
    id: 'a4',
    time: '2026-08-06 11:12',
    user: 'admin@icon-institute.de',
    action: 'Added project “ESG reporting – Brazil”',
  },
  {
    id: 'a5',
    time: '2026-08-05 09:30',
    user: 'admin@icon-institute.de',
    action: 'Changed contact phone number',
  },
];

export const mockVersions = [
  {
    id: 'v184',
    label: 'Build #184 — live',
    created: '2026-08-07 14:22',
    author: 'admin@icon-institute.de',
    status: 'published',
  },
  {
    id: 'v183',
    label: 'Build #183',
    created: '2026-08-05 16:01',
    author: 'publisher@icon-institute.de',
    status: 'archived',
  },
  {
    id: 'v182',
    label: 'Build #182',
    created: '2026-08-01 10:18',
    author: 'admin@icon-institute.de',
    status: 'archived',
  },
];

export const mockMedia = [
  { id: 'm1', name: 'logo_icon.jpg', type: 'image', size: '48 KB', alt: 'ICON-INSTITUTE logo' },
  { id: 'm2', name: 'icon_projects.jpg', type: 'image', size: '420 KB', alt: 'Projects worldwide' },
  { id: 'm3', name: 'brochure-2025.pdf', type: 'document', size: '2.1 MB', alt: '' },
  { id: 'm4', name: 'company-video-poster.jpg', type: 'image', size: '310 KB', alt: 'Company video poster' },
];

export const mockWorkflow = [
  {
    id: 'w1',
    title: 'News: IPA 2022 July update',
    stage: 'In review',
    assignee: 'publisher@icon-institute.de',
  },
  {
    id: 'w2',
    title: 'Project: Climate adaptation Kenya',
    stage: 'Draft',
    assignee: 'editor@icon-institute.de',
  },
  {
    id: 'w3',
    title: 'Job: M&E Specialist',
    stage: 'Approved',
    assignee: 'admin@icon-institute.de',
  },
];

export const mockSchedule = [
  {
    id: 's1',
    title: 'News: Autumn newsletter',
    publishAt: '2026-09-01 09:00',
    status: 'scheduled',
  },
  {
    id: 's2',
    title: 'Job: Project Manager (archive)',
    publishAt: '2026-09-30 23:59',
    status: 'scheduled archive',
  },
];

export const mockBackups = [
  { id: 'b1', label: 'Full CMS + media', time: '2026-08-07 02:00', size: '1.2 GB' },
  { id: 'b2', label: 'Configuration only', time: '2026-08-07 02:05', size: '4 MB' },
  { id: 'b3', label: 'Full CMS + media', time: '2026-08-06 02:00', size: '1.2 GB' },
];
