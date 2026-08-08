import { Fragment, type ReactNode } from 'react';

/**
 * Renders the light formatting the institute's articles use — bold, italics
 * and links — from a plain-text paragraph.
 *
 * Editors write `**bold**`, `*italic*` and `[text](https://…)`. The result is
 * built as React elements rather than injected as HTML, so nothing an editor
 * types can inject markup into the page.
 */

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/** Only these schemes may become a link. */
function safeHref(href: string): string | null {
  if (/^(https?:\/\/|mailto:|\/)/i.test(href)) return href;
  return null;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(TOKEN).filter(Boolean).map((part, i) => {
    const key = `${keyPrefix}-${i}`;

    const link = LINK.exec(part);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return <Fragment key={key}>{link[1]}</Fragment>;
      const external = /^https?:\/\//i.test(href);
      return (
        <a
          key={key}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {link[1]}
        </a>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

/** One paragraph with inline formatting. */
export function RichText({ text }: { text: string }) {
  return <>{renderInline(text, 't')}</>;
}

/** A list of paragraphs, each with inline formatting. */
export function RichParagraphs({
  paragraphs,
  className,
}: {
  paragraphs: string[];
  className?: string;
}) {
  return (
    <>
      {paragraphs
        .filter((p) => p.trim())
        .map((paragraph, i) => (
          <p key={i} className={className}>
            {renderInline(paragraph, `p${i}`)}
          </p>
        ))}
    </>
  );
}
