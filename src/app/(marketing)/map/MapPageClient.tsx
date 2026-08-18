"use client";

import { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { BusinessCategoryType } from "@/generated/prisma/enums";
import type { PublicBusiness } from "@/lib/dto/business";
import type { PublicServiceArea } from "@/lib/dto/serviceArea";
import { useVisitorLocation } from "@/components/map/useVisitorLocation";
import { ListView } from "./components/ListView";
import { CategoryFilterList } from "./components/CategoryFilterList";
import { LayerToggle, type LayerKey } from "./components/LayerToggle";
import { BusinessCard } from "./components/BusinessCard";
import { UseMyLocationButton } from "./components/UseMyLocationButton";

// MapLibre + our own map bundle — keep it out of the List View path entirely.
const MapView = dynamic(() => import("./components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl bg-cream-soft text-sm text-ink-soft">
      Loading map…
    </div>
  ),
});

export function MapPageClient({
  initialBusinesses,
  serviceArea,
}: {
  initialBusinesses: PublicBusiness[];
  serviceArea: PublicServiceArea | null;
}) {
  const [view, setView] = useState<"list" | "map">("list");
  const [activeCategory, setActiveCategory] = useState<BusinessCategoryType | null>(null);
  const [query, setQuery] = useState("");
  const [activeLayers, setActiveLayers] = useState<Set<LayerKey>>(new Set(["businesses"]));
  const [selectedBusiness, setSelectedBusiness] = useState<PublicBusiness | null>(null);
  const { location: visitorLocation, status: locationStatus, requestLocation } = useVisitorLocation();

  const filteredBusinesses = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    return initialBusinesses.filter((b) => {
      const matchesCategory = !activeCategory || b.category.key === activeCategory;
      const matchesQuery =
        !trimmedQuery ||
        b.name.toLowerCase().includes(trimmedQuery) ||
        b.productsServices?.toLowerCase().includes(trimmedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [initialBusinesses, activeCategory, query]);

  const toggleLayer = useCallback((key: LayerKey) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Piwoyi Map</h1>
          <p className="text-sm text-ink-soft">
            {initialBusinesses.length} business{initialBusinesses.length === 1 ? "" : "es"} mapped so far.
          </p>
        </div>
        <div className="flex overflow-hidden rounded-full border-[1.5px] border-ink">
          {(["list", "map"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`px-4 py-1.5 text-sm font-semibold capitalize ${
                view === mode ? "bg-ink text-cream-soft" : "text-ink"
              }`}
            >
              {mode} View
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search businesses or products…"
          className="min-w-[220px] flex-1 rounded-full border border-ink/20 bg-paper px-4 py-2 text-sm text-ink outline-none focus:border-ink"
        />
        <UseMyLocationButton status={locationStatus} onClick={requestLocation} />
      </div>

      <div className="mt-4">
        <LayerToggle active={activeLayers} onToggle={toggleLayer} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <CategoryFilterList businesses={initialBusinesses} active={activeCategory} onChange={setActiveCategory} />

        <div>
          {view === "map" ? (
            <div className="relative grid gap-4 md:grid-cols-[1fr_320px]">
              <div className="h-[480px]">
                <MapView
                  businesses={filteredBusinesses}
                  serviceArea={serviceArea}
                  onSelectBusiness={setSelectedBusiness}
                />
              </div>

              {/* Desktop: side panel */}
              <div className="hidden md:block">
                {selectedBusiness ? (
                  <BusinessCard business={selectedBusiness} visitorLocation={visitorLocation} />
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
                    Tap a marker to see business details.
                  </div>
                )}
              </div>

              {/* Mobile: bottom sheet */}
              {selectedBusiness ? (
                <div className="fixed inset-x-0 bottom-0 z-20 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-ink/10 bg-cream-soft p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] md:hidden">
                  <button
                    onClick={() => setSelectedBusiness(null)}
                    className="mb-2 ml-auto block text-sm font-semibold text-ink-soft"
                  >
                    Close ✕
                  </button>
                  <BusinessCard business={selectedBusiness} visitorLocation={visitorLocation} />
                </div>
              ) : null}
            </div>
          ) : (
            <ListView businesses={filteredBusinesses} visitorLocation={visitorLocation} />
          )}
        </div>
      </div>
    </div>
  );
}
