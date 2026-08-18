import type { ReactNode } from "react";

type Tone = "green" | "brown" | "orange" | "blue" | "red" | "gold" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-green-soft text-green",
  brown: "bg-brown-soft text-brown",
  orange: "bg-orange-soft text-orange",
  blue: "bg-blue-soft text-blue",
  red: "bg-red-soft text-red",
  gold: "bg-gold-soft text-gold",
  neutral: "bg-ink/5 text-ink-soft",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
