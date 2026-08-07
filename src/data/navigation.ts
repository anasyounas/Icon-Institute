export type NavChild = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

export const mainNavigation: NavItem[] = [
  {
    label: 'HOME',
    href: '/',
  },
  {
    label: 'ABOUT US',
    href: '/about-us',
    children: [
      { label: 'What we do', href: '/about-us#what-we-do' },
      { label: 'Our Team', href: '/about-us#our-team' },
      { label: 'Company History', href: '/about-us#company-history' },
      { label: 'Corporate Values', href: '/about-us#corporate-values' },
      { label: 'Our Memberships', href: '/about-us#memberships' },
    ],
  },
  {
    label: 'EXPERTISE',
    href: '/expertise',
    children: [
      {
        label: 'Statistics, Evaluation and Social Research',
        href: '/expertise/statistics-evaluation-social-research',
      },
      {
        label: 'Economic and Employment Promotion',
        href: '/expertise/economic-employment-promotion',
      },
      {
        label: 'Governance, Education and Social Development',
        href: '/expertise/governance-education-social-development',
      },
      {
        label: 'Agriculture and Rural Development',
        href: '/expertise/agriculture-rural-development',
      },
      {
        label: 'Sustainability Management',
        href: '/expertise/sustainability-management',
      },
    ],
  },
  {
    label: 'PROJECTS',
    href: '/projects',
    children: [
      { label: 'Africa', href: '/projects/africa' },
      { label: 'Asia', href: '/projects/asia' },
      {
        label: 'Central America Caribbean',
        href: '/projects/central-america-caribbean',
      },
      { label: 'Europe', href: '/projects/europe' },
      { label: 'Middle East', href: '/projects/middle-east' },
      { label: 'South America', href: '/projects/south-america' },
    ],
  },
  {
    label: 'NEWS',
    href: '/news',
  },
  {
    label: 'JOBS',
    href: '/jobs',
  },
  {
    label: 'DOWNLOAD',
    href: '/download',
    children: [
      {
        label: 'Information Material',
        href: '/download/information-material',
      },
      { label: 'Videos', href: '/download/videos' },
    ],
  },
  {
    label: 'CONTACT US',
    href: '/contact',
  },
];
