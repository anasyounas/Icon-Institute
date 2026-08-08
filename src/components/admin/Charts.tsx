import { useId, useState } from 'react';

/**
 * Chart primitives for the CMS dashboard.
 *
 * Palette note: the site's lime accent measures ~1.5:1 on white and cannot
 * carry a data mark, so charts use their own validated categorical set
 * (--chart-1..3). Lime stays the interface accent. Aqua (--chart-3) sits at
 * 2.82:1, below the 3:1 bar, so every chart here ships direct value labels and
 * the same figures appear in a table on the page.
 *
 * Bars use one hue: length already encodes magnitude. Categorical hues appear
 * only where the series themselves are the subject (the stage mix).
 */

const fmt = new Intl.NumberFormat('en-GB');

/* ------------------------------------------------------------------ BarList */

export type BarDatum = {
  label: string;
  value: number;
  /** Optional override, else the formatted value is shown. */
  display?: string;
};

export function BarList({
  data,
  caption,
  emptyLabel = 'No data for the current filters.',
}: {
  data: BarDatum[];
  caption: string;
  emptyLabel?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return <p className="chart-empty">{emptyLabel}</p>;
  }

  return (
    <ul className="bar-list" aria-label={caption}>
      {data.map((d) => (
        <li key={d.label} className="bar-list__row">
          <span className="bar-list__label" title={d.label}>
            {d.label}
          </span>
          <span className="bar-list__track">
            <span
              className="bar-list__fill"
              style={{ width: `${Math.max((d.value / max) * 100, 1.5)}%` }}
            />
          </span>
          <span className="bar-list__value">{d.display ?? fmt.format(d.value)}</span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------- ColumnChart */

export type ColumnDatum = { label: string; value: number };

export function ColumnChart({
  data,
  caption,
  unit = '',
}: {
  data: ColumnDatum[];
  caption: string;
  unit?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const titleId = useId();

  if (data.length === 0) {
    return <p className="chart-empty">No data for the current filters.</p>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  // Round the axis top to something readable rather than the raw max.
  const step = max <= 5 ? 1 : max <= 20 ? 5 : max <= 50 ? 10 : 25;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);

  return (
    <div className="column-chart">
      <div className="column-chart__plot" role="img" aria-labelledby={titleId}>
        <span id={titleId} className="sr-only">
          {caption}
        </span>

        <div className="column-chart__grid" aria-hidden="true">
          {[...ticks].reverse().map((t) => (
            <div key={t} className="column-chart__gridline">
              <span className="column-chart__tick">{t}</span>
            </div>
          ))}
        </div>

        <div className="column-chart__cols">
          {data.map((d, i) => (
            <div
              key={d.label}
              className={`column-chart__col ${hover === i ? 'is-hovered' : ''}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              aria-label={`${d.label}: ${fmt.format(d.value)}${unit ? ' ' + unit : ''}`}
            >
              <span className="column-chart__bar-wrap">
                <span
                  className="column-chart__bar"
                  style={{ height: `${(d.value / top) * 100}%` }}
                />
                {hover === i && (
                  <span className="column-chart__tip" role="status">
                    <strong>{fmt.format(d.value)}</strong>
                    {unit ? ` ${unit}` : ''}
                  </span>
                )}
              </span>
              <span className="column-chart__x">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- StackedBar */

export type StackSegment = { label: string; value: number };

/** Part-to-whole across a small, fixed set of stages. */
export function StackedBar({
  segments,
  caption,
}: {
  segments: StackSegment[];
  caption: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <p className="chart-empty">No items in the workflow.</p>;
  }

  return (
    <div className="stacked-bar" aria-label={caption}>
      <div className="stacked-bar__track">
        {segments.map((s, i) => {
          if (s.value === 0) return null;
          const pct = (s.value / total) * 100;
          return (
            <div
              key={s.label}
              className={`stacked-bar__seg stacked-bar__seg--${i + 1}`}
              style={{ width: `${pct}%` }}
              title={`${s.label}: ${s.value}`}
            >
              {pct >= 14 && <span className="stacked-bar__seg-value">{s.value}</span>}
            </div>
          );
        })}
      </div>
      <ul className="stacked-bar__legend">
        {segments.map((s, i) => (
          <li key={s.label}>
            <span
              className={`stacked-bar__swatch stacked-bar__swatch--${i + 1}`}
              aria-hidden="true"
            />
            {s.label}
            <strong>{s.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- Sparkline */

export function Sparkline({ values, label }: { values: number[]; label: string }) {
  if (values.length < 2) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const w = 100;
  const h = 28;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
