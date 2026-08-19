import { Button } from "@/components/ui/Button";

export default function PaymentFailedPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-4xl">⚠️</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-ink">Payment didn&apos;t go through</h1>
      <p className="mt-3 text-ink-soft">
        Nothing was charged, and no request was sent. You can try again, or send your request the regular way and
        pay on delivery instead.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button href="/request" variant="primary">
          Try Again
        </Button>
        <Button href="/" variant="outline">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
