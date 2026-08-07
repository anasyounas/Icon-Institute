export type ContactFormField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea';
  required: boolean;
};

export type ContactPage = {
  title: string;
  privacyNote: string;
  captchaNote: string;
  captchaNoteDe: string;
  fields: ContactFormField[];
  company: {
    name: string;
    addressLines: string[];
    phone: string;
    fax: string;
    email: string;
    website: string;
  };
};

export const contactPage: ContactPage = {
  title: 'Contact Us',
  privacyNote:
    'This form saves your name, your address and the content of the message so that we can answer accordingly. For further information, please check our privacy policy.',
  captchaNote:
    'Please prove that you are not a robot by clicking on the required symbol.',
  captchaNoteDe:
    'Bitte beweise, dass du kein Spambot bist und wähle das Symbol Haus.',
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'address', label: 'Address', type: 'text', required: false },
    { name: 'subject', label: 'Subject', type: 'text', required: false },
    { name: 'message', label: 'Message', type: 'textarea', required: true },
  ],
  company: {
    name: 'ICON-INSTITUTE GmbH & Co. KG Consulting Gruppe',
    addressLines: ['Von-Groote-Straße 28', '50968 Köln', 'Germany'],
    phone: '+49 221 93 743 0',
    fax: '+49 221 93 743 5',
    email: 'icon@icon-institute.de',
    website: 'www.icon-institute.de',
  },
};
