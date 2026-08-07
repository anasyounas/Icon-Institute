export type ExpertiseSubsection = {
  title: string;
  items: string[];
};

export type ExpertiseSection = {
  title: string;
  subsections?: ExpertiseSubsection[];
  items?: string[];
};

export type ExpertiseArea = {
  slug: string;
  title: string;
  heroImage: string;
  cardImage: string;
  intro: string[];
  sections: ExpertiseSection[];
};

export type ExpertiseHubCard = {
  slug: string;
  title: string;
  image: string;
  highlights: string[];
};

export const expertiseHubCards: ExpertiseHubCard[] = [
  {
    slug: 'statistics-evaluation-social-research',
    title: 'Statistics, Evaluation and Social Research',
    image: 'statistics-evaluation-and-social-research-1.png',
    highlights: ['Statistics', 'Evaluation and Social Research'],
  },
  {
    slug: 'economic-employment-promotion',
    title: 'Economic and Employment Promotion',
    image: 'economic-and-employment-promotion.png',
    highlights: [
      'Economic Development',
      'Financial Sector Development',
      'Vocational Education and Employment',
    ],
  },
  {
    slug: 'governance-education-social-development',
    title: 'Governance, Education and Social Development',
    image: 'governance-public-administration.jpg',
    highlights: [
      'Governance',
      'Education and Training',
      'Social Development and Health',
    ],
  },
  {
    slug: 'agriculture-rural-development',
    title: 'Agriculture and Rural Development',
    image: 'infrastructure-and-rural-development.jpg',
    highlights: ['Agriculture and Rural Development'],
  },
  {
    slug: 'sustainability-management',
    title: 'Sustainability Management in Global Value and Supply Chains',
    image: 'Sustainable-supply-chains-1.png',
    highlights: [],
  },
];

export const expertiseStats: ExpertiseArea = {
  slug: 'statistics-evaluation-social-research',
  title: 'Statistics, Evaluation and Social Research',
  heroImage: 'icon-institute_7-1024x683-1.jpg',
  cardImage: 'statistics-evaluation-and-social-research-1.png',
  intro: [
    'The adoption of the 2030 Development Agenda requires that policies, strategies and plans are evidence-based and contribute to the progress toward the Sustainable Development Goals.',
    'In this regard, the production of use of sound and accurate data are of utmost importance. Capacity building and technical assistance in statistics directly contribute to these objectives. ICON has a long-standing experience in assisting countries and development partners to produce and use statistical data in line with international quality standards. Statistical data are essential to measure and monitor progress towards the SDG targets.',
    'The evaluation of development strategies, plans, programmes and projects also ensures that these are programmed and implemented according to the OECD Development Assistance Committee criteria of relevance, effectiveness, efficiency, sustainability and impact. The lessons learned through evaluations are intended to help the development partners and countries to improve their development plans and informed evidence-based policy making.',
    'ICON contributes to the knowledge base in topical social matters such as labour market performance and developments or education systems reforms thus taking advantage of its internal statistical and evaluation related know-how.',
  ],
  sections: [
    {
      title: 'Statistics',
      items: [
        'Technical Assistance for alignment with official statistics, norms and standards',
        'Production and analysis of economic, national accounts and social data as well as demographic and census data',
        'Statistical studies',
        'Methodological support to the European Statistical System',
        'Training and capacity building in statistics',
        'Public administration for statistic departments',
      ],
    },
    {
      title: 'Evaluation and Social Research',
      items: [
        'Methodological expertise in evaluations – Qualitative and quantitative',
        'Design of data collection and analysis tools',
        'Impact assessment',
        'Experimental and quasi-experimental methods',
      ],
    },
  ],
};

