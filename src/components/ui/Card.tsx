import type { ComponentPropsWithoutRef } from "react";

/** Plain SaaS-style card — used on admin/data screens. */
export function Card({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`rounded-xl border border-ink/10 bg-paper shadow-sm ${className}`}
      {...props}
    />
  );
}

/** Thick-outline, organic-radius card — used on consumer-facing pages. */
export function HandDrawnFrame({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={`hand-drawn-frame bg-paper ${className}`} {...props} />;
}
