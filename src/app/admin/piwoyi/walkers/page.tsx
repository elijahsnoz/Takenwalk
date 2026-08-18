import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AddWalkerForm } from "./AddWalkerForm";

export const dynamic = "force-dynamic";

const STATUS_TONE = { AVAILABLE: "green", BUSY: "gold", OFFLINE: "neutral" } as const;

export default async function AdminWalkersPage() {
  const walkers = await prisma.walker.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Walkers</h1>
          <p className="text-sm text-ink-soft">{walkers.length} Walkers registered.</p>
        </div>
        <AddWalkerForm />
      </div>

      {walkers.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink-soft">
          No Walkers yet — add your first Walker to start assigning jobs.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {walkers.map((walker) => (
            <Link key={walker.id} href={`/admin/piwoyi/walkers/${walker.id}`}>
              <Card className="flex items-center justify-between p-4 hover:bg-cream-soft">
                <div>
                  <p className="font-medium text-ink">{walker.name}</p>
                  <p className="text-sm text-ink-soft">{walker.phone} · {walker.communicationChannel}</p>
                </div>
                <Badge tone={STATUS_TONE[walker.status]}>{walker.status}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
