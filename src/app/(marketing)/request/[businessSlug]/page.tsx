import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RequestForm } from "./RequestForm";

export const dynamic = "force-dynamic";

export default async function RequestFromBusinessPage({ params }: PageProps<"/request/[businessSlug]">) {
  const { businessSlug } = await params;

  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
  if (!business || !business.isPubliclyListed) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink">Request from {business.name}</h1>
      <p className="mt-2 text-ink-soft">Tell us what you need and we&apos;ll send a Walker.</p>
      <RequestForm businessId={business.id} businessName={business.name} />
    </div>
  );
}
