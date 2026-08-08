import type { SVGProps } from 'react';

/**
 * Stroke-based icon set (24x24, currentColor) in the style used across the
 * site's cards, footer and hero badge. Icons are decorative: callers pass
 * aria-hidden and keep the adjacent text as the accessible label.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------------- services */

export function CompassIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1z" />
    </Svg>
  );
}

export function LightbulbIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8.9.9 1.5l.1.7h5.2l.1-.7c.1-.6.4-1.1.9-1.5A6 6 0 0 0 12 3Z" />
    </Svg>
  );
}

export function GraduationCapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4 2 9l10 5 10-5-10-5Z" />
      <path d="M6 11.5V17c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-5.5" />
      <path d="M21 9.5V15" />
    </Svg>
  );
}

/* --------------------------------------------------------------- expertise */

export function BarChartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <rect x="7" y="11" width="3" height="6" rx="1" />
      <rect x="12.5" y="7" width="3" height="10" rx="1" />
      <rect x="18" y="4" width="3" height="13" rx="1" />
    </Svg>
  );
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M14 8h6v6" />
    </Svg>
  );
}

export function LandmarkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 21h18" />
      <path d="M4 10h16" />
      <path d="M12 3 3 8h18l-9-5Z" />
      <path d="M7 10v8M12 10v8M17 10v8" />
    </Svg>
  );
}

export function SproutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21v-8" />
      <path d="M12 13C12 9.7 9.3 7 6 7H4v1c0 3.3 2.7 6 6 6h2Z" />
      <path d="M12 13c0-2.8 2.2-5 5-5h3v.5c0 2.8-2.2 5-5 5h-3Z" />
    </Svg>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 20c0-8 5-14 16-14 0 9-4.5 14-11 14a5 5 0 0 1-5-5Z" />
      <path d="M9 15c2-3.5 4.7-5.7 8-7" />
    </Svg>
  );
}

/* ------------------------------------------------------------------ footer */

export function PhoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15.5 21A12.5 12.5 0 0 1 3 8.5 2.5 2.5 0 0 1 5.5 6h1.6c.5 0 .9.3 1 .8l.7 2.6c.1.4 0 .8-.4 1.1l-1.2.9a10 10 0 0 0 4.4 4.4l.9-1.2c.3-.4.7-.5 1.1-.4l2.6.7c.5.1.8.5.8 1v1.6A2.5 2.5 0 0 1 15.5 21Z" />
    </Svg>
  );
}

export function PrinterIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 9V3h10v6" />
      <path d="M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="15" width="10" height="6" rx="1" />
    </Svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3.5 7 7.4 5.3c.7.5 1.5.5 2.2 0L20.5 7" />
    </Svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9h17M3.5 15h17" />
      <path d="M12 3c2.5 2.4 3.8 5.5 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.5-3.8-9S9.5 5.4 12 3Z" />
    </Svg>
  );
}

/* ------------------------------------------------------- project fact icons */

/** The six facts a reference project page states: period, country, expertise,
 *  volume, financing and client. */

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
    </Svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="7" width="19" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M2.5 12.5h19" />
    </Svg>
  );
}

export function CoinsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <ellipse cx="9" cy="6.5" rx="6" ry="2.75" />
      <path d="M3 6.5v5c0 1.5 2.7 2.75 6 2.75s6-1.25 6-2.75v-5" />
      <path d="M15 12.2c3 .3 6 1.4 6 2.8v3c0 1.5-2.7 2.75-6 2.75s-6-1.25-6-2.75V17" />
    </Svg>
  );
}

export function BankIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V10M10 21V10M14 21V10M19 21V10" />
      <path d="M12 3 3 7.5h18L12 3Z" />
    </Svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.5a3.25 3.25 0 0 1 0 6.3" />
      <path d="M17.5 14.5A6.5 6.5 0 0 1 21.5 20" />
    </Svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v12" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4 19h16" />
    </Svg>
  );
}

/* --------------------------------------------------------------- interface */

export function SparkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    </Svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}
