export type AdminNavItem = {
  label: string;
  href: string;
  group: 'main' | 'content' | 'system';
};

export const adminNav: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', group: 'main' },
  { label: 'Content & Media', href: '/admin/content', group: 'content' },
  { label: 'News Manager', href: '/admin/news', group: 'content' },
  { label: 'Jobs Manager', href: '/admin/jobs', group: 'content' },
  { label: 'Projects Manager', href: '/admin/projects', group: 'content' },
  { label: 'Contact Information', href: '/admin/contact', group: 'content' },
  { label: 'Media Library', href: '/admin/media', group: 'content' },
  { label: 'SEO Metadata', href: '/admin/seo', group: 'content' },
  { label: 'Draft & Preview', href: '/admin/drafts', group: 'system' },
  { label: 'Approval Workflow', href: '/admin/workflow', group: 'system' },
  { label: 'Version History', href: '/admin/versions', group: 'system' },
  { label: 'Scheduled Publishing', href: '/admin/schedule', group: 'system' },
  { label: 'Publish & Rollback', href: '/admin/publish', group: 'system' },
  { label: 'Users & Roles', href: '/admin/users', group: 'system' },
  { label: 'Security & 2FA', href: '/admin/security', group: 'system' },
  { label: 'Audit Log', href: '/admin/audit', group: 'system' },
  { label: 'Backups', href: '/admin/backups', group: 'system' },
];
