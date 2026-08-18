const STROKE = {
  stroke: "var(--color-ink)",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const SHOPS = [
  { x: 20, width: 84, height: 66, fill: "var(--color-brown-soft)", roof: "var(--color-brown)" },
  { x: 128, width: 70, height: 52, fill: "var(--color-green-soft)", roof: "var(--color-green)" },
  { x: 340, width: 92, height: 70, fill: "var(--color-orange-soft)", roof: "var(--color-orange)" },
  { x: 460, width: 74, height: 56, fill: "var(--color-blue-soft)", roof: "var(--color-blue)" },
  { x: 620, width: 86, height: 62, fill: "var(--color-gold-soft)", roof: "var(--color-gold)" },
];

const GROUND_Y = 190;

function Shop({ x, width, height, fill, roof }: (typeof SHOPS)[number]) {
  const top = GROUND_Y - height;
  const apex = top - 24;
  return (
    <g>
      <polygon points={`${x - 6},${top} ${x + width / 2},${apex} ${x + width + 6},${top}`} fill={roof} {...STROKE} />
      <rect x={x} y={top} width={width} height={height} fill={fill} {...STROKE} />
      <rect x={x + width / 2 - 10} y={GROUND_Y - 28} width={20} height={28} fill="var(--color-ink)" opacity={0.85} />
      <rect x={x + 10} y={top + 12} width={16} height={16} fill="var(--color-paper)" {...STROKE} strokeWidth={1.5} />
      <rect x={x + width - 26} y={top + 12} width={16} height={16} fill="var(--color-paper)" {...STROKE} strokeWidth={1.5} />
    </g>
  );
}

function PackageGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={26} height={22} fill="var(--color-cream-soft)" {...STROKE} strokeWidth={1.75} />
      <line x1={13} y1={0} x2={13} y2={22} {...STROKE} strokeWidth={1.75} stroke="var(--color-red)" />
      <line x1={0} y1={11} x2={26} y2={11} {...STROKE} strokeWidth={1.75} stroke="var(--color-red)" />
    </g>
  );
}

function FoodGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M2 10 Q14 22 26 10 L24 14 Q14 24 4 14 Z" fill="var(--color-orange-soft)" {...STROKE} strokeWidth={1.75} />
      <path d="M8 6 Q9 2 7 -2 M14 6 Q15 2 13 -2 M20 6 Q21 2 19 -2" fill="none" {...STROKE} strokeWidth={1.5} stroke="var(--color-brown)" />
    </g>
  );
}

function PosGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={22} height={28} rx={4} fill="var(--color-paper)" {...STROKE} strokeWidth={1.75} />
      <rect x={3} y={4} width={16} height={9} fill="var(--color-blue-soft)" {...STROKE} strokeWidth={1.25} />
      <line x1={5} y1={19} x2={17} y2={19} {...STROKE} strokeWidth={1.5} />
      <line x1={5} y1={23} x2={12} y2={23} {...STROKE} strokeWidth={1.5} />
    </g>
  );
}

function Walker({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} ${GROUND_Y - 78})`}>
      <circle cx={16} cy={6} r={7} fill="var(--color-cream-soft)" {...STROKE} strokeWidth={2} />
      <path
        d="M16 13 L14 40 M4 22 L15 18 L28 26 M14 40 L4 62 M14 40 L26 58"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x={20} y={16} width={12} height={14} rx={2} fill="var(--color-green)" {...STROKE} strokeWidth={1.5} />
    </g>
  );
}

/** A subtle strip of the neighborhood — shops, packages, food, POS, and someone walking. */
export function NeighborhoodScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 760 220" className={className} role="img" aria-label="A person walking through the Piwoyi neighborhood, past shops and vendors">
      <line x1={0} y1={GROUND_Y} x2={760} y2={GROUND_Y} stroke="var(--color-ink)" strokeWidth={2.5} strokeLinecap="round" />
      {SHOPS.map((shop) => (
        <Shop key={shop.x} {...shop} />
      ))}
      <PackageGlyph x={250} y={60} />
      <FoodGlyph x={555} y={70} />
      <PosGlyph x={40} y={40} />
      <Walker x={230} />
    </svg>
  );
}
