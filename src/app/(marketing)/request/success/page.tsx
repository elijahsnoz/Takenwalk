import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function RequestSuccessPage({ searchParams }: PageProps<"/request/success">) {
  const params = await searchParams;
  const jobId = typeof params.jobId === "string" ? params.jobId : null;

  const job = jobId
    ? await prisma.job.findUnique({
        where: { id: jobId },
        include: { business: true, payments: true },
      })
    : null;

  const isPaid = job?.payments.some((payment) => payment.status === "COMPLETED") ?? false;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-4xl">✅</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-ink">Request sent!</h1>

      {job ? (
        <div className="mt-4 text-ink-soft">
          <p>
            Request <span className="font-semibold text-ink">#{job.sequenceNumber}</span> for{" "}
            <span className="font-semibold text-ink">{job.description}</span> from{" "}
            <span className="font-semibold text-ink">{job.business.name}</span>.
          </p>
          {isPaid ? <p className="mt-2 font-medium text-green">Payment received — nothing to pay on delivery.</p> : null}
        </div>
      ) : (
        <p className="mt-3 text-ink-soft">We&apos;ve got your request and will be in touch to get it done.</p>
      )}

      <div className="mt-6">
        <Button href="/" variant="outline">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
