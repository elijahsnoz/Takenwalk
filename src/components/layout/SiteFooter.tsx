import { LogoMark } from "@/components/ui/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-cream-soft">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-soft sm:px-6">
        <p className="flex items-center gap-2 font-display text-base font-bold text-ink">
          <LogoMark width={20} height={20} />
          TAKEN A WALK
        </p>
        <p className="mt-1">Piwoyi, Abuja — need something? We&apos;ll walk for you.</p>
        <p className="mt-4 text-xs">
          Built for Piwoyi. Starting with the people, businesses and everyday needs already
          around us.
        </p>
      </div>
    </footer>
  );
}
