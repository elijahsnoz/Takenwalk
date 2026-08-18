"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Textarea, Select, Label } from "@/components/ui/Field";

type Post = { id: string; title: string; body: string };

export function CommunityFeedPanel({ posts }: { posts: Post[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/community-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: formData.get("type"),
        title: formData.get("title"),
        body: formData.get("body"),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Could not create post.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Community Feed</h2>
      </div>

      {posts.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Nothing posted yet.</p>
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

      <Button onClick={() => setOpen(true)} className="mt-4 w-full">
        + Create Post
      </Button>

      <Drawer open={open} onClose={() => setOpen(false)} title="New Community Post">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Label htmlFor="type">
            Type
            <Select id="type" name="type" defaultValue="ANNOUNCEMENT">
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="OPPORTUNITY">Opportunity</option>
              <option value="REQUEST">Community Request</option>
              <option value="JOB">Local Job</option>
              <option value="BUSINESS_HIGHLIGHT">Business Highlight</option>
              <option value="SUPPORT_LOCAL">Support Local</option>
            </Select>
          </Label>
          <Label htmlFor="title">
            Title
            <Input id="title" name="title" required maxLength={150} />
          </Label>
          <Label htmlFor="body">
            Message
            <Textarea id="body" name="body" required rows={4} maxLength={2000} />
          </Label>
          {error ? <p className="text-sm text-red">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Posting…" : "Post"}
          </Button>
        </form>
      </Drawer>
    </Card>
  );
}
