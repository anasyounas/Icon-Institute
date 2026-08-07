export type ImageManifestEntry = {
  path: string;
  description: string;
  usedOn: string[];
};

/**
 * Manifest of placeholder / site images under public/images/.
 * Filenames match assets referenced across the data modules.
 */
export const IMAGE_MANIFEST: ImageManifestEntry[] = [
  // Branding
  {
    path: 'images/logo_icon.jpg',
    description: 'ICON-INSTITUTE logo',
    usedOn: ['header', 'footer', 'all'],
  },

  // Home hero
  {
    path: 'images/Ttl_Group1.jpg',
    description: 'Home hero slide – consulting',
    usedOn: ['home'],
  },
  {
    path: 'images/6608100.jpg',
    description: 'Home hero slide – concepts',
    usedOn: ['home'],
  },
  {
    path: 'images/ESG_Group.jpg',
    description: 'Home hero slide – training / ESG',
    usedOn: ['home'],
  },

  // Home quick links & projects
  {
    path: 'images/icon_institut_haus.jpg',
    description: 'ICON headquarters building – About Us quick link',
    usedOn: ['home', 'about'],
  },
  {
    path: 'images/icon_institute_jobs.jpg',
    description: 'Jobs promotional image',
    usedOn: ['home', 'jobs'],
  },
  {
    path: 'images/icon_institut_haus_3.jpg',
    description: 'Building exterior – Download quick link',
    usedOn: ['home', 'download'],
  },
  {
    path: 'images/icon_projects.jpg',
    description: 'Projects Worldwide teaser map/image',
    usedOn: ['home', 'projects'],
  },
  {
    path: 'images/icon_institut_haus_6.jpg',
    description: 'Footer parallax background – headquarters',
    usedOn: ['footer'],
  },

  // Expertise cards / heroes
  {
    path: 'images/statistics-evaluation-and-social-research-1.png',
    description: 'Statistics, Evaluation and Social Research card',
    usedOn: ['home', 'expertise'],
  },
  {
    path: 'images/economic-and-employment-promotion.png',
    description: 'Economic and Employment Promotion card',
    usedOn: ['home', 'expertise'],
  },
  {
    path: 'images/governance-public-administration.jpg',
    description: 'Governance, Education and Social Development card',
    usedOn: ['home', 'expertise'],
  },
  {
    path: 'images/infrastructure-and-rural-development.jpg',
    description: 'Agriculture and Rural Development card',
    usedOn: ['home', 'expertise'],
  },
  {
    path: 'images/Sustainable-supply-chains-1.png',
    description: 'Sustainability Management card',
    usedOn: ['home', 'expertise'],
  },
  {
    path: 'images/Sustainable-supply-chains-2.png',
    description: 'Sustainability Management alternate card image',
    usedOn: ['home'],
  },
  {
    path: 'images/icon-institute_7-1024x683-1.jpg',
    description: 'Statistics expertise hero background',
    usedOn: ['expertise'],
  },
  {
    path: 'images/icon-institute_5.jpg',
    description: 'Economic expertise hero background',
    usedOn: ['expertise'],
  },
  {
    path: 'images/icon-institute-22.jpg',
    description: 'Governance expertise hero background',
    usedOn: ['expertise'],
  },
  {
    path: 'images/Agriculture-Sector.jpg',
    description: 'Agriculture expertise hero background',
    usedOn: ['expertise'],
  },
  {
    path: 'images/iStock-1333864874.png',
    description: 'Sustainability expertise hero background',
    usedOn: ['expertise'],
  },

  // About
  {
    path: 'images/icon-institute-services.jpg',
    description: 'About Us – What we do hero',
    usedOn: ['about'],
  },
  {
    path: 'images/icon-institute_9-600x600.jpg',
    description: 'About Us – Our Team image',
    usedOn: ['about'],
  },
  {
    path: 'images/icon_timeline_1975.png',
    description: 'Company history timeline marker 1975',
    usedOn: ['about'],
  },
  {
    path: 'images/icon_timeline_1987.png',
    description: 'Company history timeline marker 1987',
    usedOn: ['about'],
  },
  {
    path: 'images/icon_timeline_1996.png',
    description: 'Company history timeline marker 1996',
    usedOn: ['about'],
  },
  {
    path: 'images/icon_timeline_2012.png',
    description: 'Company history timeline marker 2012',
    usedOn: ['about'],
  },
  {
    path: 'images/icon_timeline_2017.png',
    description: 'Company history timeline marker (later years)',
    usedOn: ['about'],
  },
  {
    path: 'images/icon_corporate_social_responsibility.jpg',
    description: 'Corporate Social Responsibility value tile',
    usedOn: ['about'],
  },
  {
    path: 'images/icon_integrity_agreement.jpg',
    description: 'Integrity Agreement value tile',
    usedOn: ['about'],
  },
  {
    path: 'images/icon_din_en_iso_9001_2015.jpg',
    description: 'DIN EN ISO 9001:2015 certification tile',
    usedOn: ['about'],
  },
  {
    path: 'images/logo1.jpg',
    description: 'Membership logo – VBI',
    usedOn: ['about'],
  },
  {
    path: 'images/logo3.jpg',
    description: 'Membership logo – iMOVE',
    usedOn: ['about'],
  },
  {
    path: 'images/logo.jpg',
    description: 'Membership logo – European Microfinance Platform',
    usedOn: ['about'],
  },
  {
    path: 'images/logo4-1.jpg',
    description: 'Membership logo – Eine-Welt Stadt Köln',
    usedOn: ['about'],
  },
  {
    path: 'images/degeval.jpg',
    description: 'Membership logo – DeGEval',
    usedOn: ['about'],
  },

  // Projects filter icons
  {
    path: 'images/icon_country_free.png',
    description: 'Projects filter icon – country/region',
    usedOn: ['projects'],
  },
  {
    path: 'images/icon_period.png',
    description: 'Projects filter icon – period/years',
    usedOn: ['projects'],
  },
  {
    path: 'images/icon_area.png',
    description: 'Projects filter icon – expertise area',
    usedOn: ['projects'],
  },
  {
    path: 'images/icon_volume.png',
    description: 'Projects filter icon – project volume',
    usedOn: ['projects'],
  },

  // News
  {
    path: 'images/news-placeholder.jpg',
    description: 'Generic news article placeholder image',
    usedOn: ['news', 'home'],
  },
  {
    path: 'images/icon-institute_21.jpg',
    description: 'News listing page background',
    usedOn: ['news'],
  },
  {
    path: 'images/ipa2022bckgr-600x600.jpg',
    description: 'IPA 2022 news/teaser background',
    usedOn: ['home', 'news'],
  },
];
