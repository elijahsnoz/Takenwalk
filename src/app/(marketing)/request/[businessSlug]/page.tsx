import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPaystack } from "@/lib/env";
import { RequestForm } from "./RequestForm";

export const dynamic = "force-dynamic";

export default async function RequestFromBusinessPage({ params }: PageProps<"/request/[businessSlug]">) {
  const { businessSlug } = await params;

  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
  if (!business || !business.isPubliclyListed) {
    notFound();
  }

  const payableProducts = hasPaystack
    ? await prisma.businessProduct.findMany({
        where: { businessId: business.id, isAvailable: true, priceNaira: { not: null } },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, priceNaira: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink">Request from {business.name}</h1>
      <p className="mt-2 text-ink-soft">Tell us what you need and we&apos;ll send a Walker.</p>
      <RequestForm
        businessId={business.id}
        businessName={business.name}
        payableProducts={payableProducts.map((product) => ({
          id: product.id,
          name: product.name,
          priceNaira: product.priceNaira!.toNumber(),
        }))}
      />
    </div>
  );
}
