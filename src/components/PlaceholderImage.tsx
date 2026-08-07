import { useState } from 'react';

type Props = {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
};

/** Loads `/images/...` when present; otherwise shows a labeled placeholder. */
export function PlaceholderImage({
  src,
  alt,
  className = '',
  aspectRatio = '16 / 9',
}: Props) {
  const [failed, setFailed] = useState(false);
  const path = src.startsWith('/') ? src : `/images/${src}`;
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
