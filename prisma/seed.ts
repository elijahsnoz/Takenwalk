import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { BUSINESS_CATEGORY_META } from "../src/lib/constants";

/**
 * Real Piwoyi data only: categories, the geography skeleton, one ServiceArea,
 * and the seeded admin login. NEVER add businesses/walkers/jobs/community
 * posts here — those come from the founder's own field mapping. Demo data
 * lives in seed.demo.ts, gated by DEMO_MODE, and never runs against this path.
 */
async function main() {
  for (const [key, meta] of Object.entries(BUSINESS_CATEGORY_META)) {
    await prisma.businessCategory.upsert({
      where: { key: key as keyof typeof BUSINESS_CATEGORY_META },
      update: { label: meta.label, emoji: meta.emoji, colorHex: meta.colorHex, sortOrder: meta.sortOrder },
      create: {
        key: key as keyof typeof BUSINESS_CATEGORY_META,
        label: meta.label,
        emoji: meta.emoji,
        colorHex: meta.colorHex,
        sortOrder: meta.sortOrder,
      },
    });
  }
  console.log(`Seeded ${Object.keys(BUSINESS_CATEGORY_META).length} business categories.`);

  const city = await prisma.city.upsert({
    where: { name_country: { name: "Abuja", country: "Nigeria" } },
    update: {},
    create: { name: "Abuja", state: "FCT", country: "Nigeria" },
  });

  const neighborhood = await prisma.neighborhood.upsert({
    where: { slug: "piwoyi" },
    update: {},
    create: {
      cityId: city.id,
      name: "Piwoyi",
      slug: "piwoyi",
      description: "TakenWalk's first neighborhood — Piwoyi, Abuja.",
    },
  });

  // PLACEHOLDER boundary — still not a walked/traced boundary, but this
  // center point is corroborated (not guessed): multiple independent
  // Nominatim landmarks in Lugbe, Abuja share postcode 900107 with Piwoyi
  // per Nigeria's postcode database and an academic source describing
  // Piwoyi as sitting behind Shoprite on Airport Road, Lugbe district,
  // AMAC — all clustering around this point. Still replace `boundary` with
  // the real traced operating zone once the founder walks it or draws it
  // in Google My Maps / geojson.io.
  const PLACEHOLDER_CENTER = { lat: 8.974, lng: 7.379 };
  const PLACEHOLDER_DELTA = 0.01;
  const placeholderBoundary = {
    type: "Polygon",
    coordinates: [
      [
        [PLACEHOLDER_CENTER.lng - PLACEHOLDER_DELTA, PLACEHOLDER_CENTER.lat - PLACEHOLDER_DELTA],
        [PLACEHOLDER_CENTER.lng + PLACEHOLDER_DELTA, PLACEHOLDER_CENTER.lat - PLACEHOLDER_DELTA],
        [PLACEHOLDER_CENTER.lng + PLACEHOLDER_DELTA, PLACEHOLDER_CENTER.lat + PLACEHOLDER_DELTA],
        [PLACEHOLDER_CENTER.lng - PLACEHOLDER_DELTA, PLACEHOLDER_CENTER.lat + PLACEHOLDER_DELTA],
        [PLACEHOLDER_CENTER.lng - PLACEHOLDER_DELTA, PLACEHOLDER_CENTER.lat - PLACEHOLDER_DELTA],
      ],
    ],
  };

  const existingServiceArea = await prisma.serviceArea.findFirst({
    where: { neighborhoodId: neighborhood.id, name: "Piwoyi Zone" },
  });
  if (existingServiceArea) {
    // Deliberately never overwritten here — once this has been corrected
    // (by hand, or via a future admin editor) re-seeding must not silently
    // stomp it back to a placeholder. Update it directly if you want this
    // script's newer placeholder coordinates.
    console.log('ServiceArea "Piwoyi Zone" already exists — leaving its boundary untouched.');
  } else {
    await prisma.serviceArea.create({
      data: {
        neighborhoodId: neighborhood.id,
        name: "Piwoyi Zone",
        boundary: placeholderBoundary,
        centerLatitude: PLACEHOLDER_CENTER.lat,
        centerLongitude: PLACEHOLDER_CENTER.lng,
        defaultZoom: 16,
        isActive: true,
      },
    });
    console.warn(
      "⚠️  ServiceArea 'Piwoyi Zone' was created with a PLACEHOLDER boundary — replace with the real traced Piwoyi boundary before going live."
    );
  }
  console.log(`Seeded City "${city.name}" and Neighborhood "${neighborhood.name}".`);

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await prisma.adminUser.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: { passwordHash },
      create: {
        email: process.env.ADMIN_EMAIL,
        passwordHash,
        name: "Founder",
        role: "FOUNDER",
      },
    });
    console.log(`Seeded AdminUser "${process.env.ADMIN_EMAIL}".`);
  } else {
    console.warn("⚠️  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipped seeding the admin login.");
  }

  const [businessCount, jobCount, walkerCount, postCount] = await Promise.all([
    prisma.business.count(),
    prisma.job.count(),
    prisma.walker.count(),
    prisma.communityPost.count(),
  ]);
  console.log(
    `Real-data check — businesses: ${businessCount}, jobs: ${jobCount}, walkers: ${walkerCount}, community posts: ${postCount} (should be 0 until the founder starts field mapping).`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
