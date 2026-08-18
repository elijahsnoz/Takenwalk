import { Button } from "@/components/ui/Button";

export default function RequestSuccessPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-4xl">✅</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-ink">Request sent!</h1>
      <p className="mt-3 text-ink-soft">
        We&apos;ve got your request and will be in touch to get it done.
      </p>
      <div className="mt-6">
        <Button href="/" variant="outline">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
