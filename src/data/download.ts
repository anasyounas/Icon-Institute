export type DownloadMaterial = {
  title: string;
  file?: string;
  description?: string;
};

export type DownloadPage = {
  title: string;
  informationMaterial: {
    title: string;
    intro: string;
    materials: DownloadMaterial[];
  };
  videos: {
    title: string;
    intro: string;
    status: string;
  };
};

export const downloadPage: DownloadPage = {
  title: 'Download',
  informationMaterial: {
    title: 'Information Material',
    intro:
      'Please click below to download our Brochures and Flyers on our Expertise.',
    materials: [
      {
        title: '50th Anniversary Brochure',
        file: '50th-anniversary-brochure.pdf',
        description: 'Celebrating 50 years of ICON-INSTITUTE expertise in international cooperation.',
      },
      {
        title: 'Agriculture and Rural Development',
        file: 'agriculture-and-rural-development.pdf',
      },
      {
        title: 'Economic Development',
        file: 'economic-development.pdf',
      },
      {
        title: 'Education and Training',
        file: 'education-and-training.pdf',
      },
      {
        title: 'Financial Sector Development',
        file: 'financial-sector-development.pdf',
      },
      {
        title: 'Good Governance',
        file: 'good-governance.pdf',
      },
      {
        title: 'Statistics, Social Research and Evaluation',
        file: 'statistics-social-research-and-evaluation.pdf',
      },
    ],
  },
  videos: {
    title: 'Videos',
    intro:
      'In the following we provide some videos concerning projects we have carried out. Do have a look!',
    status: 'Under Construction',
  },
};
