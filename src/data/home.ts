import { expertiseHubCards } from './expertise';
import { newsItems } from './news';

export type HeroSlide = {
  image: string;
  overlayWord: string;
};

export type ServiceCard = {
  title: string;
  text: string;
  href: string;
};

export type QuickLink = {
  label: string;
  href: string;
  image: string;
};

export type HomePage = {
  heroSlides: HeroSlide[];
  welcome: {
    title: string;
    text: string;
    ctaLabel: string;
    ctaHref: string;
  };
  services: {
    title: string;
    subtitle: string;
    cards: ServiceCard[];
  };
  quickLinks: QuickLink[];
  projectsWorldwide: {
    title: string;
    image: string;
    href: string;
  };
  expertise: {
    title: string;
    cards: typeof expertiseHubCards;
  };
  featuredNews: {
    title: string;
    items: typeof newsItems;
  };
};

export const homePage: HomePage = {
  heroSlides: [
    { image: '/header%20(1).jpg', overlayWord: 'consulting' },
    { image: '/header%20(2).jpg', overlayWord: 'concepts' },
    { image: '/header%20(3).jpg', overlayWord: 'training' },
  ],
  welcome: {
    title: 'Welcome',
    text: 'Welcome to our homepage. Herein you find all relevant information on the consulting services and expertise that we have built up since 1975. Hopefully you will enjoy browsing our website and learn more about the ICON-INSTITUTE Consulting Group.',
    ctaLabel: 'Learn more',
    ctaHref: '/about-us',
  },
  services: {
    title: 'What we do',
    subtitle:
      'Three pillars of our work — guiding partners worldwide with clarity, strategy, and lasting capacity.',
    cards: [
      {
        title: 'Consulting',
        text: 'Independent advisory for public institutions and development partners, from strategy through implementation and evaluation.',
        href: '/expertise',
      },
      {
        title: 'Concepts',
        text: 'Evidence-based programme and project concepts that turn policy goals into workable, measurable designs.',
        href: '/projects',
      },
      {
        title: 'Training',
        text: 'Practice-oriented capacity development that strengthens organisations and professionals for sustainable results.',
        href: '/expertise',
      },
    ],
  },
  quickLinks: [
    {
      label: 'ABOUT US',
      href: '/about-us',
      image: 'icon_institut_haus.jpg',
    },
    {
      label: 'JOBS',
      href: '/jobs',
      image: 'icon_institute_jobs.jpg',
    },
    {
      label: 'DOWNLOAD',
      href: '/download',
      image: 'icon_institut_haus_3.jpg',
    },
  ],
  projectsWorldwide: {
    title: 'Projects Worldwide',
    image: 'icon_projects.jpg',
    href: '/projects',
  },
  expertise: {
    title: 'EXPERTISE',
    cards: expertiseHubCards,
  },
  featuredNews: {
    title: 'News',
    items: newsItems.slice(0, 3),
  },
};
