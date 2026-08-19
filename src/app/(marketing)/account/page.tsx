import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HandDrawnFrame } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { JOB_STATUS_META } from "@/lib/constants";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (session?.user?.role !== "CUSTOMER") {
    redirect("/account/login");
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    include: {
      jobs: {
        include: { business: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!customer) redirect("/account/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <HandDrawnFrame className="flex items-center gap-4 p-6">
        {customer.dpPhotoUrl ? (
          <Image
            src={customer.dpPhotoUrl}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-full border-2 border-ink object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-cream-soft text-2xl">
            🙂
          </div>
        )}
        <div className="flex-1">
          <h1 className="font-display text-xl font-extrabold text-ink">{customer.name}</h1>
          <p className="text-sm text-ink-soft">{customer.phone}</p>
        </div>
        <SignOutButton />
      </HandDrawnFrame>

      <HandDrawnFrame className="mt-6 p-6">
        <h2 className="text-lg font-bold text-ink">Your Requests</h2>
        {customer.jobs.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">No requests yet — browse the map to get started.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink/10">
            {customer.jobs.map((job) => (
              <li key={job.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{job.description}</p>
                  <p className="text-xs text-ink-soft">from {job.business.name}</p>
                </div>
                <Badge tone={JOB_STATUS_META[job.status].tone}>{JOB_STATUS_META[job.status].label}</Badge>
              </li>
            ))}
          </ul>
        )}
      </HandDrawnFrame>
    </div>
  );
}
