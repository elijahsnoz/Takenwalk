"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HandDrawnFrame } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Label } from "@/components/ui/Field";

export function RequestForm({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      businessId,
      customerName: String(formData.get("customerName") ?? ""),
      customerPhone: String(formData.get("customerPhone") ?? ""),
      description: String(formData.get("description") ?? ""),
      quantity: String(formData.get("quantity") ?? "") || undefined,
      destinationAddressText: String(formData.get("destinationAddressText") ?? "") || undefined,
      instructions: String(formData.get("instructions") ?? "") || undefined,
      preferredCommunicationChannel: String(formData.get("preferredCommunicationChannel") ?? "WHATSAPP"),
    };

    const res = await fetch("/api/jobs", {
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
    router.push("/request/success");
  }

  return (
    <HandDrawnFrame className="mt-6 p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Label htmlFor="customerName">
          Your name
          <Input id="customerName" name="customerName" required maxLength={120} />
        </Label>
        <Label htmlFor="customerPhone">
          Your phone number
          <Input id="customerPhone" name="customerPhone" type="tel" required maxLength={20} />
        </Label>
        <Label htmlFor="description">
          What do you need from {businessName}?
          <Textarea id="description" name="description" required rows={3} maxLength={1000} />
        </Label>
        <Label htmlFor="quantity">
          Quantity (optional)
          <Input id="quantity" name="quantity" maxLength={100} />
        </Label>
        <Label htmlFor="destinationAddressText">
          Where should it go?
          <Input id="destinationAddressText" name="destinationAddressText" maxLength={300} />
        </Label>
        <Label htmlFor="instructions">
          Instructions (optional)
          <Textarea id="instructions" name="instructions" rows={2} maxLength={1000} />
        </Label>
        <Label htmlFor="preferredCommunicationChannel">
          How should we reach you?
          <Select id="preferredCommunicationChannel" name="preferredCommunicationChannel" defaultValue="WHATSAPP">
            <option value="WHATSAPP">WhatsApp</option>
            <option value="SMS">SMS</option>
            <option value="PHONE">Phone call</option>
          </Select>
        </Label>

        {error ? <p className="text-sm text-red">{error}</p> : null}

        <Button type="submit" disabled={loading} size="lg" className="mt-2">
          {loading ? "Sending…" : "Send Request"}
        </Button>
      </form>
    </HandDrawnFrame>
  );
}
