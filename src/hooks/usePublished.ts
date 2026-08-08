/**
 * Read published CMS content on the public site.
 *
 * Every page keeps its bundled data as the fallback, so the website renders
 * even while the request is in flight or if the CMS is offline — then swaps
 * in the live, published content as soon as it arrives. Results are cached
 * per path for the lifetime of the tab, matching how a static site behaves.
 */

import { useEffect, useState } from 'react';
import { API_ORIGIN } from '../lib/api';

const PUBLIC_BASE = `${API_ORIGIN}/api/v1/public`;

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

async function fetchPublished(path: string): Promise<unknown> {
  if (cache.has(path)) return cache.get(path);

  const pending = inflight.get(path);
  if (pending) return pending;

  const promise = fetch(`${PUBLIC_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: unknown = await response.json();
      cache.set(path, data);
      return data;
    })
    .finally(() => {
      inflight.delete(path);
    });

  inflight.set(path, promise);
  return promise;
}

/** Published content for `path` (e.g. `/news`, `/pages/home`), else `fallback`. */
export function usePublished<T>(path: string, fallback: T): T {
  const [data, setData] = useState<T>(() =>
    cache.has(path) ? (cache.get(path) as T) : fallback
  );

  useEffect(() => {
    let cancelled = false;
    fetchPublished(path)
      .then((result) => {
        if (!cancelled && result != null) setData(result as T);
      })
      .catch(() => {
        /* CMS unreachable — the bundled fallback stays on screen. */
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return data;
}

/** Imperative variant for non-component code. Resolves to null on failure. */
export async function getPublished<T>(path: string): Promise<T | null> {
  try {
    return (await fetchPublished(path)) as T;
  } catch {
    return null;
  }
}

/** Drops the tab-lifetime cache — used after CMS-side publishing in dev. */
export function clearPublishedCache(): void {
  cache.clear();
}
