import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isDemoModeEnabled } from "@/lib/env";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const createPostSchema = z.object({
  type: z.enum(["JOB", "BUSINESS_HIGHLIGHT", "REQUEST", "OPPORTUNITY", "ANNOUNCEMENT", "SUPPORT_LOCAL"]),
  title: z.string().min(2).max(150),
  body: z.string().min(2).max(2000),
});

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createPostSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  }

  const post = await prisma.communityPost.create({
    data: { ...parsed.data, authorType: "ADMIN" },
  });

  return NextResponse.json({ data: { id: post.id } }, { status: 201 });
}

export async function GET() {
  const posts = await prisma.communityPost.findMany({
    where: {
      isPublished: true,
      isDemoData: isDemoModeEnabled ? undefined : false,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const withLocation = posts.filter((p) => p.latitude != null && p.longitude != null);

  return NextResponse.json({
    data: {
      posts: posts.map((p) => ({
        id: p.id,
        type: p.type,
        title: p.title,
        body: p.body,
        createdAt: p.createdAt,
      })),
      pins: withLocation.map((p) => ({ id: p.id, latitude: p.latitude, longitude: p.longitude, title: p.title })),
    },
  });
}
