export type DemoRole = 'Administrator' | 'Editor' | 'Publisher' | 'Viewer';

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: DemoRole;
  twoFactorEnabled: boolean;
};

/** Frontend-only demo credentials — not connected to a real backend. */
export const DEMO_USERS: DemoUser[] = [
  {
    id: 'u1',
    name: 'CMS Administrator',
    email: 'admin@icon-institute.de',
    password: 'demo2026',
    role: 'Administrator',
    twoFactorEnabled: true,
  },
  {
    id: 'u2',
    name: 'Content Editor',
    email: 'editor@icon-institute.de',
    password: 'editor2026',
    role: 'Editor',
    twoFactorEnabled: false,
  },
  {
    id: 'u3',
    name: 'Publisher',
    email: 'publisher@icon-institute.de',
    password: 'publish2026',
    role: 'Publisher',
    twoFactorEnabled: true,
  },
];

export const DEMO_CREDENTIALS_HINT =
  'admin@icon-institute.de / demo2026';
