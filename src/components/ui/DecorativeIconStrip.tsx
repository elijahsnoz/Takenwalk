import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { accent?: string };

const STROKE = {
  stroke: "var(--color-ink)",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

/** Deterministic point on a circle — used to build the spiral/star/flower glyphs without hand-guessed bezier curves. */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

function spiralPath(cx: number, cy: number, turns: number, maxR: number, steps = 60) {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * turns * 360;
    const r = t * maxR;
    const [x, y] = polar(cx, cy, r, angle);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function starPoints(cx: number, cy: number, outerR: number, innerR: number, points = 5) {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const [x, y] = polar(cx, cy, r, (i * 180) / points - 90);
    coords.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return coords.join(" ");
}

export function SpiralIcon({ accent = "var(--color-blue)", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} {...props}>
      <path d={spiralPath(12, 12, 2.4, 9)} {...STROKE} stroke={accent} />
    </svg>
  );
}

export function BirdIcon({ accent = "var(--color-ink)", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} {...props}>
      <path d="M2 13 Q6 5,10 12 Q12 7,14 12 Q18 5,22 13" {...STROKE} stroke={accent} />
    </svg>
  );
}

export function FlowerIcon({ accent = "var(--color-red)", ...props }: IconProps) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} {...props}>
      {petals.map((angle) => {
        const [cx, cy] = polar(12, 12, 5, angle);
        return <ellipse key={angle} cx={cx} cy={cy} rx={4} ry={2.6} transform={`rotate(${angle} ${cx} ${cy})`} {...STROKE} stroke={accent} />;
      })}
      <circle cx={12} cy={12} r={2.6} {...STROKE} fill="var(--color-gold)" />
    </svg>
  );
}

export function WalkingFigureIcon({ accent = "var(--color-ink)", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} {...props}>
      <circle cx={13} cy={4.2} r={2.1} {...STROKE} stroke={accent} />
      <path d="M13 6.5 L12 14 M7 10 L12 8.5 L17.5 11 M12 14 L8 21 M12 14 L16.5 20" {...STROKE} stroke={accent} />
    </svg>
  );
}

export function TreeIcon({ accent = "var(--color-green)", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} {...props}>
      <path d="M12 3 L18 11 H14.5 L19 17 H5 L9.5 11 H6 Z" {...STROKE} stroke={accent} />
      <line x1={12} y1={17} x2={12} y2={21.5} {...STROKE} stroke={accent} />
    </svg>
  );
}

export function FishIcon({ accent = "var(--color-blue)", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} {...props}>
      <path d="M3 12c3-4 8-6 12-4.5C18 9 18 15 15 16.5 11 18 6 16 3 12Z" {...STROKE} stroke={accent} />
      <path d="M15 12 L21 8.5 M15 12 L21 15.5" {...STROKE} stroke={accent} />
      <circle cx={7.5} cy={11} r={0.7} fill={accent} stroke="none" />
    </svg>
  );
}

export function HourglassIcon({ accent = "var(--color-brown)", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} {...props}>
      <path d="M6 3h12 M6 21h12 M6 3c0 5 5 6.5 6 8-1 1.5-6 3-6 8 M18 3c0 5-5 6.5-6 8 1 1.5 6 3 6 8" {...STROKE} stroke={accent} />
    </svg>
  );
}

export function StarIcon({ accent = "var(--color-gold)", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} {...props}>
      <polygon points={starPoints(12, 12, 8.5, 3.6)} {...STROKE} stroke={accent} strokeLinejoin="round" />
    </svg>
  );
}

export function HeartIcon({ accent = "var(--color-red)", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} {...props}>
      <path
        d="M12 20s-7.5-4.7-10.1-9.4C.4 7.6 1.6 4.4 4.7 3.4c2-.6 4 .1 5.3 1.9L12 7.5l2-2.2c1.3-1.8 3.3-2.5 5.3-1.9 3.1 1 4.3 4.2 2.8 7.2C19.5 15.3 12 20 12 20Z"
        {...STROKE}
        stroke={accent}
      />
    </svg>
  );
}

export function RadioIcon({ accent = "var(--color-brown)", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} {...props}>
      <rect x={3} y={9} width={18} height={10} rx={2} {...STROKE} stroke={accent} />
      <circle cx={8} cy={14} r={2.3} {...STROKE} stroke={accent} />
      <circle cx={16} cy={14} r={2.3} {...STROKE} stroke={accent} />
      <path d="M7 9 L9 4 M17 9 L15 4" {...STROKE} stroke={accent} />
    </svg>
  );
}

const ICONS = [SpiralIcon, BirdIcon, FlowerIcon, WalkingFigureIcon, TreeIcon, FishIcon, HourglassIcon, StarIcon, HeartIcon, RadioIcon];
const ACCENTS = [
  "var(--color-green)",
  "var(--color-brown)",
  "var(--color-orange)",
  "var(--color-blue)",
  "var(--color-red)",
  "var(--color-gold)",
];

/**
 * A repeating row of original hand-drawn-style glyphs (spirals, birds, flowers, walking
 * figures — in the spirit of the founder's own "Ajayi vii" pattern art, not a copy of it).
 * Reused as a header accent across the homepage, dashboard, and empty states.
 */
export function DecorativeIconStrip({ count = 14, className = "" }: { count?: number; className?: string }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className={`flex items-center gap-5 overflow-hidden ${className}`} aria-hidden="true">
      {items.map((i) => {
        const Icon = ICONS[i % ICONS.length];
        const accent = ACCENTS[i % ACCENTS.length];
        const tilt = ((i % 5) - 2) * 4;
        return (
          <span key={i} className="shrink-0" style={{ transform: `rotate(${tilt}deg)` }}>
            <Icon accent={accent} />
          </span>
        );
      })}
    </div>
  );
}
