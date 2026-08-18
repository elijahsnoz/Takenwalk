import { Card } from "@/components/ui/Card";
import type { ReactNode } from "react";

export function RankedList({
  title,
  emptyCopy,
  items,
}: {
  title: string;
  emptyCopy: string;
  items: { key: string; label: ReactNode; value: ReactNode }[];
}) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">{emptyCopy}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.key} className="flex items-center justify-between text-sm">
              <span className="text-ink">{item.label}</span>
              <span className="font-medium text-ink-soft">{item.value}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