export const expertiseEconomic: ExpertiseArea = {
  slug: 'economic-employment-promotion',
  title: 'Economic and Employment Promotion',
  heroImage: 'icon-institute_5.jpg',
  cardImage: 'economic-and-employment-promotion.png',
  intro: [
    'The engines of economic growth and job creation are a vigorous private sector and a well-functioning financial system. As the challenges of globalisation are significant and ever-evolving, small and medium-sized enterprises (SMEs) across all sectors need to be facilitated and supported to be able to innovate, improve productivity though product and process upgrading, and identify and exploit market opportunities.',
    'A coherent national competitiveness strategy plays a major role in boosting companies’ competitiveness by creating and enabling a business environment where:',
    'Adequate infrastructure and regulatory frameworks, including business financing, are in place;',
    'Suitable skilled labour force is made available through developing (Technical) Vocational Education and Training (TVET) programs that work jointly with the private sector;',
    'Linkages/partnerships between relevant public and private stakeholders, including academia and civil society, are facilitated.',
    'Additionally, in an increasingly dominating global economy, the need of harnessing science, technology and innovation (STI) has become more evident. As globalisation has enhanced the dissemination of knowledge and expertise, there is a pressing need to couple STI outcomes with business enterprises and practical applications in the industrial and technical domains.',
    'Our services contribute to reach the Sustainable Development Goal (SDG) 8 “Decent Work and Economic Growth”.',
  ],
  sections: [
    {
      title: 'Economic Development',
      subsections: [
        {
          title: 'Business Development',
          items: [
            'Business Regulatory Environment improvement',
            'Public-Private Partnerships',
            'Value Chain Development',
            'Business Development Services',
            'Entrepreneurship Promotion, Incubation & Acceleration',
            'Support to private sector organisations/ associations',
            'Youth employment, Women’s economic empowerment and integration of marginalised groups',
            'Occupational Health & Safety',
          ],
        },
        {
          title: 'Trade and Investment Promotion',
          items: [
            'Access to international markets',
            'Trade fair participation',
            'Investor search and matchmaking',
            'Standards and certification',
          ],
        },
        {
          title: 'Green Businesses and Circular Development',
          items: [
            'Green policy advisory',
            'Green business cases',
            'Sustainable and circular materials and production methods',
          ],
        },
      ],
    },
    {
      title: 'Financial Sector Development',
      subsections: [
        {
          title: 'Micro and SME Finance',
          items: [
            'Access to Finance for (M)SMEs',
            'Financing mechanisms and Fund Management',
            'Financial Institutions Development, incl. Portfolio Management and Insurance',
            'Financial Literacy',
            'Women’s Financial Inclusion',
            'Green and Climate Finance',
            'Digital Finance',
          ],
        },
        {
          title: 'Financial Sector Supervision',
          items: [
            'Financial sector policies and regulatory frameworks',
            'Advisory to Central Banks',
            'Greening Financial Management',
            'Restructuring the internal management, Training, Management Information System (MIS)',
            'Regulatory framework safeguarding customers rights',
            'Risk Management',
          ],
        },
      ],
    },
    {
      title: 'Vocational Education and Employment',
      subsections: [
        {
          title: 'Labour Market Demand and Matching',
          items: [
            'Labour Market Information System',
            'Active Labour Market Policies',
            'Career guidance and counselling',
            'Employment Services',
          ],
        },
        {
          title: 'Vocational Education & Training / Labour Market supply side',
          items: [
            'Legal frameworks and TVET reform',
            'Public-private partnerships',
            'Occupational standards and curricula',
            'Formal and informal TVET provision',
            'Centres of Vocational Excellence',
            'Workshop design and procurement of equipment',
          ],
        },
        {
          title: 'Labour Market and Employment',
          items: [
            'Labour market and employment strategies and reform processes',
            'Systems and trainings in career counselling',
            'Platforms and networks for stakeholders in the field of VET and employment',
            'Labour market information and systems for job search',
          ],
        },
      ],
    },
  ],
};

export const expertiseGovernance: ExpertiseArea = {
  slug: 'governance-education-social-development',
  title: 'Governance, Education and Social Development',
  heroImage: 'icon-institute-22.jpg',
  cardImage: 'governance-public-administration.jpg',
  intro: [
    'Citizens of all countries in the world aspire to live in peaceful, inclusive and cohesive societies. Sustainable Development Goal 16 on Peace, Justice and Strong Institutions challenges all countries in the world to “end violence, promote the rule of law, strengthen institutions and increase access to justice”. Our expertise in this regard seeks to support national, regional and local authorities in building accountable, effective and inclusive institutions as well as provide access to justice, education and training, social protection and health care.',
    'ICON also supports reforms and development of public finance institutions enabling them to ensure that proper funding of State operations and delivery of services to the citizens. Civil Society Organisations (CSO) are also an integral part of democratic and modern society and we are proud to contribute to their development as well.',
    'Education and healthcare are fundamental services to citizens providing the basis for the development of the human capital for the society and economy to strive according to the targets and objectives of the 2030 Development Agenda.',
    'As part of the activities to advance this agenda, ICON provides expertise in building capacities at individual and organisational levels. By building information systems for healthcare, education and public finance, developing trainings and lifelong learning, and conducting surveys, research and feasibility studies related to these topics, we assist the authorities and civil society organisations to improve governance, gender equality and civic engagement.',
  ],
  sections: [
    {
      title: 'Governance',
      subsections: [
        {
          title: 'Good Governance',
          items: [
            'Public Finance Management / Good Financial Governance',
            'Public Finance & Fiscal Policy',
            'Public Administration Reform (PAR)',
            'Decentralisation',
            'Project Management Units (PMU) and National Authorising Offices (NAO)',
            'Rule of Law',
          ],
        },
      ],
    },
    {
      title: 'Education and Training',
      subsections: [
        {
          title: 'General Education',
          items: [
            'Primary, secondary and tertiary education reform',
            'Lifelong Learning',
            'Institutional capacity building',
          ],
        },
        {
          title: 'Labour Market Demand and Matching',
          items: [
            'Labour Market Information System',
            'Active Labour Market Policies',
            'Career guidance and counselling',
            'Employment Services',
          ],
        },
        {
          title: 'Vocational Education & Training / Labour Market supply side',
          items: [
            'Legal frameworks and TVET reform',
            'Public-private partnerships',
            'Occupational standards and curricula',
            'Formal and informal TVET provision',
            'Centres of Vocational Excellence',
            'Workshop design and procurement of equipment',
          ],
        },
        {
          title: 'Training',
          items: [
            'Train the Trainer (ToT) approach',
            'Web-based courses',
            'Organisation of study visits',
            'Communities of practice',
          ],
        },
      ],
    },
    {
      title: 'Social Development and Health',
      items: [
        'Social protection reform',
        'Improvement of social security and social assistance schemes',
        'Social inclusion and cohesion',
        'Health policy and planning',
        'Health management information systems',
        'Health facilities and services',
      ],
    },
  ],
};

