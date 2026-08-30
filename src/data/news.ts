import type { NewsMediaRef } from '../lib/api';

export type NewsItem = {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  /** By-line shown under the headline. */
  author?: string;
  image?: string;
  /** Lead paragraph, also used on listings and for SEO. */
  excerpt?: string;
  /** Article paragraphs; **bold**, *italic* and [links](url) are rendered. */
  body?: string[];
  /** Sanitized HTML from the backend for rich-text articles. */
  body_html?: string | null;
  /** Ordered media list for richer article layouts. */
  media?: NewsMediaRef[];
  /** Newsletter or report offered for download at the end of the article. */
  attachment?: string;
  attachment_label?: string;
  contact_email?: string;
};

export const newsItems: NewsItem[] = [
  {
    "slug": "ipa-2022-programme-advances-statistical-modernisation-across-the-western-balkans-and-turki",
    "title": "IPA 2022 Programme Advances Statistical Modernisation Across the Western Balkans and Türkiye",
    "date": "2026-07-24",
    "dateLabel": "24. July 2026",
    "image": "ipa2022bckgr-600x600.jpg"
  },
  {
    "slug": "ipa-2022-continues-to-strengthen-statistical-cooperation-across-the-enlargement-region",
    "title": "IPA 2022 Continues to Strengthen Statistical Cooperation Across the Enlargement Region",
    "date": "2026-07-16",
    "dateLabel": "16. July 2026",
    "image": "ipa2022bckgr-600x600.jpg"
  },
  {
    "slug": "ipa-2022-key-highlights-march-june-2026",
    "title": "IPA 2022: Key highlights (March-June 2026)",
    "date": "2026-05-13",
    "dateLabel": "13. May 2026",
    "image": "ipa2022bckgr-600x600.jpg"
  },
  {
    "slug": "ipa-2022-key-highlights-january-february-2026",
    "title": "IPA 2022: Key highlights (January-February 2026)",
    "date": "2026-04-24",
    "dateLabel": "24. April 2026",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "strengthening-international-statistical-cooperation-two-new-contracts-with-eurostat",
    "title": "Strengthening International Statistical Cooperation: Two New Contracts with Eurostat",
    "date": "2026-04-24",
    "dateLabel": "24. April 2026",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "transparenz-in-der-lieferkette",
    "title": "Transparenz in der Lieferkette",
    "date": "2026-04-20",
    "dateLabel": "20. April 2026",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-consortium-moderated-the-nigeria-eu-matchmaking-meeting-at-the-nigeria-eu-science-inn",
    "title": "ICON consortium moderated the Nigeria–EU Matchmaking Meeting at the Nigeria–EU Science & Innovation Day on 24 February 2026",
    "date": "2026-02-27",
    "dateLabel": "27. February 2026",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "strategischer-austausch-zwischen-giz-und-vbi-auf-vorstandsebene",
    "title": "Strategischer Austausch zwischen GIZ und VBI auf Vorstandsebene",
    "date": "2026-02-20",
    "dateLabel": "20. February 2026",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-delivers-eurostat-training-on-energy-statistics-for-enp-east-and-central-asia-in-zagr",
    "title": "ICON delivers Eurostat training on “Energy Statistics” for ENP East and Central Asia in Zagreb",
    "date": "2026-02-09",
    "dateLabel": "9. February 2026",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "remote-info-days-and-workshops-on-writing-proposals-for-nigerian-higher-education-institut",
    "title": "Remote Info-Days and Workshops on Writing Proposals for Nigerian higher education Institutions",
    "date": "2026-01-27",
    "dateLabel": "27. January 2026",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "season-s-greetings",
    "title": "Season’s Greetings",
    "date": "2025-12-18",
    "dateLabel": "18. December 2025",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "ipa-2022-key-highlights-may-october-2025",
    "title": "IPA 2022: Key highlights (May–October 2025)",
    "date": "2025-12-10",
    "dateLabel": "10. December 2025",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "closing-ceremony-in-rwanda-for-the-incubator-accelerator-facility-in-the-wood-sector",
    "title": "Closing Ceremony in Rwanda for the Incubator/Accelerator Facility in the Wood Sector",
    "date": "2025-11-25",
    "dateLabel": "25. November 2025",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-is-back-at-engagement-weltweit",
    "title": "ICON is back at ENGAGEMENT WELTWEIT",
    "date": "2025-11-07",
    "dateLabel": "7. November 2025",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "because-quality-matters",
    "title": "Because Quality Matters!",
    "date": "2025-09-12",
    "dateLabel": "12. September 2025",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-institute-celebrates-50-years-of-expertise-in-international-cooperation",
    "title": "ICON-INSTITUTE celebrates 50 years of expertise in international cooperation",
    "date": "2025-06-10",
    "dateLabel": "10. June 2025",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "eurostat-high-level-seminar-enp-east-official-statistics-in-a-changing-world-value-efficie",
    "title": "Eurostat High Level Seminar ENP-East – Official Statistics in a Changing World: Value, Efficiency and Readiness for the Future of Statistics",
    "date": "2025-05-22",
    "dateLabel": "22. May 2025",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "green-public-financial-management-seminar-designing-and-implementing-impactful-reforms-in-",
    "title": "Green Public Financial Management Seminar: Designing and Implementing Impactful Reforms in Kigali",
    "date": "2025-03-27",
    "dateLabel": "27. March 2025",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "first-coordination-workshop-of-ipa-2022-held-in-athens",
    "title": "First Coordination Workshop of IPA 2022 held in Athens",
    "date": "2025-03-21",
    "dateLabel": "21. March 2025",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "season-s-greetings-2",
    "title": "Season’s greetings",
    "date": "2024-12-23",
    "dateLabel": "23. December 2024",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-wins-appreciation-award-for-its-giz-held-project-in-bangladesh",
    "title": "ICON wins Appreciation Award for its GIZ HELD Project in Bangladesh",
    "date": "2024-11-21",
    "dateLabel": "21. November 2024",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-prasentiert-sich-auf-der-fach-und-jobmesse-engagement-weltweit",
    "title": "ICON präsentiert sich auf der Fach- und Jobmesse ENGAGEMENT WELTWEIT",
    "date": "2024-10-02",
    "dateLabel": "2. October 2024",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "dg-empl-website-now-hosts-the-pespod-pioneered-by-icon",
    "title": "DG EMPL website now hosts the PESPod pioneered by ICON",
    "date": "2024-07-19",
    "dateLabel": "19. July 2024",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "msme-networking-event-organized-by-giz-and-icon-institut",
    "title": "MSME Networking Event Organized by GIZ and ICON-INSTITUT",
    "date": "2024-07-16",
    "dateLabel": "16. July 2024",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "spillover-effects-of-food-and-nutrition-security-interventions-on-non-treated-population-e",
    "title": "Spillover effects of food and nutrition security interventions on non-treated population: Evidence from Madagascar",
    "date": "2024-07-08",
    "dateLabel": "8. July 2024",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "desk-study-of-the-nexus-on-climate-nutrition-and-social-security-in-cambodia",
    "title": "Desk study of the nexus on climate, nutrition and social security in Cambodia",
    "date": "2024-05-02",
    "dateLabel": "2. May 2024",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-prasentiert-sich-auf-der-fach-und-jobmesse-engagement-weltweit-2",
    "title": "ICON präsentiert sich auf der Fach- und Jobmesse ENGAGEMENT WELTWEIT",
    "date": "2023-09-07",
    "dateLabel": "7. September 2023",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "vbi-the-imagineers",
    "title": "VBI – The Imagineers",
    "date": "2023-09-07",
    "dateLabel": "7. September 2023",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "development-of-a-curriculum-for-distance-learning-med-master-of-professional-education-at-",
    "title": "Development of a curriculum for distance learning “MEd – Master of Professional Education” at the Tashkent Institute of Chemical Technology",
    "date": "2023-02-10",
    "dateLabel": "10. February 2023",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-and-gsm-take-part-at-the-oecd-forum-on-due-diligence-in-the-garment-and-footwear-supp",
    "title": "ICON and GSM take part at the OECD Forum on Due Diligence in the Garment and Footwear Supply Chain – 15 February 2023",
    "date": "2023-01-09",
    "dateLabel": "9. January 2023",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-prasentiert-sich-auf-der-fach-und-jobmesse-engagement-weltweit-3",
    "title": "ICON präsentiert sich auf der Fach- und Jobmesse ENGAGEMENT WELTWEIT",
    "date": "2022-09-14",
    "dateLabel": "14. September 2022",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "ein-herzlicher-abend-mit-ukrainischer-musik",
    "title": "ми україна – ein herzlicher Abend mit ukrainischer Musik",
    "date": "2022-06-08",
    "dateLabel": "8. June 2022",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-expands-its-knowledge-in-circular-economy-and-sustainability-strategies",
    "title": "ICON expands its knowledge in Circular Economy and Sustainability Strategies",
    "date": "2022-05-17",
    "dateLabel": "17. May 2022",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-wird-praxispartner-der-eu-fh",
    "title": "ICON wird Praxispartner der EU FH",
    "date": "2022-05-17",
    "dateLabel": "17. May 2022",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "trade-for-employment-t4e-programme-in-jordanian-tv",
    "title": "Trade for Employment (T4E) Programme in Jordanian TV",
    "date": "2022-05-17",
    "dateLabel": "17. May 2022",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "germany-trade-invest-traide-managerfortbildungsprogramm",
    "title": "Germany Trade & Invest (trAIDe) – Managerfortbildungsprogramm",
    "date": "2022-05-16",
    "dateLabel": "16. May 2022",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-institute-drafted-a-paper-published-by-oecd",
    "title": "ICON-INSTITUTE drafted a paper published by OECD",
    "date": "2021-12-17",
    "dateLabel": "17. December 2021",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "engagement-weltweit",
    "title": "ENGAGEMENT WELTWEIT",
    "date": "2021-10-12",
    "dateLabel": "12. October 2021",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-institut-and-european-statistical-training-programme-estp",
    "title": "ICON-INSTITUT and European Statistical Training Programme (ESTP)",
    "date": "2021-05-20",
    "dateLabel": "20. May 2021",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "listen-to-pespod-the-exciting-new-podcast-from-the-pes-network",
    "title": "Listen to PESPod – the exciting new podcast from the PES Network!",
    "date": "2021-03-20",
    "dateLabel": "20. March 2021",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "youth-unemployment-territorial-trends-and-regional-resilience",
    "title": "Youth Unemployment: Territorial Trends and Regional Resilience",
    "date": "2020-03-14",
    "dateLabel": "14. March 2020",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-supports-rwanda-green-fund-fonerwa",
    "title": "ICON supports Rwanda Green Fund FONERWA",
    "date": "2020-02-13",
    "dateLabel": "13. February 2020",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "closing-ceremony-of-the-private-sector-development-programme-psd",
    "title": "Closing Ceremony of the Private Sector Development Programme (PSD)",
    "date": "2020-02-10",
    "dateLabel": "10. February 2020",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "global-forum-for-food-and-agriculture",
    "title": "GLOBAL FORUM for FOOD and AGRICULTURE",
    "date": "2020-01-23",
    "dateLabel": "23. January 2020",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "ausstellung-blue-dreams-and-fantasy-von-romain-burgy",
    "title": "Ausstellung BLUE DREAMS AND FANTASY von ROMAIN BURGY",
    "date": "2019-11-08",
    "dateLabel": "8. November 2019",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "national-marketing-strategy-for-lebanese-cherries-and-table-grapes-at-the-grand-kadri-hote",
    "title": "‘’National marketing strategy for Lebanese cherries and table grapes’’ at the Grand Kadri Hotel in Zahle",
    "date": "2019-10-09",
    "dateLabel": "9. October 2019",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "engagement-weltweit-2",
    "title": "ENGAGEMENT WELTWEIT",
    "date": "2019-10-09",
    "dateLabel": "9. October 2019",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "sector-analyses-and-strategies-for-three-economic-sectors-in-jordan",
    "title": "Sector Analyses and Strategies for Three Economic Sectors in Jordan",
    "date": "2019-10-09",
    "dateLabel": "9. October 2019",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "icon-institut-ladt-am-15-06-2019-ein-zur-autorenlesung",
    "title": "ICON-INSTITUT lädt am 15.06.2019 ein zur Autorenlesung",
    "date": "2019-07-25",
    "dateLabel": "25. July 2019",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "of-facts-and-biases",
    "title": "Of Facts and Biases",
    "date": "2019-03-20",
    "dateLabel": "20. March 2019",
    "image": "news-placeholder.jpg"
  },
  {
    "slug": "service-contract-for-measures-to-enhance-cooperation-between-public-employment-services-pe",
    "title": "Service contract for measures to enhance cooperation between Public Employment Services (PES), in particular services to implement a “Benchlearning” concept within the PES Network",
    "date": "2019-02-22",
    "dateLabel": "22. February 2019",
    "image": "news-placeholder.jpg"
  }
];

export const newsBySlug: Record<string, NewsItem> = Object.fromEntries(
  newsItems.map((item) => [item.slug, item])
);
