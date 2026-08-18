"use client";

import { useEffect, useState } from "react";

export type LayerKey = "businesses" | "walkers" | "jobs" | "community" | "customers";

const LAYERS: { key: LayerKey; label: string; icon: string }[] = [
  { key: "businesses", label: "Businesses", icon: "🏪" },
  { key: "walkers", label: "Walkers", icon: "🚶" },
  { key: "jobs", label: "Active Jobs", icon: "📦" },
  { key: "community", label: "Community", icon: "👥" },
  { key: "customers", label: "Customers", icon: "📍" },
];

const ENDPOINTS: Record<Exclude<LayerKey, "businesses">, string> = {
  walkers: "/api/walkers",
  jobs: "/api/jobs",
  community: "/api/community-posts",
  customers: "/api/customers",
};

/** Businesses is always on (the core layer); the rest are opt-in and fetch real data on toggle. */
export function LayerToggle({ active, onToggle }: { active: Set<LayerKey>; onToggle: (key: LayerKey) => void }) {
  const [summaries, setSummaries] = useState<Partial<Record<LayerKey, string>>>({});

  useEffect(() => {
    for (const key of active) {
      if (key === "businesses" || summaries[key]) continue;
      fetch(ENDPOINTS[key])
        .then((res) => res.json())
        .then((json) => {
          const summary = summarize(key, json.data);
          setSummaries((prev) => ({ ...prev, [key]: summary }));
        })
        .catch(() => setSummaries((prev) => ({ ...prev, [key]: "unavailable" })));
    }
  }, [active, summaries]);

  return (
    <div className="flex flex-wrap gap-2">
      {LAYERS.map((layer) => (
        <button
          key={layer.key}
          onClick={() => layer.key !== "businesses" && onToggle(layer.key)}
          disabled={layer.key === "businesses"}
          title={summaries[layer.key]}
          className={`flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold transition-colors ${
            active.has(layer.key)
              ? "border-ink bg-ink text-cream-soft"
              : "border-ink/20 text-ink-soft hover:border-ink"
          } ${layer.key === "businesses" ? "cursor-default opacity-90" : ""}`}
        >
          <span>{layer.icon}</span>
          {layer.label}
          {summaries[layer.key] ? <span className="opacity-70">· {summaries[layer.key]}</span> : null}
        </button>
      ))}
    </div>
  );
}

function summarize(key: LayerKey, data: unknown): string {
  if (key === "walkers" && data && typeof data === "object" && "availableCount" in data) {
    return `${(data as { availableCount: number }).availableCount} nearby`;
  }
  if (key === "customers" && data && typeof data === "object" && "count" in data) {
    return `${(data as { count: number }).count} in Piwoyi`;
  }
  if (key === "jobs" && Array.isArray(data)) return `${data.length} active`;
  if (key === "community" && data && typeof data === "object" && "posts" in data) {
    return `${(data as { posts: unknown[] }).posts.length} posts`;
  }
  return "";
}
