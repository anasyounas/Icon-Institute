export type PageSeo = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
};

const siteName = 'ICON-INSTITUTE GmbH & Co. KG Consulting Gruppe';
const defaultImage = '/images/logo_icon.jpg';

export const siteSeo = {
  siteName,
  siteUrl: 'https://www.icon-institute.de',
  defaultImage,
  locale: 'en_GB',
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: 'https://www.icon-institute.de',
    logo: 'https://www.icon-institute.de/images/logo_icon.jpg',
    email: 'icon@icon-institute.de',
    telephone: '+49-221-93743-0',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Von-Groote-Straße 28',
      addressLocality: 'Köln',
      postalCode: '50968',
      addressCountry: 'DE',
    },
  },
};

export const pageSeo: Record<string, PageSeo> = {
  home: {
    title: `${siteName} — concepts. consulting. training.`,
    description:
      'ICON-INSTITUTE Consulting Group — international development cooperation since 1975. Concepts, consulting and training worldwide.',
    path: '/',
  },
  about: {
    title: `About Us | ${siteName}`,
    description:
      'Learn what ICON-INSTITUTE does, meet our team, explore our history, corporate values and memberships.',
    path: '/about-us',
  },
  expertise: {
    title: `Expertise | ${siteName}`,
    description:
      'ICON expertise areas: statistics & evaluation, economic & employment promotion, governance & education, agriculture, and sustainability management.',
    path: '/expertise',
  },
  projects: {
    title: `Projects Worldwide | ${siteName}`,
    description:
      'Search and filter ICON projects by region, running period, expertise area and volume. Client-side project catalogue.',
    path: '/projects',
  },
  news: {
    title: `News | ${siteName}`,
    description:
      'Company news, articles and announcements from ICON-INSTITUTE Consulting Group.',
    path: '/news',
  },
  jobs: {
    title: `Jobs | ${siteName}`,
    description:
      'Current job offers at ICON-INSTITUTE — permanent positions and short-term expert assignments. Apply online.',
    path: '/jobs',
  },
  download: {
    title: `Download | ${siteName}`,
    description:
      'Download ICON-INSTITUTE information material and videos.',
    path: '/download',
  },
  contact: {
    title: `Contact Us | ${siteName}`,
    description:
      'Contact ICON-INSTITUTE in Cologne — address, phone, fax and email.',
    path: '/contact',
  },
  privacy: {
    title: `Privacy Policy | ${siteName}`,
    description: 'Privacy policy of ICON-INSTITUTE Consulting Group.',
    path: '/privacy-policy',
  },
  impressum: {
    title: `Impressum | ${siteName}`,
    description: 'Legal notice (Impressum) for ICON-INSTITUTE Consulting Group.',
    path: '/impressum',
  },
};
