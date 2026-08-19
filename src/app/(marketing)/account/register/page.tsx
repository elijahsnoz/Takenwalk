"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { HandDrawnFrame } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { PinPad } from "@/components/ui/PinPad";

export default function CustomerRegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pinStep: "enter" | "confirm" = pin.length === 4 ? "confirm" : "enter";
  const pinMismatch = pinStep === "confirm" && confirmPin.length === 4 && confirmPin !== pin;
  const pinConfirmed = pinStep === "confirm" && confirmPin.length === 4 && confirmPin === pin;
  const canSubmit = name.trim().length >= 2 && phone.trim().length >= 7 && pinConfirmed;

  useEffect(() => {
    if (!pinMismatch) return;
    const timeout = setTimeout(() => {
      setPin("");
      setConfirmPin("");
    }, 900);
    return () => clearTimeout(timeout);
  }, [pinMismatch]);

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("phone", phone.trim());
    formData.set("pin", pin);
    if (photo) formData.set("dp", photo);

    const res = await fetch("/api/customers/register", { method: "POST", body: formData });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Something went wrong — please try again.");
      setLoading(false);
      return;
    }

    const result = await signIn("customer-pin", { phone: phone.trim(), pin, redirect: false });
    setLoading(false);
    if (!result || result.error) {
      router.push("/account/login");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12 sm:px-6">
      <HandDrawnFrame className="p-8">
        <h1 className="font-display text-2xl font-extrabold text-ink">Create Your Account</h1>
        <p className="mt-1 text-sm text-ink-soft">Just your name, phone, and a 4-digit PIN.</p>

        {pinStep === "enter" ? (
          <div className="mt-6 flex flex-col gap-4">
            <Label htmlFor="name">
              Your name
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
            </Label>
            <Label htmlFor="phone">
              Phone number
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
              />
            </Label>

            <div className="mt-2 flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-ink">Choose a 4-digit PIN</p>
              <PinPad value={pin} onChange={setPin} />
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-ink">Enter your PIN again to confirm</p>
            <PinPad value={confirmPin} onChange={setConfirmPin} />
            {pinMismatch ? <p className="text-sm text-red">PINs don&apos;t match — try again.</p> : null}
            <button
              type="button"
              onClick={() => {
                setPin("");
                setConfirmPin("");
              }}
              className="mt-1 text-xs font-semibold text-ink-soft underline"
            >
              Start PIN over
            </button>
          </div>
        )}

        {pinConfirmed ? (
          <div className="mt-6 flex flex-col gap-2">
            <p className="text-sm font-medium text-ink">Add a photo (optional)</p>
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="text-sm text-ink-soft"
            />
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red">{error}</p> : null}

        <Button onClick={handleSubmit} disabled={!canSubmit || loading} size="lg" className="mt-6 w-full">
          {loading ? "Creating account…" : "Create Account"}
        </Button>

        <p className="mt-4 text-center text-xs text-ink-soft">
          Already have an account?{" "}
          <a href="/account/login" className="font-semibold text-ink underline">
            Sign in
          </a>
        </p>
      </HandDrawnFrame>
    </div>
  );
}
