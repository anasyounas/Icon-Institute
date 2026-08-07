import { PlaceholderImage } from './PlaceholderImage';

type Props = {
  title: string;
  image?: string;
  compact?: boolean;
};

export function PageHero({ title, image, compact }: Props) {
  return (
    <section className={`page-hero ${compact ? 'page-hero--compact' : ''}`}>
      {image && (
        <div className="page-hero__media">
          <PlaceholderImage src={image} alt="" className="page-hero__img" />
          <div className="page-hero__overlay" />
        </div>
      )}
      <div className="container page-hero__content">
        <h1>{title}</h1>
      </div>
    </section>
  );
}
