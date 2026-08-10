export type FooterLink = {
  label: string;
  href: string;
};

export type FooterData = {
  /** First line of the footer brand block. */
  name: string;
  /** Second line, under the name. */
  tagline: string;
  companyName: string;
  addressLines: string[];
  phone: string;
  fax: string;
  email: string;
  website: string;
  websiteUrl: string;
  backgroundImage: string;
  copyright: string;
  legalLinks: FooterLink[];
};

export const footer: FooterData = {
  name: 'ICON-INSTITUTE GmbH & Co. KG',
  tagline: 'Consulting Gruppe',
  companyName: 'ICON-INSTITUTE Consulting Gruppe',
  addressLines: ['Von-Groote-Straße 28', '50968 Köln', 'Germany'],
  phone: '+49 221 93 743 0',
  fax: '+49 221 93 743 5',
  email: 'icon@icon-institute.de',
  website: 'www.icon-institute.de',
  websiteUrl: 'https://www.icon-institute.de',
  backgroundImage: 'icon_institut_haus_6.jpg',
  copyright: '© 2026 ICON-INSTITUTE Consulting Gruppe',
  legalLinks: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Impressum', href: '/impressum' },
  ],
};
