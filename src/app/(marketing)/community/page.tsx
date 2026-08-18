import { prisma } from "@/lib/prisma";
import { isDemoModeEnabled } from "@/lib/env";
import { HandDrawnFrame } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { CommunityPostType } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const demoFilter = isDemoModeEnabled ? undefined : false;

async function getPostsByType(type: CommunityPostType) {
  return prisma.communityPost.findMany({
    where: { type, isPublished: true, isDemoData: demoFilter },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

function PostSection({
  title,
  emptyCopy,
  posts,
}: {
  title: string;
  emptyCopy: string;
  posts: { id: string; title: string; body: string }[];
}) {
  return (
    <HandDrawnFrame className="p-6">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {posts.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{emptyCopy}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <p className="text-sm font-semibold text-ink">{post.title}</p>
              <p className="text-sm text-ink-soft">{post.body}</p>
            </li>
          ))}
        </ul>
      )}
    </HandDrawnFrame>
  );
}

export default async function CommunityPage() {
  const [businesses, jobPosts, requestPosts, opportunityPosts, announcementPosts] = await Promise.all([
    prisma.business.findMany({
      where: { isPubliclyListed: true, isDemoData: demoFilter },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    getPostsByType("JOB"),
    getPostsByType("REQUEST"),
    getPostsByType("OPPORTUNITY"),
    getPostsByType("ANNOUNCEMENT"),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold text-ink">Community</h1>
      <p className="mt-2 text-ink-soft">
        Local jobs, local businesses, and everyday needs around Piwoyi.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <PostSection title="Local Jobs" emptyCopy="No local jobs posted yet." posts={jobPosts} />

        <HandDrawnFrame className="p-6">
          <h2 className="text-lg font-bold text-ink">Local Businesses</h2>
          {businesses.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">No businesses listed yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {businesses.map((business) => (
                <li key={business.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">
                    {business.category.emoji} {business.name}
                  </span>
                  <Badge tone="neutral">{business.category.label}</Badge>
                </li>
              ))}
            </ul>
          )}
        </HandDrawnFrame>

        <PostSection
          title="Community Requests"
          emptyCopy="No community requests yet — check back soon."
          posts={requestPosts}
        />
        <PostSection
          title="Local Opportunities"
          emptyCopy="No opportunities posted yet."
          posts={opportunityPosts}
        />
        <PostSection title="Announcements" emptyCopy="No announcements yet." posts={announcementPosts} />

        <HandDrawnFrame className="p-6">
          <h2 className="text-lg font-bold text-ink">Support Local</h2>
          {businesses.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Nothing to support yet — check back as businesses join.</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-ink-soft">
                Buy local, grow Piwoyi — every one of these businesses has been verified in person.
              </p>
              <div className="mt-3">
                <Button href="/map" variant="outline">
                  Browse the Map
                </Button>
              </div>
            </>
          )}
        </HandDrawnFrame>
      </div>
    </div>
  );
}
