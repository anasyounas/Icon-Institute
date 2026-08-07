export type ContactPage = {
  title: string;
  intro: string;
  howToReach: string;
  company: {
    name: string;
    addressLines: string[];
    phone: string;
    fax: string;
    email: string;
    website: string;
    websiteUrl: string;
  };
  departments: { label: string; email: string }[];
};

export const contactPage: ContactPage = {
  title: 'Contact Us',
  intro:
    'Get in touch with ICON-INSTITUTE. Our Cologne headquarters is available by phone, fax or email during business hours.',
  howToReach:
    'For project enquiries, partnerships and general information please use the contact details below. Job applications should be sent to the careers address listed on our Jobs page.',
  company: {
    name: 'ICON-INSTITUTE GmbH & Co. KG Consulting Gruppe',
    addressLines: ['Von-Groote-Straße 28', '50968 Köln', 'Germany'],
    phone: '+49 221 93 743 0',
    fax: '+49 221 93 743 5',
    email: 'icon@icon-institute.de',
    website: 'www.icon-institute.de',
    websiteUrl: 'https://www.icon-institute.de',
  },
  departments: [
    {
      label: 'General enquiries',
      email: 'icon@icon-institute.de',
    },
    {
      label: 'Applications & CVs',
      email: 'cv-icon@icon-institute.de',
    },
  ],
};
