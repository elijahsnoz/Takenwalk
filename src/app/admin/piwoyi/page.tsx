import { prisma } from "@/lib/prisma";
import { getPiwoyiStats } from "@/lib/stats";
import { isDemoModeEnabled } from "@/lib/env";
import { StatTile } from "@/components/ui/StatTile";
import { MissionProgress } from "./components/MissionProgress";
import { PiwoyiMapSummary } from "./components/PiwoyiMapSummary";
import { RecentJobsTable } from "./components/RecentJobsTable";
import { RankedList } from "./components/RankedList";
import { CommunityFeedPanel } from "./components/CommunityFeedPanel";

export const dynamic = "force-dynamic";

const demoFilter = isDemoModeEnabled ? undefined : false;

export default async function AdminPiwoyiDashboardPage() {
  const [stats, recentJobs, categoryGroups, communityPosts] = await Promise.all([
    getPiwoyiStats(),
    prisma.job.findMany({
      where: { isDemoData: demoFilter },
      include: { business: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.business.groupBy({
      by: ["categoryId"],
      where: { isDemoData: demoFilter },
      _count: true,
    }),
    prisma.communityPost.findMany({
      where: { isPublished: true, isDemoData: demoFilter },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const categories = await prisma.businessCategory.findMany();
  const countsByCategory: Record<string, number> = {};
  for (const group of categoryGroups) {
    const category = categories.find((c) => c.id === group.categoryId);
    if (category) countsByCategory[category.key] = group._count;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">Piwoyi Dashboard</h1>
        <p className="text-sm text-ink-soft">Real-time view of the Piwoyi economy on Taken A Walk.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="Businesses" value={stats.businessCount} icon="🏪" />
        <StatTile label="Active Jobs" value={stats.activeJobCount} icon="🚶" />
        <StatTile label="Completed Jobs" value={stats.completedJobCount} icon="✅" />
        <StatTile label="Sales" value={`₦${stats.totalSalesNaira.toLocaleString()}`} icon="💰" />
        <StatTile label="Walker Earnings" value={`₦${stats.walkerEarningsNaira.toLocaleString()}`} icon="👛" />
        <StatTile label="Community Members" value={stats.communityMemberCount} icon="👥" />
        <StatTile
          label="Businesses Mapped"
          value={`${stats.businessCount} / ${stats.businessesMappedTarget}`}
          icon="📍"
        />
      </div>

      <MissionProgress mapped={stats.businessCount} target={stats.businessesMappedTarget} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <PiwoyiMapSummary countsByCategory={countsByCategory} />
          <RecentJobsTable jobs={recentJobs} />
        </div>

        <div className="flex flex-col gap-6">
          <RankedList
            title="Top Requested Items"
            emptyCopy="No requests yet — once jobs start coming in, popular items will show here."
            items={stats.topRequestedItems.map((item) => ({
              key: item.description,
              label: item.description,
              value: item.count,
            }))}
          />
          <RankedList
            title="Top Businesses"
            emptyCopy="No businesses ranked yet — Top Businesses will appear once mapping starts."
            items={stats.topBusinesses.map((b) => ({ key: b.name, label: b.name, value: `${b.count} jobs` }))}
          />
          <RankedList
            title="Walker Performance"
            emptyCopy="No walkers yet — add your first Walker to start assigning jobs."
            items={stats.walkerPerformance.map((w) => ({
              key: w.name,
              label: w.name,
              value: `${w.jobsCompleted} jobs · ₦${w.earningsNaira.toLocaleString()}`,
            }))}
          />
          <CommunityFeedPanel posts={communityPosts} />
        </div>
      </div>
    </div>
  );
}
