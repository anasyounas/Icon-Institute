import { useEffect, useState } from 'react';
import { PlaceholderImage } from './PlaceholderImage';

type Props = {
  logos: { src: string; alt: string }[];
};

/**
 * Fading logo carousel matching the original About Us memberships slider
 * (autoplay, no nav dots).
 */
export function MembershipLogoSlider({ logos }: Props) {
  const slides = logos.filter((l) => l.src);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="memberships__slider" aria-label="Membership logos">
      {slides.map((logo, i) => (
        <div
          key={`${logo.src}-${i}`}
          className={`memberships__slide${i === index ? ' is-active' : ''}`}
          aria-hidden={i !== index}
        >
          <PlaceholderImage
            src={logo.src}
            alt={logo.alt}
            className="memberships__logo"
            aspectRatio="400 / 164"
          />
        </div>
      ))}
    </div>
  );
}
