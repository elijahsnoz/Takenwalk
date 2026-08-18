"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HandDrawnFrame } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);
    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <HandDrawnFrame className="w-full max-w-sm p-8">
      <h1 className="font-display text-2xl font-extrabold text-ink">TakenWalk</h1>
      <p className="mt-1 text-sm text-ink-soft">Piwoyi admin sign in</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-ink/20 px-3 py-2 text-ink outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-ink/20 px-3 py-2 text-ink outline-none focus:border-ink"
          />
        </label>

        {error ? <p className="text-sm text-red">{error}</p> : null}

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </HandDrawnFrame>
  );
}
