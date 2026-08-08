/**
 * Page navigation. Renders nothing when everything fits on one page, so it can
 * be wired into every list and simply activates once a dataset outgrows the
 * page size.
 */

/** Page numbers around `page`, with `null` marking an ellipsis gap. */
function pageWindow(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const out: (number | null)[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(totalPages - 1, page + 1);

  if (from > 2) out.push(null);
  for (let i = from; i <= to; i++) out.push(i);
  if (to < totalPages - 1) out.push(null);

  out.push(totalPages);
  return out;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  from,
  to,
  total,
  label = 'items',
  scrollToId,
  variant = 'site',
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  from: number;
  to: number;
  total: number;
  /** Plural noun for the summary line, e.g. "articles". */
  label?: string;
  /** Element scrolled into view after changing page. */
  scrollToId?: string;
  variant?: 'site' | 'admin';
}) {
  if (totalPages <= 1) return null;

  const go = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), totalPages);
    if (clamped === page) return;
    onChange(clamped);

    if (scrollToId) {
      const el = document.getElementById(scrollToId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      className={`pagination pagination--${variant}`}
      aria-label="Pagination"
    >
      <p className="pagination__summary" aria-live="polite">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of{' '}
        <strong>{total}</strong> {label}
      </p>

      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__btn"
          onClick={() => go(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pageWindow(page, totalPages).map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className="pagination__gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination__btn ${p === page ? 'is-current' : ''}`}
              onClick={() => go(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className="pagination__btn"
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </nav>
  );
}
