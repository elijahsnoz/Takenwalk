import "dotenv/config";
import { prisma } from "../src/lib/prisma";

/**
 * DEMO DATA ONLY — for local UI development, never for production.
 * Refuses to run unless DEMO_MODE=true (never set in Vercel Production/Preview).
 * Every row here carries isDemoData:true, and every public/production query
 * must filter WHERE isDemoData=false as a second, independent safety net.
 * Run with: npm run db:seed:demo. This is NEVER wired into `db:seed`, deploy
 * hooks, or CI.
 */
async function main() {
  if (process.env.DEMO_MODE !== "true") {
    console.error('Refusing to run: DEMO_MODE is not "true". This script never touches real data by accident.');
    process.exit(1);
  }

  const neighborhood = await prisma.neighborhood.findUnique({ where: { slug: "piwoyi" } });
  if (!neighborhood) {
    console.error('No "piwoyi" neighborhood found — run `npm run db:seed` first.');
    process.exit(1);
  }

  const categories = await prisma.businessCategory.findMany();
  const categoryByKey = Object.fromEntries(categories.map((c) => [c.key, c]));

  const demoBusinesses = [
    { name: "[DEMO] Faith Superette", categoryKey: "GENERAL_SHOP", lat: 8.9732, lng: 7.3784 },
    { name: "[DEMO] Mama Ngozi Foodstuff", categoryKey: "FOODSTUFF", lat: 8.9744, lng: 7.3796 },
    { name: "[DEMO] Quickcash POS", categoryKey: "POS", lat: 8.9737, lng: 7.3773 },
    { name: "[DEMO] Amaka's Kitchen", categoryKey: "FOOD_VENDOR", lat: 8.9749, lng: 7.3780 },
  ] as const;

  const createdBusinesses = [];
  for (const b of demoBusinesses) {
    const business = await prisma.business.upsert({
      where: { slug: b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: {},
      create: {
        slug: b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: b.name,
        categoryId: categoryByKey[b.categoryKey].id,
        neighborhoodId: neighborhood.id,
        latitude: b.lat,
        longitude: b.lng,
        locationSource: "MANUAL",
        isPubliclyListed: true,
        showPhonePublicly: true,
        verificationStatus: "VERIFIED",
        isDemoData: true,
      },
    });
    createdBusinesses.push(business);
  }
  console.log(`Seeded ${createdBusinesses.length} demo businesses.`);

  const walker = await prisma.walker.upsert({
    where: { phone: "+2340000000001" },
    update: {},
    create: {
      name: "[DEMO] Bello",
      phone: "+2340000000001",
      communicationChannel: "PHONE",
      status: "AVAILABLE",
      neighborhoodId: neighborhood.id,
    },
  });

  const customer = await prisma.customer.upsert({
    where: { phone: "+2340000000099" },
    update: {},
    create: { name: "[DEMO] Test Customer", phone: "+2340000000099", neighborhoodId: neighborhood.id },
  });

  await prisma.job.create({
    data: {
      customerId: customer.id,
      businessId: createdBusinesses[0].id,
      assignedWalkerId: walker.id,
      neighborhoodId: neighborhood.id,
      status: "ASSIGNED",
      description: "[DEMO] Buy bread, eggs, and milk",
      isDemoData: true,
    },
  });

  await prisma.communityPost.create({
    data: {
      type: "ANNOUNCEMENT",
      title: "[DEMO] Welcome to TakenWalk",
      body: "This is a demo community post for local UI testing only.",
      authorType: "SYSTEM",
      isDemoData: true,
    },
  });

  console.log("Demo seed complete. Remember: none of this represents real Piwoyi data.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
