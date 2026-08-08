import {
  BarChartIcon,
  CompassIcon,
  GraduationCapIcon,
  LandmarkIcon,
  LeafIcon,
  LightbulbIcon,
  SproutIcon,
  TrendingUpIcon,
} from './Icons';

/** Accent slot 1-5; drives the tinted tile colour via `.icon-tile--n`. */
export type IconAccent = 1 | 2 | 3 | 4 | 5;

type IconEntry = {
  Icon: typeof CompassIcon;
  accent: IconAccent;
};

const serviceIcons: Record<string, IconEntry> = {
  Consulting: { Icon: CompassIcon, accent: 1 },
  Concepts: { Icon: LightbulbIcon, accent: 2 },
  Training: { Icon: GraduationCapIcon, accent: 3 },
};

const expertiseIcons: Record<string, IconEntry> = {
  'statistics-evaluation-social-research': { Icon: BarChartIcon, accent: 1 },
  'economic-employment-promotion': { Icon: TrendingUpIcon, accent: 2 },
  'governance-education-social-development': { Icon: LandmarkIcon, accent: 3 },
  'agriculture-rural-development': { Icon: SproutIcon, accent: 4 },
  'sustainability-management': { Icon: LeafIcon, accent: 5 },
};

const fallback: IconEntry = { Icon: CompassIcon, accent: 1 };

/** Falls back to a neutral mark so unknown keys still render a tile. */
export function getServiceIcon(title: string): IconEntry {
  return serviceIcons[title] ?? fallback;
}

export function getExpertiseIcon(slug: string): IconEntry {
  return expertiseIcons[slug] ?? fallback;
}
