import { Button } from "@/components/ui/Button";

export function AddBusinessButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" onClick={onClick} size="lg" className="w-full sm:w-auto">
      + ADD BUSINESS
    </Button>
  );
}
