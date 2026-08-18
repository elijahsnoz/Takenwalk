import { Button } from "@/components/ui/Button";
import { HandDrawnFrame } from "@/components/ui/Card";
import { WalkingFigureIcon } from "@/components/ui/DecorativeIconStrip";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const whatsappHref = whatsappNumber
  ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi TakenWalk, I'd like to become a Walker in Piwoyi.")}`
  : undefined;

export default function BecomeAWalkerPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <WalkingFigureIcon accent="var(--color-green)" width={48} height={48} />
      <h1 className="mt-4 font-display text-4xl font-extrabold text-ink">Become a Walker</h1>
      <p className="mt-3 text-ink-soft">
        Walkers are the people who make TakenWalk move — picking up orders from local
        businesses and delivering them around Piwoyi. No smartphone required to get started:
        we can coordinate jobs by phone call, SMS, or WhatsApp.
      </p>

      <HandDrawnFrame className="mt-8 p-6">
        <h2 className="text-lg font-bold text-ink">How it works</h2>
        <ol className="mt-3 space-y-2 text-sm text-ink-soft">
          <li>1. Reach out to us with your name and neighborhood.</li>
          <li>2. We&apos;ll set you up as a Walker and explain how jobs come in.</li>
          <li>3. Start accepting jobs and earning around Piwoyi.</li>
        </ol>

        <div className="mt-6">
          {whatsappHref ? (
            <Button href={whatsappHref} size="lg" variant="primary">
              Message us on WhatsApp
            </Button>
          ) : (
            <p className="text-sm text-ink-soft">
              WhatsApp contact coming soon — check back shortly.
            </p>
          )}
        </div>
      </HandDrawnFrame>
    </div>
  );
}
