import type { VisitorLocationStatus } from "@/components/map/useVisitorLocation";

const LABELS: Record<VisitorLocationStatus, string> = {
  idle: "📍 Use My Location",
  requesting: "Locating…",
  granted: "📍 Location on",
  denied: "Location denied",
  unavailable: "Location unavailable",
};

export function UseMyLocationButton({
  status,
  onClick,
}: {
  status: VisitorLocationStatus;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status === "requesting" || status === "granted"}
      className="rounded-full border-[1.5px] border-ink/20 px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-ink hover:text-ink disabled:opacity-70"
    >
      {LABELS[status]}
    </button>
  );
}
