"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HandDrawnFrame } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { PinPad } from "@/components/ui/PinPad";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    if (phone.trim().length < 7 || pin.length !== 4) return;
    setLoading(true);
    setError(null);

    const result = await signIn("customer-pin", { phone: phone.trim(), pin, redirect: false });

    setLoading(false);
    if (!result || result.error) {
      setError(
        result?.code === "pin-locked"
          ? "Too many wrong tries. Please wait 15 minutes, then try again."
          : "Wrong phone number or PIN — try again."
      );
      setPin("");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <HandDrawnFrame className="w-full max-w-sm p-8">
      <h1 className="font-display text-2xl font-extrabold text-ink">Welcome Back</h1>
      <p className="mt-1 text-sm text-ink-soft">Enter your phone number and PIN.</p>

      <div className="mt-6 flex flex-col gap-4">
        <Label htmlFor="phone">
          Phone number
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
          />
        </Label>

        <div className="mt-2 flex flex-col items-center gap-2">
          <PinPad value={pin} onChange={setPin} />
        </div>

        {error ? <p className="text-center text-sm text-red">{error}</p> : null}

        <Button
          onClick={handleSubmit}
          disabled={loading || phone.trim().length < 7 || pin.length !== 4}
          size="lg"
          className="mt-2 w-full"
        >
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-ink-soft">
        New here?{" "}
        <a href="/account/register" className="font-semibold text-ink underline">
          Create an account
        </a>
      </p>
    </HandDrawnFrame>
  );
}
