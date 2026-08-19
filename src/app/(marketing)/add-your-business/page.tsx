"use client";

import { useState, type FormEvent } from "react";
import { HandDrawnFrame } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Label } from "@/components/ui/Field";
import { BUSINESS_CATEGORY_META } from "@/lib/constants";

export default function AddYourBusinessPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      categoryKey: String(formData.get("categoryKey") ?? ""),
      ownerName: String(formData.get("ownerName") ?? "") || undefined,
      phone: String(formData.get("phone") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? "") || undefined,
      address: String(formData.get("address") ?? "") || undefined,
      description: String(formData.get("description") ?? "") || undefined,
    };

    const res = await fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Something went wrong — please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-ink">Thank you!</h1>
        <p className="mt-3 text-ink-soft">
          We&apos;ve got your business details. The Taken A Walk team will visit to verify and add
          you to the Piwoyi map.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold text-ink">Add Your Business</h1>
      <p className="mt-3 text-ink-soft">
        Tell us about your business and we&apos;ll visit to verify it and add you to the Piwoyi
        map.
      </p>

      <HandDrawnFrame className="mt-8 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Label htmlFor="name">
            Business name
            <Input id="name" name="name" required maxLength={120} />
          </Label>

          <Label htmlFor="categoryKey">
            Category
            <Select id="categoryKey" name="categoryKey" required defaultValue="">
              <option value="" disabled>
                Choose a category
              </option>
              {Object.entries(BUSINESS_CATEGORY_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.emoji} {meta.label}
                </option>
              ))}
            </Select>
          </Label>

          <Label htmlFor="ownerName">
            Owner / contact name
            <Input id="ownerName" name="ownerName" maxLength={120} />
          </Label>

          <Label htmlFor="phone">
            Phone number
            <Input id="phone" name="phone" type="tel" required maxLength={20} />
          </Label>

          <Label htmlFor="whatsapp">
            WhatsApp number (if different)
            <Input id="whatsapp" name="whatsapp" type="tel" maxLength={20} />
          </Label>

          <Label htmlFor="address">
            Address
            <Input id="address" name="address" maxLength={300} />
          </Label>

          <Label htmlFor="description">
            What do you sell or offer?
            <Textarea id="description" name="description" rows={3} maxLength={1000} />
          </Label>

          {error ? <p className="text-sm text-red">{error}</p> : null}

          <Button type="submit" disabled={loading} size="lg" className="mt-2">
            {loading ? "Sending…" : "Submit Business"}
          </Button>
        </form>
      </HandDrawnFrame>
    </div>
  );
}
