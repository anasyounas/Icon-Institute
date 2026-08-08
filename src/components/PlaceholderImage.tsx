import { useState } from 'react';
import { assetUrl } from '../lib/api';

type Props = {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
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
}: Props) {
  const [failed, setFailed] = useState(false);
  const path = /^(https?:|data:)/.test(src)
    ? src
    : src.startsWith('/media/')
      ? assetUrl(src)
      : src.startsWith('/')
        ? src
        : `/images/${src}`;
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
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
