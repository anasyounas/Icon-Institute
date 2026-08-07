import { PlaceholderImage } from './PlaceholderImage';

type Props = {
  title: string;
  image?: string;
  compact?: boolean;
  imageAlt?: string;
};

export function PageHero({
  title,
  image,
  compact,
  imageAlt = '',
}: Props) {
  return (
    <section
      className={`page-hero ${compact ? 'page-hero--compact' : ''}`}
      aria-labelledby="page-hero-title"
    >
      {image && (
        <div className="page-hero__media">
          <PlaceholderImage
            src={image}
            alt={imageAlt}
            className="page-hero__img"
          />
          <div className="page-hero__overlay" aria-hidden="true" />
        </div>
      )}
      <div className="container page-hero__content">
        <h1 id="page-hero-title">{title}</h1>
      </div>
    </section>
  );
}
