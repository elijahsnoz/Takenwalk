import type { BusinessCategoryType, JobStatus } from "@/generated/prisma/enums";

export const PIWOYI_BUSINESS_MISSION_TARGET = 20;

export type CategoryMeta = {
  label: string;
  emoji: string;
  colorHex: string;
  colorToken: string;
  softToken: string;
  sortOrder: number;
};

export const BUSINESS_CATEGORY_META: Record<BusinessCategoryType, CategoryMeta> = {
  GENERAL_SHOP: { label: "General Shop", emoji: "🏪", colorHex: "#8b5e3c", colorToken: "var(--color-brown)", softToken: "var(--color-brown-soft)", sortOrder: 0 },
  FOODSTUFF: { label: "Foodstuff", emoji: "🍅", colorHex: "#4c6444", colorToken: "var(--color-green)", softToken: "var(--color-green-soft)", sortOrder: 1 },
  POS: { label: "POS", emoji: "💳", colorHex: "#c8962c", colorToken: "var(--color-gold)", softToken: "var(--color-gold-soft)", sortOrder: 2 },
  FOOD_VENDOR: { label: "Food Vendor", emoji: "🍲", colorHex: "#d97b3f", colorToken: "var(--color-orange)", softToken: "var(--color-orange-soft)", sortOrder: 3 },
  PHARMACY_HEALTH: { label: "Pharmacy/Health", emoji: "💊", colorHex: "#b5432d", colorToken: "var(--color-red)", softToken: "var(--color-red-soft)", sortOrder: 4 },
  FASHION: { label: "Fashion", emoji: "👗", colorHex: "#6d5093", colorToken: "var(--color-purple)", softToken: "var(--color-purple-soft)", sortOrder: 5 },
  PHONE_TECH: { label: "Phone/Technology", emoji: "📱", colorHex: "#3e6e8e", colorToken: "var(--color-blue)", softToken: "var(--color-blue-soft)", sortOrder: 6 },
  REPAIR_SERVICE: { label: "Repair/Service", emoji: "🔧", colorHex: "#5b6472", colorToken: "var(--color-slate)", softToken: "var(--color-slate-soft)", sortOrder: 7 },
  HOUSEHOLD: { label: "Household", emoji: "🧺", colorHex: "#3a7d6e", colorToken: "var(--color-teal)", softToken: "var(--color-teal-soft)", sortOrder: 8 },
  OTHER: { label: "Other", emoji: "❓", colorHex: "#4a4640", colorToken: "var(--color-ink-soft)", softToken: "var(--color-cream-soft)", sortOrder: 9 },
};

type JobStatusMeta = {
  label: string;
  tone: "gold" | "orange" | "green" | "blue" | "red" | "neutral";
};

export const JOB_STATUS_META: Record<JobStatus, JobStatusMeta> = {
  NEW: { label: "New", tone: "gold" },
  ASSIGNED: { label: "Assigned", tone: "orange" },
  ACCEPTED: { label: "Accepted", tone: "green" },
  GOING_TO_SHOP: { label: "Going to Shop", tone: "blue" },
  SHOPPING: { label: "Shopping", tone: "blue" },
  PURCHASE_CONFIRMED: { label: "Purchase Confirmed", tone: "blue" },
  PICKED_UP: { label: "Picked Up", tone: "blue" },
  DELIVERING: { label: "Delivering", tone: "blue" },
  COMPLETED: { label: "Completed", tone: "green" },
  CANCELLED: { label: "Cancelled", tone: "red" },
};

export const JOB_STATUS_ORDER: JobStatus[] = [
  "NEW",
  "ASSIGNED",
  "ACCEPTED",
  "GOING_TO_SHOP",
  "SHOPPING",
  "PURCHASE_CONFIRMED",
  "PICKED_UP",
  "DELIVERING",
  "COMPLETED",
];
