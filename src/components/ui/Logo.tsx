import type { SVGProps } from "react";

/**
 * The Taken A Walk mark — a walking figure, echoing the walkers in the
 * founder's own pattern art (never the "Ajayi vii" signature itself, which
 * stays his alone). Thick rounded strokes so it stays legible all the way
 * down to a 16px favicon, not just at header size.
 */
export function LogoMark({ accent = "var(--color-ink)", ...props }: SVGProps<SVGSVGElement> & { accent?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={28} height={28} {...props}>
      <g stroke={accent} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx={50} cy={18} r={10} fill={accent} stroke="none" />
        <path d="M50 30 L45 55" strokeWidth={11} />
        <path d="M45 55 L29 70 L21 87" strokeWidth={11} />
        <path d="M45 55 L59 74 L65 92" strokeWidth={11} />
        <path d="M47 33 L33 44 L25 56" strokeWidth={10} />
        <path d="M53 33 L67 46 L75 38" strokeWidth={10} />
      </g>
    </svg>
  );
}
