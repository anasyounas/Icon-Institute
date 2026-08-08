import { useEffect, useRef } from 'react';

/**
 * Adds `is-revealed` to descendants marked with `data-reveal` as they scroll
 * into view, driving the fade-up animation in index.css.
 *
 * Elements start hidden via CSS only when the browser supports IntersectionObserver
 * and the user hasn't asked for reduced motion — otherwise `.reveal-ready` is
 * never set on the root, so content stays visible with no animation at all.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    // Only now is it safe to hide things — the observer will reveal them.
    root.classList.add('reveal-ready');

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>('[data-reveal]')
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay ?? 0);
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('is-revealed');
          observer.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );

    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
