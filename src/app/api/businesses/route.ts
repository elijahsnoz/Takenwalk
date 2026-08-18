import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toPublicBusiness } from "@/lib/dto/business";
import { publicBusinessLeadSchema } from "@/lib/validation/business";
import { isDemoModeEnabled } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { BUSINESS_CATEGORY_META } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const categoryKey = new URL(request.url).searchParams.get("category");
  const isValidCategory = categoryKey && categoryKey in BUSINESS_CATEGORY_META;

  const businesses = await prisma.business.findMany({
    where: {
      isPubliclyListed: true,
      isDemoData: isDemoModeEnabled ? undefined : false,
      ...(isValidCategory ? { category: { key: categoryKey as never } } : {}),
    },
    include: { category: true, products: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: businesses.map(toPublicBusiness) });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = publicBusinessLeadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  }

  const category = await prisma.businessCategory.findUnique({
    where: { key: parsed.data.categoryKey },
  });
  const neighborhood = await prisma.neighborhood.findUnique({ where: { slug: "piwoyi" } });

  if (!category || !neighborhood) {
    return NextResponse.json(
      { error: "Piwoyi is not set up yet — try again shortly." },
      { status: 503 }
    );
  }

  const baseSlug = slugify(parsed.data.name) || "business";
  let slug = baseSlug;
  for (let i = 2; await prisma.business.findUnique({ where: { slug } }); i++) {
    slug = `${baseSlug}-${i}`;
  }

  const business = await prisma.business.create({
    data: {
      slug,
      name: parsed.data.name,
      categoryId: category.id,
      neighborhoodId: neighborhood.id,
      ownerName: parsed.data.ownerName,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      address: parsed.data.address,
      description: parsed.data.description,
      isPubliclyListed: false,
      verificationStatus: "PENDING",
    },
  });

  return NextResponse.json({ data: { id: business.id } }, { status: 201 });
}
