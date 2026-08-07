export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalPage = {
  slug: string;
  title: string;
  sections: LegalSection[];
};

export const privacyPolicy: LegalPage = {
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  sections: [
    {
      title: 'Introduction',
      paragraphs: [
        'The ICON-INSTITUTE Consulting Gruppe (the companies belonging thereto are listed under “Impressum”) gives utmost importance to your personal data. In the following we inform you on how we deal with data you provide us with. Our privacy policy is based on the European General Data Protection Regulation (GDPR) and the German Federal Data Protection Law (DS-GVO). Please read the following policy carefully and do contact us with any questions or concerns about our privacy policy practices.',
      ],
    },
    {
      title: 'Who we are?',
      paragraphs: [
        'Responsible for the Privacy Policy within the meaning of the GDPR:',
        'ICON-INSTITUTE GmbH & Co. KG Consulting Gruppe',
        'Holger Thoma',
        'Von-Groote-Str. 28',
        '50968 Köln',
        'Germany',
      ],
    },
    {
      title: 'Overview',
      paragraphs: [
        'During your visit to our website we only collect data and use “session cookies” when you apply for a job. These cookies are stored on your access device and are used to improve the user-friendliness of our job base. We use no Google Analytics or any similar software. Otherwise, our website is static.',
      ],
    },
    {
      title: 'Personal Data',
      paragraphs: [
        'By contacting us directly or registering as a potential expert candidate, you provide us with your consent in processing your data in these contexts. The collected data therein is stored until you request for it to be withdrawn or deleted. You may revoke this at any time in the future in written by post or email to icon@icon-institute.de.',
      ],
    },
    {
      title: 'What are your rights?',
      paragraphs: [
        'You are always entitled to request information on which data has been stored on your person, where it came from, who it is being sent to and for what purpose we collect the data. As stipulated in the GDPR, you are also entitled to ask for corrections to be made or for the deletion of the very same data. For this, please contact us by post or email: icon@icon-institute.de. Of course, you are also entitled to file a complaint with the regulatory authorities.',
      ],
    },
    {
      title: 'Data processing revocation',
      paragraphs: [
        'Data processing operation is only allowed with your expressed consent, which you may revoke at any time with future effect by contacting us in written, be it by post or email (icon@icon-institute.de). Please specify which processed data you wish to revoke. Any data processed before we receive your request can still be legally processed.',
      ],
    },
    {
      title: 'Linking to other websites / third party content',
      paragraphs: [
        'Links to external sites and resources from our website, does not constitute endorsement, and we take no responsibility for the content (or information contained within).',
      ],
    },
  ],
};

export const impressum: LegalPage = {
  slug: 'impressum',
  title: 'Impressum',
  sections: [
    {
      title: 'Inhaber des Unternehmens',
      paragraphs: [
        'ICON-INSTITUTE GmbH & Co. KG Consulting Gruppe, Deutschland',
        'E-Mail-Adresse: icon@icon-institute.de',
        'Telefonnummer: +49 221 937430',
      ],
    },
    {
      title: 'Verantwortlich für den Inhalt',
      paragraphs: ['Dr. Tanja Lingohr'],
    },
    {
      title: 'Online-Streitbeilegung',
      paragraphs: [
        'Plattform der Europäischen Kommission zur Online-Streitbeilegung (OS) für Verbraucher: https://ec.europa.eu/consumers/odr/.',
        'Wir sind nicht bereit und nicht verpflichtet an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
      ],
    },
    {
      title: 'Images source',
      paragraphs: [
        '02.10.19 14:30 © REUTERS / PHILIMON BULAWAYO #215615658',
        '01.10.19 13:14 © Konstiantyn Zapylaie #250495090',
        '01.10.19 13:09 © pressmaster #139565323',
        '01.10.19 12:17 © poco_bw #10664551',
        '01.10.19 12:16 © Sylvie Bouchard #49440215',
        '01.10.19 12:14 © ah_fotobox #92981672',
        '01.10.19 12:05 © TheFinalMiracle #14145083',
        '01.10.19 12:04 © poco_bw #189884034',
        '08.10.19 06:53 © bizoo_n #114844867',
        '07.10.19 12:11 © wellphoto #224685816',
        '01.10.19 11:52 © djile #230411417',
        '01.10.19 11:51 © Poh Smith #285502370',
        '01.10.19 11:50 © fotoluk1983 #104514976',
        '01.10.19 09:41 © Rawpixel.com #105298759',
        '01.10.19 09:39 © Syda Productions #104176946',
        '01.10.19 09:37 © vinnstock #67751339',
        '01.10.19 09:36 © Alistair Cotton #48880711',
        '01.10.19 09:35 © ramirezom #266673473',
        '12.08.19 14:14 © Peera #219490244',
        '12.08.19 14:12 © ndoeljindoel #47543232',
        '12.08.19 14:10 © Frank Gärtner #110801033',
      ],
    },
  ],
};

export const legalPages: LegalPage[] = [privacyPolicy, impressum];

export const legalBySlug: Record<string, LegalPage> = Object.fromEntries(
  legalPages.map((page) => [page.slug, page])
);
