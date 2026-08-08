export type JobListing = {
  id: string;
  title: string;
  location: string;
  type: 'Permanent' | 'Short-term expert' | 'Freelance';
  expertise: string;
  published: string;
  deadline: string;
  status: 'open' | 'closed';
  summary: string;
  description: string[];
  requirements: string[];
};

export type JobsPage = {
  intro: string[];
  applicationNote: string;
  email: string;
  currentOffersNote: string;
  /** Optional link to the institute's separate job-listings portal. */
  portalUrl?: string;
  portalLabel?: string;
  listings: JobListing[];
};

export const jobsPage: JobsPage = {
  intro: [
    'Permanent staff vacancies at the Köln headquarters are regularly announced. Your application will be welcome at any time, if your profile meets the following main requirements: experience in project management, foreign language skills (fluent in English and very good in a second language), expertise in one of our target sectors, team-player mentality, flexibility and the willingness to work temporarily on projects abroad.',
    'The ICON-INSTITUTES are continuously seeking for experts to take on specific jobs in projects abroad. The assignments can go from one week up to some years. Take the initiative and send in – preferably in electronic format – your Curriculum Vitae and copies of your degrees and certificates. Do not forget to mention your references.',
    'You are advised to regularly check our current job opportunities. If you feel suited, please send your application immediately.',
  ],
  applicationNote:
    'Please provide certificates with your application (i.e., education/ university diplomas or degrees, work certificates/ references)',
  email: 'cv-icon@icon-institute.de',
  currentOffersNote: 'Current job offers',
  portalUrl: 'https://portal.icon-institute.de/iconJobWebJobsList.php',
  portalLabel: 'Open the ICON job portal',
  listings: [
    {
      id: 'project-manager-cologne',
      title: 'Project Manager – International Development (m/f/d)',
      location: 'Köln, Germany (with travel abroad)',
      type: 'Permanent',
      expertise: 'Economic and Employment Promotion',
      published: '2026-06-01',
      deadline: '2026-09-30',
      status: 'open',
      summary:
        'Coordinate multi-country technical assistance projects from our Cologne headquarters, working closely with consortium partners and donor agencies.',
      description: [
        'ICON-INSTITUTE is seeking an experienced Project Manager to support the planning, implementation and reporting of international development assignments.',
        'You will liaise with short-term experts, manage work plans and budgets, and ensure high-quality deliverables for EU, GIZ and other donor-funded projects.',
      ],
      requirements: [
        'University degree in economics, social sciences or a related field',
        'At least 5 years of project management experience in development cooperation',
        'Fluent English; German and/or French strongly preferred',
        'Willingness to travel to project countries',
      ],
    },
    {
      id: 'senior-expert-tvet',
      title: 'Senior Expert – TVET & Skills Development',
      location: 'Short-term assignments worldwide',
      type: 'Short-term expert',
      expertise: 'Governance, Education and Social Development',
      published: '2026-05-15',
      deadline: '2026-12-31',
      status: 'open',
      summary:
        'Join our expert pool for vocational education and training assignments lasting from a few weeks to several months.',
      description: [
        'We continuously seek senior TVET specialists for capacity development, curriculum reform and labour-market oriented skills programmes.',
        'Assignments may include desk studies, field missions and remote advisory support.',
      ],
      requirements: [
        'Advanced degree in education, labour economics or related discipline',
        'Proven track record in TVET system reform or skills partnerships',
        'Excellent English; additional languages an asset',
        'Availability for missions of 2–12 weeks',
      ],
    },
    {
      id: 'm-e-specialist',
      title: 'Monitoring & Evaluation Specialist',
      location: 'Remote / field missions',
      type: 'Freelance',
      expertise: 'Statistics, Evaluation and Social Research',
      published: '2026-04-20',
      deadline: '2026-10-31',
      status: 'open',
      summary:
        'Design and implement M&E frameworks, baseline studies and impact evaluations for ICON project portfolios.',
      description: [
        'Support project teams with results frameworks, indicator design, data collection tools and evaluation reports.',
      ],
      requirements: [
        'Degree in statistics, evaluation or social research',
        'Experience with donor M&E standards (EU, GIZ, World Bank)',
        'Strong quantitative and qualitative methods skills',
        'Fluent English; French or Spanish desirable',
      ],
    },
    {
      id: 'agriculture-advisor',
      title: 'Advisor – Agriculture & Rural Development',
      location: 'Africa / Asia (project-based)',
      type: 'Short-term expert',
      expertise: 'Agriculture and Rural Development',
      published: '2026-03-10',
      deadline: '2026-08-31',
      status: 'open',
      summary:
        'Provide technical advice on value chains, climate-smart agriculture and rural livelihoods programmes.',
      description: [
        'ICON seeks agricultural advisors for ongoing and upcoming rural development projects in Sub-Saharan Africa and South Asia.',
      ],
      requirements: [
        'Degree in agriculture, agronomy or rural development',
        'Field experience in smallholder and value-chain programmes',
        'Fluent English; French preferred for West Africa assignments',
      ],
    },
  ],
};

export function getJobById(id: string): JobListing | undefined {
  return jobsPage.listings.find((j) => j.id === id);
}
