import { Button } from "@/components/ui/Button";
import { HandDrawnFrame } from "@/components/ui/Card";
import { DecorativeIconStrip } from "@/components/ui/DecorativeIconStrip";
import { LogoMark } from "@/components/ui/Logo";
import { NeighborhoodScene } from "@/components/marketing/NeighborhoodScene";

const STEPS = [
  { title: "Buy it", body: "Tell us what you need and which shop you'd like it from." },
  { title: "Pick it up", body: "A Walker heads to the business and picks up your order." },
  { title: "Deliver it. Get it done.", body: "Your order comes straight to you around Piwoyi." },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-paper-grain">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
          <DecorativeIconStrip className="mb-8" />

          <h1 className="flex items-center gap-4 font-display text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl">
            <LogoMark width={52} height={52} className="shrink-0 sm:h-16 sm:w-16" />
            TAKEN A WALK
          </h1>
          <p className="mt-4 max-w-xl text-xl font-semibold text-ink">
            Need something? We&apos;ll walk for you.
          </p>
          <p className="mt-2 max-w-xl text-ink-soft">
            Buy it. Pick it up. Deliver it. Get it done.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/request" size="lg" variant="primary">
              Request a Job
            </Button>
            <Button href="/become-a-walker" size="lg" variant="secondary">
              Become a Walker
            </Button>
            <Button href="/add-your-business" size="lg" variant="outline">
              Add Your Business
            </Button>
          </div>

          <HandDrawnFrame className="mt-12 overflow-hidden p-4 sm:p-6">
            <NeighborhoodScene className="w-full" />
          </HandDrawnFrame>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <HandDrawnFrame key={step.title} className="p-6">
              <span className="font-display text-3xl font-extrabold text-green">{i + 1}</span>
              <h3 className="mt-2 text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
            </HandDrawnFrame>
          ))}
        </div>
      </section>

      <section className="border-t border-ink/10 bg-cream-soft">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-3xl font-extrabold text-ink">Built for Piwoyi.</h2>
          <p className="mt-3 text-ink-soft">
            Starting with the people, businesses and everyday needs already around us —
            connecting people, local businesses and Walkers around Piwoyi, Abuja.
          </p>
        </div>
      </section>
    </>
  );
}
