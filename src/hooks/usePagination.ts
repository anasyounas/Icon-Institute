import { useState } from 'react';

export const PAGE_SIZE = 20;

/**
 * Client-side pagination over an already-filtered list.
 *
 * `resetKey` should encode the active filters — when it changes the view jumps
 * back to page 1, so narrowing a filter never leaves you stranded on a page
 * that no longer exists. State is adjusted during render (React's supported
 * pattern for deriving state from changing inputs) rather than in an effect,
 * which avoids a second render pass.
 */
export function usePagination<T>(
  items: T[],
  { pageSize = PAGE_SIZE, resetKey = '' }: { pageSize?: number; resetKey?: string } = {}
) {
  const [page, setPage] = useState(1);
  const [lastKey, setLastKey] = useState(resetKey);

  if (resetKey !== lastKey) {
    setLastKey(resetKey);
    setPage(1);
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Clamp rather than trust stored state: the list can shrink under us.
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * pageSize;
  const end = Math.min(start + pageSize, total);

  return {
    page: current,
    totalPages,
    pageItems: items.slice(start, start + pageSize),
    setPage,
    /** 1-based index of the first item shown. */
    from: total === 0 ? 0 : start + 1,
    /** 1-based index of the last item shown. */
    to: end,
    total,
    pageSize,
  };
}
