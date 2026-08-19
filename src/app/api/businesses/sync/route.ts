import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminBusinessSchema } from "@/lib/validation/business";
import { uploadPhoto } from "@/lib/storage";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

/**
 * Idempotent by clientRecordId — a retried/replayed sync (lost response,
 * double-tap on flaky connectivity) never creates a duplicate business.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const payloadRaw = formData.get("payload");
  if (typeof payloadRaw !== "string") {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  let payloadJson: unknown;
  try {
    payloadJson = JSON.parse(payloadRaw);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const parsed = adminBusinessSchema.safeParse(payloadJson);
  if (!parsed.success) {
    return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.business.findUnique({ where: { clientRecordId: data.clientRecordId } });
  if (existing) {
    return NextResponse.json({ data: { id: existing.id, slug: existing.slug } }, { status: 200 });
  }

  const [category, neighborhood] = await Promise.all([
    prisma.businessCategory.findUnique({ where: { key: data.categoryKey } }),
    prisma.neighborhood.findUnique({ where: { slug: "piwoyi" } }),
  ]);
  if (!category || !neighborhood) {
    return NextResponse.json({ error: "Piwoyi is not set up yet." }, { status: 503 });
  }

  let photoUrl: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const uploaded = await uploadPhoto(photo, "businesses");
    photoUrl = uploaded.url;
  }

  const additionalPhotoFiles = formData.getAll("additionalPhotos").filter((f): f is File => f instanceof File && f.size > 0);
  const additionalPhotoUrls = await Promise.all(
    additionalPhotoFiles.map(async (file) => (await uploadPhoto(file, "businesses")).url)
  );

  const baseSlug = slugify(data.name) || "business";
  let slug = baseSlug;
  for (let i = 2; await prisma.business.findUnique({ where: { slug } }); i++) {
    slug = `${baseSlug}-${i}`;
  }

  const visitedAt = data.dateVisited ?? new Date();

  const business = await prisma.business.create({
    data: {
      clientRecordId: data.clientRecordId,
      slug,
      name: data.name,
      categoryId: category.id,
      neighborhoodId: neighborhood.id,
      ownerName: data.ownerName,
      phone: data.phone,
      whatsapp: data.whatsapp,
      address: data.address,
      description: data.description,
      productsServices: data.productsServices,
      topRequestedProducts: data.topRequestedProducts,
      openingHours: data.openingHours,
      paymentMethods: data.paymentMethods,
      pickupAvailable: data.pickupAvailable,
      whatsappOrderingAvailable: data.whatsappOrderingAvailable,
      showPhonePublicly: data.showPhonePublicly,
      showWhatsappPublicly: data.showWhatsappPublicly,
      notes: data.notes,
      photoUrl,
      additionalPhotoUrls,
      latitude: data.latitude,
      longitude: data.longitude,
      locationAccuracyMeters: data.accuracyMeters,
      locationSource: data.locationSource,
      verificationStatus: "VERIFIED",
      isPubliclyListed: true,
      lastVisitedAt: visitedAt,
      locations: {
        create: {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracyMeters: data.accuracyMeters,
          locationSource: data.locationSource,
          capturedByAdminId: session.user.id,
        },
      },
      visits: {
        create: { visitedAt, visitedByAdminId: session.user.id, notes: data.notes },
      },
      locationEvents: {
        create: {
          subjectType: "BUSINESS",
          source: data.locationSource,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracyMeters: data.accuracyMeters,
          capturedByAdminId: session.user.id,
        },
      },
    },
  });

  return NextResponse.json({ data: { id: business.id, slug: business.slug } }, { status: 201 });
}
