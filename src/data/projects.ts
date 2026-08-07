export type ProjectRegion = {
  slug: string;
  title: string;
  description: string;
  href: string;
};

export type ProjectFilterOption = {
  label: string;
  value: string;
};

export type ProjectFilters = {
  recentYears: ProjectFilterOption[];
  years: ProjectFilterOption[];
  regions: ProjectFilterOption[];
  expertise: ProjectFilterOption[];
  volumes: ProjectFilterOption[];
};

export type SampleProject = {
  id: string;
  title: string;
  country: string;
  region: string;
  yearStart: number;
  yearEnd: number;
  expertise: string;
  volume: string;
  description: string;
};

/**
 * Project cards on the original site are AJAX-loaded from a live catalogue.
 * These sample entries are representative placeholders for local display.
 */
export const projectRegions: ProjectRegion[] = [
  {
    slug: 'africa',
    title: 'Africa',
    description:
      'ICON implements projects across Sub-Saharan and North Africa covering employment promotion, agriculture, governance, statistics and sustainability.',
    href: '/projects/africa',
  },
  {
    slug: 'asia',
    title: 'Asia',
    description:
      'Our Asian portfolio ranges from vocational education and private-sector development to climate finance, statistics and rural development.',
    href: '/projects/asia',
  },
  {
    slug: 'central-america-caribbean',
    title: 'Central America Caribbean',
    description:
      'ICON supports partners in Central America and the Caribbean with capacity development, education, economic promotion and evaluation services.',
    href: '/projects/central-america-caribbean',
  },
  {
    slug: 'europe',
    title: 'Europe',
    description:
      'In Europe and the EU enlargement region ICON delivers statistical cooperation, public employment services, training and policy advisory.',
    href: '/projects/europe',
  },
  {
    slug: 'middle-east',
    title: 'Middle East',
    description:
      'Projects in the Middle East focus on employment, TVET, MSME promotion, education reform and sustainable value-chain development.',
    href: '/projects/middle-east',
  },
  {
    slug: 'south-america',
    title: 'South America',
    description:
      'ICON’s South American work includes rural development, private-sector support and institutional capacity building with regional partners.',
    href: '/projects/south-america',
  },
];

export const projectFilters: ProjectFilters = {
  recentYears: [
    { label: 'Only show projects for the last 3 years', value: 'last-3' },
    { label: 'Only show projects for the last 5 years', value: 'last-5' },
  ],
  years: Array.from({ length: 22 }, (_, i) => {
    const year = String(2008 + i);
    return { label: year, value: year };
  }),
  regions: [
    { label: 'Africa', value: 'africa' },
    { label: 'Asia', value: 'asia' },
    { label: 'Central America Caribbean', value: 'central-america-caribbean' },
    { label: 'Europe', value: 'europe' },
    { label: 'Middle East', value: 'middle-east' },
    { label: 'South America', value: 'south-america' },
  ],
  expertise: [
    {
      label: 'Economic and Employment Promotion',
      value: 'economic-employment-promotion',
    },
    {
      label: 'Governance, Education and Social Development',
      value: 'governance-education-social-development',
    },
    {
      label: 'Agriculture and Rural Development',
      value: 'agriculture-rural-development',
    },
    {
      label: 'Statistics, Evaluation and Social Research',
      value: 'statistics-evaluation-social-research',
    },
    {
      label: 'Sustainability Management',
      value: 'sustainability-management',
    },
  ],
  volumes: [
    { label: '< 100k', value: 'lt-100k' },
    { label: '100k - 300k', value: '100k-300k' },
    { label: '300k - 500k', value: '300k-500k' },
    { label: '500k - 1m', value: '500k-1m' },
    { label: '1m - 3m', value: '1m-3m' },
    { label: '3m - 5m', value: '3m-5m' },
    { label: '> 5m', value: 'gt-5m' },
  ],
};