export const expertiseAgriculture: ExpertiseArea = {
  slug: 'agriculture-rural-development',
  title: 'Agriculture and Rural Development',
  heroImage: 'Agriculture-Sector.jpg',
  cardImage: 'infrastructure-and-rural-development.jpg',
  intro: [
    'The Agriculture and Rural Development sector provides services across a broad spectrum of thematic areas. In agriculture, this includes agribusiness development and green growth, the promotion of resilient agri-food systems, food security and nutrition, as well as agro-ecology and climate-smart agriculture. Further focus is placed on the sustainable management of natural resources, including soils, water, and biodiversity, alongside comprehensive sector analysis and policy development.',
    'In the area of rural development, services address rural economic development, the empowerment of women and youth in local planning processes, and support for integrated water resources management. Additional expertise covers energy efficiency, the promotion of renewable energies, and the implementation of climate policies such as Nationally Determined Contributions (NDCs).',
    'Rural infrastructure is a foundation for significantly improving the quality of human life and accelerating the process of agricultural development. We support our clients in organisational development, institutional and financial strengthening and training, and project implementation and evaluation to assist them in their endeavours to achieve sustainability in their projects. With our services, we contribute to the Sustainable Development Goals (SDGs) on “No poverty – SDG 1”, “Zero Hunger – SDG 2”, “Clean Water and Sanitation – SDG 6”, “Affordable and Clean Energy – SDG 7” and “Climate Action – SDG 13”.',
  ],
  sections: [
    {
      title: 'Agriculture',
      items: [
        'Agribusiness Development and Green Growth',
        'Agri-Food Systems, Food Security and Nutrition',
        'Agro-Ecology and Climate-Smart Agriculture',
        'Natural Resources Management, Conservation of Soils, Water and Biodiversity',
        'Agriculture and Environmental Sector Analysis and Policy',
      ],
    },
    {
      title: 'Rural Development',
      items: [
        'Rural Economic Development',
        'Women and Youth Empowerment in Local Planning and Rural Economies',
        'Integrated Water Resources Management',
        'Energy Efficiency, Renewable Energies',
        'Climate Change and Implementation of Nationally Determined Contributions (NDCs)',
      ],
    },
  ],
};

