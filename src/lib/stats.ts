import { prisma } from "@/lib/prisma";
import { isDemoModeEnabled } from "@/lib/env";
import { PIWOYI_BUSINESS_MISSION_TARGET } from "@/lib/constants";

const demoFilter = isDemoModeEnabled ? undefined : false;

/**
 * Single source of truth for every dashboard number — used by both the
 * server-rendered dashboard page and /api/stats (curl-testable, and a future
 * client-side refresh hook). No fabricated rows ever factor in here: every
 * count/sum comes straight from the DB, honestly zero until real jobs exist.
 */
export async function getPiwoyiStats() {
  const [businessCount, activeJobCount, completedJobs, communityMemberCount] = await Promise.all([
    prisma.business.count({ where: { isDemoData: demoFilter } }),
    prisma.job.count({ where: { status: { notIn: ["COMPLETED", "CANCELLED"] }, isDemoData: demoFilter } }),
    prisma.job.findMany({
      where: { status: "COMPLETED", isDemoData: demoFilter },
      include: { business: true, assignedWalker: true, payments: true },
    }),
    prisma.customer.count(),
  ]);

  let totalSalesNaira = 0;
  let walkerEarningsNaira = 0;
  const businessJobCounts = new Map<string, { name: string; count: number }>();
  const walkerStats = new Map<string, { name: string; jobsCompleted: number; earningsNaira: number }>();

  for (const job of completedJobs) {
    const businessEntry = businessJobCounts.get(job.businessId) ?? { name: job.business.name, count: 0 };
    businessEntry.count += 1;
    businessJobCounts.set(job.businessId, businessEntry);

    if (job.assignedWalkerId && job.assignedWalker) {
      const walkerEntry = walkerStats.get(job.assignedWalkerId) ?? {
        name: job.assignedWalker.name,
        jobsCompleted: 0,
        earningsNaira: 0,
      };
      walkerEntry.jobsCompleted += 1;
      for (const payment of job.payments) {
        if (payment.status !== "COMPLETED") continue;
        totalSalesNaira += payment.amountNaira.toNumber();
        const earning = payment.walkerEarningNaira?.toNumber() ?? 0;
        walkerEntry.earningsNaira += earning;
        walkerEarningsNaira += earning;
      }
      walkerStats.set(job.assignedWalkerId, walkerEntry);
    }
  }

  const topRequestedItemsRaw = await prisma.jobItem.groupBy({
    by: ["description"],
    _count: { description: true },
    orderBy: { _count: { description: "desc" } },
    take: 5,
  });

  return {
    businessCount,
    activeJobCount,
    completedJobCount: completedJobs.length,
    communityMemberCount,
    totalSalesNaira,
    walkerEarningsNaira,
    businessesMappedTarget: PIWOYI_BUSINESS_MISSION_TARGET,
    topBusinesses: [...businessJobCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    walkerPerformance: [...walkerStats.values()].sort((a, b) => b.jobsCompleted - a.jobsCompleted).slice(0, 5),
    topRequestedItems: topRequestedItemsRaw.map((row) => ({
      description: row.description,
      count: row._count.description,
    })),
  };
}

export type PiwoyiStats = Awaited<ReturnType<typeof getPiwoyiStats>>;