export const sampleProjects: SampleProject[] = [
  {
    id: 'benchlearning-pes',
    title: 'Benchlearning among Public Employment Services',
    country: 'Various countries',
    region: 'europe',
    yearStart: 2026,
    yearEnd: 2026,
    expertise: 'economic-employment-promotion',
    volume: '1m-3m',
    description:
      'Supporting mutual learning and performance benchmarking among Public Employment Services in the European PES Network.',
  },
  {
    id: 'water-management-zambia',
    title: 'Water management and landscape protection',
    country: 'Zambia',
    region: 'africa',
    yearStart: 2025,
    yearEnd: 2028,
    expertise: 'agriculture-rural-development',
    volume: '1m-3m',
    description:
      'Technical assistance for integrated water resources management and landscape protection in rural Zambia.',
  },
  {
    id: 'tei-op-vet',
    title: 'Technical Assistance of the TEI OP-VET',
    country: 'Various countries',
    region: 'africa',
    yearStart: 2025,
    yearEnd: 2027,
    expertise: 'governance-education-social-development',
    volume: '3m-5m',
    description:
      'Advisory support for Team Europe Initiative on vocational education and training partnerships.',
  },
  {
    id: 'circular-economy-algeria',
    title: 'Circular Economy',
    country: 'Algeria',
    region: 'africa',
    yearStart: 2025,
    yearEnd: 2025,
    expertise: 'economic-employment-promotion',
    volume: '100k-300k',
    description:
      'Evaluation and advisory services on solid waste management and circular-economy approaches in Algeria.',
  },
  {
    id: 'prior-learning-egypt',
    title: 'Prior Learning Policy Development',
    country: 'Egypt',
    region: 'middle-east',
    yearStart: 2025,
    yearEnd: 2027,
    expertise: 'governance-education-social-development',
    volume: '300k-500k',
    description:
      'Supporting national policy development for recognition of prior learning in Egypt’s education and TVET system.',
  },
  {
    id: 'market-oriented-value-chains',
    title: 'Market oriented value chains',
    country: 'Various countries',
    region: 'africa',
    yearStart: 2025,
    yearEnd: 2026,
    expertise: 'agriculture-rural-development',
    volume: '500k-1m',
    description:
      'Promotion of inclusive, market-oriented agricultural value chains with a focus on climate resilience.',
  },
  {
    id: 'istart-career-germany',
    title: 'Study: iStart Career Programme for international students',
    country: 'Germany',
    region: 'europe',
    yearStart: 2025,
    yearEnd: 2025,
    expertise: 'economic-employment-promotion',
    volume: 'lt-100k',
    description:
      'Study on career-programme approaches supporting international students’ transition into the German labour market.',
  },
  {
    id: 'gender-directive-mozambique',
    title: 'Gender Directive for Basic Education',
    country: 'Mozambique',
    region: 'africa',
    yearStart: 2025,
    yearEnd: 2026,
    expertise: 'governance-education-social-development',
    volume: '100k-300k',
    description:
      'Support to gender-responsive policy guidance for basic education institutions in Mozambique.',
  },
  {
    id: 'iki-india-mel',
    title: 'IKI India – MEL Approaches',
    country: 'India',
    region: 'asia',
    yearStart: 2025,
    yearEnd: 2025,
    expertise: 'statistics-evaluation-social-research',
    volume: '100k-300k',
    description:
      'Development of monitoring, evaluation and learning approaches for climate-related interventions in India.',
  },
  {
    id: 'climate-risk-modules-india',
    title: 'Modules for climate risk',
    country: 'India',
    region: 'asia',
    yearStart: 2025,
    yearEnd: 2026,
    expertise: 'agriculture-rural-development',
    volume: '300k-500k',
    description:
      'Design of training modules on climate-risk assessment and adaptation for rural development stakeholders.',
  },
  {
    id: 'job-partnership-rwanda',
    title: 'Job partnership and SME promotion',
    country: 'Rwanda',
    region: 'africa',
    yearStart: 2025,
    yearEnd: 2026,
    expertise: 'economic-employment-promotion',
    volume: '500k-1m',
    description:
      'Promotion of job partnerships and SME competitiveness, including incubator and accelerator support in the wood sector.',
  },
  {
    id: 'school-guidance-palestine',
    title: 'Effective School Guidance Counselling Workforce',
    country: 'Palestine',
    region: 'middle-east',
    yearStart: 2025,
    yearEnd: 2026,
    expertise: 'governance-education-social-development',
    volume: '300k-500k',
    description:
      'Capacity development for an effective school guidance and counselling workforce in Palestine.',
  },
  {
    id: 'esg-reporting-brazil',
    title: 'ESG reporting capacity for agribusiness cooperatives',
    country: 'Brazil',
    region: 'south-america',
    yearStart: 2024,
    yearEnd: 2026,
    expertise: 'sustainability-management',
    volume: '300k-500k',
    description:
      'Advisory support for sustainability reporting and environmental management systems among rural cooperatives.',
  },
  {
    id: 'tvet-reform-guatemala',
    title: 'TVET reform and labour market matching',
    country: 'Guatemala',
    region: 'central-america-caribbean',
    yearStart: 2023,
    yearEnd: 2026,
    expertise: 'governance-education-social-development',
    volume: '1m-3m',
    description:
      'Technical assistance for vocational training reform and improved labour-market matching in Central America.',
  },
  {
    id: 'msme-finance-peru',
    title: 'MSME finance and employment promotion',
    country: 'Peru',
    region: 'south-america',
    yearStart: 2022,
    yearEnd: 2025,
    expertise: 'economic-employment-promotion',
    volume: '500k-1m',
    description:
      'Support to MSME financing instruments and employment promotion partnerships in Peru.',
  },
  {
    id: 'stats-capacity-jamaica',
    title: 'Official statistics capacity development',
    country: 'Jamaica',
    region: 'central-america-caribbean',
    yearStart: 2024,
    yearEnd: 2027,
    expertise: 'statistics-evaluation-social-research',
    volume: '300k-500k',
    description:
      'Capacity building for official statistics production and quality assurance in the Caribbean.',
  },
  {
    id: 'climate-adaptation-kenya',
    title: 'Climate adaptation in agricultural landscapes',
    country: 'Kenya',
    region: 'africa',
    yearStart: 2024,
    yearEnd: 2027,
    expertise: 'sustainability-management',
    volume: '1m-3m',
    description:
      'Integrating climate adaptation measures into agricultural landscape management and local planning.',
  },
];

export const projectsPage = {
  title: 'Projects Worldwide',
  intro:
    'Browse ICON projects by region, running period, expertise area and volume. Use free-text search to find projects by title, country or description. Filtering and search run entirely in your browser.',
  mapNote:
    'Select a region below or use the filters to explore the project catalogue.',
  regions: projectRegions,
  filters: projectFilters,
  samples: sampleProjects,
  filterIcons: {
    country: 'icon_country_free.png',
    period: 'icon_period.png',
    area: 'icon_area.png',
    volume: 'icon_volume.png',
  },
};

export const regionBySlug: Record<string, ProjectRegion> = Object.fromEntries(
  projectRegions.map((region) => [region.slug, region])
);
