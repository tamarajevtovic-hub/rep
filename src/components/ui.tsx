import type { ReactNode } from 'react';
import { SPRITES } from '../lib/animals';
import { ANIMAL_LABELS } from '../lib/i18n';
import { useT } from '../lib/store';
import type { AnimalId } from '../lib/types';

export function Sprite({ animal, px = 6, sleepy = false }: { animal: AnimalId; px?: number; sleepy?: boolean }) {
  const { lang } = useT();
  const s = SPRITES[animal];
  const w = s.rows[0].length;
  const h = s.rows.length;
  const rects: ReactNode[] = [];
  s.rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const c = s.pal[ch];
      if (c) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={c} />);
    });
  });
  return (
    <span className={sleepy ? 'sprite sleepy' : 'sprite'}>
      <svg width={w * px} height={h * px} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" role="img" aria-label={ANIMAL_LABELS[lang][animal]}>
        {rects}
      </svg>
      {sleepy && <span className="zzz" aria-hidden="true">z</span>}
    </span>
  );
}

export function Chips<T extends string>({
  options, selected, labels, onToggle, variant = 'multi',
}: {
  options: T[];
  selected: T[];
  labels: Record<T, string>;
  onToggle: (v: T) => void;
  variant?: 'multi' | 'single';
}) {
  return (
    <div className={variant === 'single' ? 'chips grid2' : 'chips'}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={selected.includes(o)}
          className={`chip ${selected.includes(o) ? (variant === 'single' ? 'on-pink' : 'on') : ''}`}
          onClick={() => onToggle(o)}
        >
          {labels[o]}
        </button>
      ))}
    </div>
  );
}

export function Icon({ name }: { name: 'home' | 'plan' | 'sanctuary' | 'me' | 'back' | 'check' | 'info' | 'trash' }) {
  const paths: Record<string, ReactNode> = {
    home: <path d="M3 9l7-6 7 6v8H3z" />,
    plan: (
      <>
        <rect x="3" y="4" width="14" height="13" />
        <path d="M3 8h14M7 2v4M13 2v4" />
      </>
    ),
    sanctuary: <path d="M3 17V8l7-5 7 5v9M8 17v-5h4v5" />,
    me: (
      <>
        <circle cx="10" cy="7" r="4" />
        <path d="M3 18c1-4 4-5 7-5s6 1 7 5" />
      </>
    ),
    back: <path d="M12 4l-6 6 6 6" />,
    check: <path d="M4 10l4 4 8-8" />,
    info: (
      <>
        <circle cx="10" cy="10" r="8" />
        <path d="M10 9v5M10 6v.5" />
      </>
    ),
    trash: <path d="M4 6h12M8 6V3h4v3M6 6l1 11h6l1-11" />,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={name === 'check' ? 3 : 2}>
      {paths[name]}
    </svg>
  );
}

export function KeyBar({ have, total }: { have: number; total: number }) {
  return (
    <div className="keybar" role="img" aria-label={`${have} od ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={i < have ? 'key on' : 'key'} />
      ))}
    </div>
  );
}
