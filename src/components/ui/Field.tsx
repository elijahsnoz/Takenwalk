import type { ComponentPropsWithoutRef, ReactNode } from "react";

const FIELD_CLASSES =
  "rounded-lg border border-ink/20 bg-paper px-3 py-2 text-ink outline-none focus:border-ink disabled:opacity-50";

export function Input(props: ComponentPropsWithoutRef<"input">) {
  return <input {...props} className={`${FIELD_CLASSES} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentPropsWithoutRef<"textarea">) {
  return <textarea {...props} className={`${FIELD_CLASSES} ${props.className ?? ""}`} />;
}

export function Select(props: ComponentPropsWithoutRef<"select">) {
  return <select {...props} className={`${FIELD_CLASSES} ${props.className ?? ""}`} />;
}

export function Checkbox({
  label,
  ...props
}: ComponentPropsWithoutRef<"input"> & { label: ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <input type="checkbox" {...props} className="h-4 w-4 accent-green" />
      {label}
    </label>
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1 text-sm font-medium text-ink">
      {children}
    </label>
  );
}
