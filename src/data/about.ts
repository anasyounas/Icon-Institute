export type AboutHistoryEntry = {
  year: string;
  text: string;
};

export type AboutValue = {
  title: string;
  description: string;
  image: string;
};

export type AboutMembershipDetail = {
  name: string;
  description: string;
  logo?: string;
};

export type AboutMemberships = {
  list: string[];
  details: AboutMembershipDetail[];
};

export type AboutPage = {
  whatWeDo: string[];
  ourTeam: string[];
  history: AboutHistoryEntry[];
  values: AboutValue[];
  memberships: AboutMemberships;
  heroImage: string;
  teamImage: string;
};

export const aboutPage: AboutPage = {
  heroImage: 'icon-institute-services.jpg',
  teamImage: 'icon-institute_9-600x600.jpg',
  whatWeDo: [
    'ICON-INSTITUTE Consulting Group is a private company designing, managing and implementing international projects in development cooperation. During 50 years of experience, we have established ourselves as a recognised actor in the development and cooperation sector. We support our partners and clients with expertise, knowledge and capacities to meet their development objectives and ensure long lasting and sustainable results. We have developed solid cooperation and working relations with international and national development organisations such as the United Nations (UNFPA, UNDP, UNESCO, ILO, etc.), the European Union, the World Bank and other international development banks, bilateral development agencies such as GIZ, KfW, AFD, Enabel, DFID, SIDA, as well as national and local governmental institutions and civil society organisations.',
    'Our expertise covers the full project life cycle, from feasibility studies, formative evaluations and concept development to design, planning, implementation, monitoring and evaluation of development interventions.',
    'We support the 2030 Development Agenda and Sustainable Development Goals. This enables us to further integrate our thematic and technical expertise and align our interventions to the SDG targets. The good development practices that we have implemented through the years can be broadly disseminated.',
    'We value interdisciplinary and integrated approaches through our core services: capacity development and training, technical assistance, consultancy and research. We believe that these services are complementary and provide the intended impact for development, seeking to bring effective and sustainable change at individual, organisational and environmental levels.',
    'Our solutions ensure that the interventions of our partners and clients are relevant. We also firmly believe that context matters, and we therefore seek to adapt our approach and concepts to the context in which we are to operate and try to adhere to the fundamental principles of human rights, do no harm and leave no-one behind that are embedded in the 2030 Development Agenda.',
  ],
  ourTeam: [
    'Our team consists of almost 50 staff members at the head office in Cologne (Germany), as well as over 600 international and national consultants.',
    'Our permanent staff perfectly mirrors our worldwide involvement as it is international, multilingual and multicultural with close to 20 nationalities from all continents. Over 10 spoken languages allow us to operate in a vast array of countries, context and language settings.',
    'We are proud of the diversity of technical background of our staff covering fields from social, political and economics sciences, to management and administrative expertise. We seek to develop the capacities of our staff through involvement in development projects and research activities and methodological training. The teams present a balanced composition of senior and junior project managers, technical inhouse experts (such as trainers, evaluators, statisticians, labour market or economic experts), and support staff providing the required experience to reach the client’s objectives. ICON carries out a dual vocational training programme in partnership with the German employment services to train and develop young professionals as project and administrative assistants.',
  ],
  history: [
    {
      year: '1975',
      text: 'ICON-INSTITUT Gesellschaft für angewandte Sozialforschung, Beratung, Planung und Entwicklung mbH is founded in Köln (Cologne).',
    },
    {
      year: '1987',
      text: 'GET German Education and Training GmbH is founded in Köln.',
    },
    {
      year: '1996',
      text: 'ICON-INSTITUT Gesellschaft für Berufliche Bildung und Training mbH is founded in Aachen.',
    },
    {
      year: '1998',
      text: 'ARCOTRASS GmbH (founded 1987) joins the ICON Group and moves from Frankfurt to Köln.',
    },
    {
      year: '2000',
      text: 'ICON-INSTITUTE GmbH & Co. KG Consulting Gruppe is founded in Köln.',
    },
    {
      year: '2001',
      text: 'ICON-INSTITUT Public Sector GmbH and ICON-INSTITUT Informationssysteme GmbH are founded in Köln.',
    },
    {
      year: '2006',
      text: 'ICON-INSTITUT Consultores srl is founded in Santiago de Chile.',
    },
    {
      year: '2007',
      text: 'ASA Institut für Sektoranalyse und Politikberatung (founded 1987) joins the ICON Group and moves from Rheinbach to Köln.',
    },
    {
      year: '2009',
      text: 'ARCOTRASS is renamed ICON-INSTITUT Engineering GmbH.',
    },
    {
      year: '2010',
      text: 'ICON moves into two additional office buildings to take account of its steady growth during the preceding years.',
    },
    {
      year: '2012',
      text: 'The first ICON-INSTITUT is renamed to ICON-INSTITUT Private Sector GmbH. GET German Education and Training is renamed to ICON-INSTITUT Education and Training GmbH.',
    },
    {
      year: '2023',
      text: 'ICON-INSTITUT Engineering GmbH renamed to ICON-INSTITUT Sustain GmbH. As global actor in the field of sustainability we provide our services along the whole value chain from raw material / natural resources in the developing countries through production or processing steps to saleable products on local, regional or global markets.',
    },
  ],
  values: [
    {
      title: 'Corporate Social Responsibility',
      description:
        'For decades ICON has assumed responsibility for people and environment and contributes actively to a positive social development in our project countries. CSR is an integral part of our corporate philosophy – whether it concerns our customers, beneficiaries, employees, affiliates or environment protection. Please click to read our CSR declaration.',
      image: 'icon_corporate_social_responsibility.jpg',
    },
    {
      title: 'Integrity Agreement',
      description:
        'As member of the German Association of Consulting Engineers (Verband Beratende Ingenieure – VBI) we have adhered to the association’s integrity agreement, which can be read by clicking on this box.',
      image: 'icon_integrity_agreement.jpg',
    },
    {
      title: 'DIN EN ISO 9001:2015',
      description:
        'ICON Consulting Group including all its subsidiaries are DIN EN ISO 9001:2015 certified. Please click to see our ISO-Certificate. Trademark: ICON-INSTITUT® and GET German Education and Training®.',
      image: 'icon_din_en_iso_9001_2015.jpg',
    },
  ],
  memberships: {
    list: [
      'International section of the German Association of Consulting Engineers VBI e.V. (Auslandsausschuß)',
      'VBI-KfW working group on Financial Cooperation',
      'iMOVE',
      'GIZ-working groups (Facharbeitskreise) for private sector development, rural development and agriculture, governance, water, education as well as vocational education and labour market',
      'European Microfinance Platform',
      'DeGEval Gesellschaft für Evaluation e.V.',
      'Strategic advisory board of the CBS International Business School GmbH',
      'Eine-Welt Stadt Köln',
    ],
    details: [
      {
        name: 'Verband Beratender Ingenieure e.V.',
        description:
          'The German Association of Consulting Engineers, one of the leading associations worldwide for consultancy and engineering.',
        logo: 'logo1.jpg',
      },
      {
        name: 'iMOVE',
        description:
          'is an initiative of the German Federal Ministry of Education and Research (BMBF), with offices at the Federal Institute for Vocational Training (BIBB) in the Federal City of Bonn. We are member of the iMove network.',
        logo: 'logo3.jpg',
      },
      {
        name: 'European Microfinance Platform',
        description:
          'A growing network of over 140 organisations and individuals active in the area of microfinance.',
        logo: 'logo.jpg',
      },
      {
        name: 'DeGEval Gesellschaft für Evaluation e.V.',
        description:
          'This Evaluation Society works with experts and institutions that are active in the field of evaluation. It focusses on professionalisation of evaluation, consolidation of different perspectives of evaluation as well as information and exchange about evaluation.',
        logo: 'degeval.jpg',
      },
      {
        name: 'Eine-Welt Stadt Köln',
        description:
          'Köln supports with a local network the Millennium Development Aims of the United Nations.',
        logo: 'logo4-1.jpg',
      },
    ],
  },
};
