import { getPiwoyiStats } from "@/lib/stats";
import { StatTile } from "@/components/ui/StatTile";
import { RankedList } from "@/app/admin/piwoyi/components/RankedList";

export const dynamic = "force-dynamic";

export default async function AdminSalesPage() {
  const stats = await getPiwoyiStats();
  const averageOrderValue = stats.completedJobCount > 0 ? stats.totalSalesNaira / stats.completedJobCount : 0;
  const platformRevenueNaira = Math.max(0, stats.totalSalesNaira - stats.walkerEarningsNaira);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">Piwoyi Local Commerce Intelligence</h1>
        <p className="text-sm text-ink-soft">Sales performance across every completed job.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Total Sales (GMV)" value={`₦${stats.totalSalesNaira.toLocaleString()}`} />
        <StatTile label="Completed Jobs" value={stats.completedJobCount} />
        <StatTile label="Average Order Value" value={`₦${Math.round(averageOrderValue).toLocaleString()}`} />
        <StatTile label="Walker Earnings" value={`₦${stats.walkerEarningsNaira.toLocaleString()}`} />
        <StatTile label="Platform Revenue" value={`₦${platformRevenueNaira.toLocaleString()}`} hint="Sales minus Walker earnings" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <RankedList
          title="Most Requested Products"
          emptyCopy="No requests yet — once jobs start coming in, popular items will show here."
          items={stats.topRequestedItems.map((item) => ({ key: item.description, label: item.description, value: item.count }))}
        />
        <RankedList
          title="Most Active Businesses"
          emptyCopy="No businesses ranked yet."
          items={stats.topBusinesses.map((b) => ({ key: b.name, label: b.name, value: `${b.count} jobs` }))}
        />
      </div>

      <p className="text-xs text-ink-soft">
        Daily/weekly/monthly sales breakdowns are a planned fast-follow once there&apos;s enough
        transaction history to make a trend chart meaningful.
      </p>
    </div>
  );
}
