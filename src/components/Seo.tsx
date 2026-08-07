import { useEffect } from 'react';
import { siteSeo, type PageSeo } from '../data/seo';

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string
) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

type SeoProps = Partial<PageSeo> & {
  title: string;
  description: string;
  path: string;
  jsonLd?: object | object[];
};

export function Seo({
  title,
  description,
  path,
  image = siteSeo.defaultImage,
  type = 'website',
  noindex = false,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const url = `${siteSeo.siteUrl}${path === '/' ? '' : path}`;
    const absoluteImage = image.startsWith('http')
      ? image
      : `${siteSeo.siteUrl}${image}`;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta(
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow'
    );
    upsertLink('canonical', url);

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', absoluteImage);
    upsertMeta('property', 'og:site_name', siteSeo.siteName);
    upsertMeta('property', 'og:locale', siteSeo.locale);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', absoluteImage);

    const schema = jsonLd
      ? Array.isArray(jsonLd)
        ? jsonLd
        : [jsonLd]
      : [siteSeo.organization];
    upsertJsonLd('page-jsonld', schema.length === 1 ? schema[0] : schema);
  }, [title, description, path, image, type, noindex, jsonLd]);

  return null;
}
