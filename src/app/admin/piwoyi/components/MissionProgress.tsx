import { HandDrawnFrame } from "@/components/ui/Card";

export function MissionProgress({ mapped, target }: { mapped: number; target: number }) {
  const pct = Math.min(100, Math.round((mapped / target) * 100));

  return (
    <HandDrawnFrame className="p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-green">Put Piwoyi on the Map</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">
        {mapped} / {target} businesses mapped
      </p>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-green transition-all" style={{ width: `${pct}%` }} />
      </div>
    </HandDrawnFrame>
  );
}
