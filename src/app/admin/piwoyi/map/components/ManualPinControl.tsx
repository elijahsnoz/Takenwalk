import { Button } from "@/components/ui/Button";

export function ManualPinControl({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <Button type="button" onClick={onToggle} variant={active ? "primary" : "outline"}>
      {active ? "Tap the map to place the pin…" : "📌 Place Pin Manually"}
    </Button>
  );
}