export const expertiseSustainability: ExpertiseArea = {
  slug: 'sustainability-management',
  title: 'Sustainability Management in Global Value and Supply Chains',
  heroImage: 'iStock-1333864874.png',
  cardImage: 'Sustainable-supply-chains-1.png',
  intro: [
    'ICON follows the SDGs in all expertise fields and in all our interventions. In this section, a comprehensive overview of relevant aspects coming from the different fields of expertise are summarised around the sustainability in global value and supply chains showing our capacities to support organisations in meeting current environmental and social compliance requirements.',
    'We apply 50 years experience in delivering advisory services and training on the ground in developing or least developed countries. At this end of all global value chains, the natural resources are extracted, processed and used with local labour force and finally sold to generate business for local, regional or global organisations. We work with multiple stakeholders on micro, meso and macro level which enables us to access the complexity of global value chains. We can apply methods to show transparency in the supply chains, we do understand the individual needs of the different actors and are therefore able to provide tailormade capacity building programmes to generate or improve decent job opportunities and to finally enhance environmental friendly industrial or production processes for our clients.',
    'With our technically broad and sector wide longstanding experience we provide comprehensive advisory services, trainings and monitoring instruments to enable our clients to comply with environmental and social standards according to the recent legal requirements along all steps of the value chain. Our services target at real and measurable improvement of the situation in the frame of Corporate Due Diligence and Occupational Health and Safety Standards.',
    'The sector experience covers, among others, textiles, leather, wool, silk, cotton, agriculture products, processed food, wood, tourism, construction materials, packaging and cosmetic products.',
  ],
  sections: [
    {
      title:
        'Selective examples of our sustainability work in different sectors and countries on micro-, meso and macro level',
      items: [
        '2025-2026 Climate Adaptation, Resilience, and Climate Finance in Rural India (CAFRI II), GIZ',
        '2025-2026 Employment promotion for women for the green transformation in Africa, GIZ',
        '2025-2026 Technical Advisory and Training Delivery on ESG in the leather sector in SADC, GIZ',
        '2025 Development of new modules for the Climate Finance Training (CliFiT), GIZ',
        '2024-2025 Developing a tool on Green Public Financial Management, GIZ',
        '2024-2025 Sustainability Reporting, private client in the German textile sector',
        '2023-2026 Capacity Development for the Implementation of Rwanda´s Nationally Determined Contributions (NDCs), GIZ',
        '2023-2025 Good Working Conditions in Tanneries / Occupational Safety and Health in the tannery sector in Bangladesh, GIZ',
        '2022-2024 Green Resilient and Productive Agricultural Ecosystems (GRAPE) in Nepal, GIZ',
        '2022-2024: Development of Training of Trainer modules on social and ecological sustainability standards in the Bangladeshi textile industry, GIZ',
        '2021-2023: Employment-oriented MSME promotion. To develop a conducive licensing system in Jordan to classify food establishments according to ISIC04, development of food health and safety standards with a General Safety Certificate and an Environmental Site Approval for the factories, warehouses and central kitchen, GIZ',
        '2021: Central project evaluation of the project: ‘Rural Development Cameroon’ to support private advisory services to disseminate improved environmental friendly crop and livestock production techniques, GIZ',
        '2020: Central project evaluation of the project ‘Solid waste management and circular economy’ in Algeria, GIZ',
        '2019-2022: Support the Power Grid Company of Bangladesh (PGCB) to build and strengthen their Environmental & Sustainability Unit (E&S) and their Financial Department, KfW',
        '2019: Project evaluation of the project ‘Improve the access to sanitation through construction of toilets for underserved communities and execution of Behaviour Change Communications’ in Nepal and Sri Lanka, DEG',
        '2018-2023: Promotion of Rural Development in Northern Uganda (PRUDEV). Supporting the climate-smart, agriculture-based local economic development, development of an MRV (Measuring, Reporting & Verification)-System for greenhouse gas emissions from agriculture, improving water management in micro irrigation, GIZ',
        '2018-2020: Design and Implementation of a capacity building Programme for small and medium Town Water Utilities in Ethiopia to provide management, operational and technical skills to employees to ensure sustainable, efficient and reliable water services, AFD',
        '2018-2019: In-depth Analysis of Agricultural Value Chains in Southeastern Madagascar – Adaptation of Agricultural Value Chains to Climate Change (PrAda), GIZ',
        '2017-2021: Capacity Development for the Private Sector in Myanmar. Improving framework conditions and services for sustainable growth of MSMEs as well as small-scale producers (e.g. Mango & Tea, Tourism) to create decent jobs through partnerships with the Private Sector. Promote certification Global GAP/ASEAN GAP, organic certification focusing on environmental sustainability criteria, GIZ',
        '2017-2021: Auditing and advisory services to the German Alliance for Sustainable Textiles (Bündnis für nachhaltige Textilien), GIZ',
        '2017-2019: Private Sector Development Programme in Lebanon. Enhance the productivity and competitiveness of the table grapes and cherries sectors through the development of inclusive, social and economically sustainable value chains (innovation/ technology transfer, export promotion, good agricultural practices, ISO, HACCP, traceability, food safety, pesticide handling etc. for farmers, producers and exporters, EU',
        '2016-2019: Promotion of Economy and Employment (Eco-Emploi) in Rwanda. TVET and Skills Development for example for wood workers from companies (workshop management and safety, wood working machines, workplace health, safety and security practice etc.), GIZ',
        '2015-2020: Palestinian Upgrading and Modernisation Programme. Strengthen the abilities of SMEs to upgrade productivity, quality, technology transfer etc. Setting up a corporate quality infrastructure system to apply quality certifications on the production processes including health and safety issues, AFD',
      ],
    },
  ],
};

export const expertiseAreas: ExpertiseArea[] = [
  expertiseStats,
  expertiseEconomic,
  expertiseGovernance,
  expertiseAgriculture,
  expertiseSustainability,
];

export const expertiseBySlug: Record<string, ExpertiseArea> = Object.fromEntries(
  expertiseAreas.map((area) => [area.slug, area])
);

export const expertiseHub = {
  title: 'Expertise',
  cards: expertiseHubCards,
};
