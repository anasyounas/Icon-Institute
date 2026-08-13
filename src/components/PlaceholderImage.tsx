import { useState } from 'react';
import { assetUrl } from '../lib/api';

type Props = {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  /** Heroes should pass `"eager"`; default stays lazy for below-fold cards. */
  loading?: 'lazy' | 'eager';
};

/**
 * Resolves bundled `/images/...` paths, CMS media (`/media/...`, served by the
 * backend) and absolute URLs; shows a labeled placeholder when loading fails.
 */
export function PlaceholderImage({
  src,
  alt,
  className = '',
  aspectRatio = '16 / 9',
  loading = 'lazy',
}: Props) {
  const path = assetUrl(src);
  // Track which URL failed so a later CMS `/media/...` src can recover
  // after the bundled `/images/...` fallback 404'd on first paint.
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const failed = failedPath === path;
  const filename = path.split('/').pop() ?? src;

  if (failed) {
    return (
      <div
        className={`img-placeholder ${className}`}
        style={{ aspectRatio }}
        role="img"
        aria-label={alt || filename}
      >
        <span className="img-placeholder__name">{filename}</span>
        <span className="img-placeholder__hint">{alt || 'Image placeholder'}</span>
      </div>
    );
  }

  return (
    <img
      src={path}
      alt={alt}
      className={className}
      onError={() => setFailedPath(path)}
      loading={loading}
    />
  );
}
