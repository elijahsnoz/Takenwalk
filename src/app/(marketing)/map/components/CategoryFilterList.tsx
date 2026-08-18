"use client";

import { BUSINESS_CATEGORY_META } from "@/lib/constants";
import type { BusinessCategoryType } from "@/generated/prisma/enums";
import type { PublicBusiness } from "@/lib/dto/business";

export function CategoryFilterList({
  businesses,
  active,
  onChange,
}: {
  businesses: PublicBusiness[];
  active: BusinessCategoryType | null;
  onChange: (category: BusinessCategoryType | null) => void;
}) {
  const counts = new Map<string, number>();
  for (const b of businesses) counts.set(b.category.key, (counts.get(b.category.key) ?? 0) + 1);

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => onChange(null)}
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium ${
          active === null ? "bg-ink text-cream-soft" : "text-ink hover:bg-ink/5"
        }`}
      >
        <span>All Categories</span>
        <span>{businesses.length}</span>
      </button>
      {(Object.entries(BUSINESS_CATEGORY_META) as [BusinessCategoryType, (typeof BUSINESS_CATEGORY_META)[BusinessCategoryType]][]).map(
        ([key, meta]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium ${
              active === key ? "bg-ink text-cream-soft" : "text-ink hover:bg-ink/5"
            }`}
          >
            <span>
              {meta.emoji} {meta.label}
            </span>
            <span>{counts.get(key) ?? 0}</span>
          </button>
        )
      )}
    </div>
  );
}
