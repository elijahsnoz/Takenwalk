"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HandDrawnFrame } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Label } from "@/components/ui/Field";

interface PayableProduct {
  id: string;
  name: string;
  priceNaira: number;
}

export function RequestForm({
  businessId,
  businessName,
  payableProducts,
}: {
  businessId: string;
  businessName: string;
  payableProducts: PayableProduct[];
}) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedProduct = payableProducts.find((product) => product.id === selectedProductId) ?? null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const customerName = String(formData.get("customerName") ?? "");
    const customerPhone = String(formData.get("customerPhone") ?? "");
    const quantity = String(formData.get("quantity") ?? "") || undefined;
    const destinationAddressText = String(formData.get("destinationAddressText") ?? "") || undefined;
    const instructions = String(formData.get("instructions") ?? "") || undefined;
    const preferredCommunicationChannel = String(formData.get("preferredCommunicationChannel") ?? "WHATSAPP");

    if (selectedProduct) {
      const res = await fetch("/api/payments/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          businessProductId: selectedProduct.id,
          customerName,
          customerPhone,
          quantity,
          destinationAddressText,
          instructions,
          preferredCommunicationChannel,
        }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setLoading(false);
        setError(body?.error ?? "Something went wrong — please try again.");
        return;
      }
      // Full-page navigation to Paystack's hosted checkout, not app state —
      // the compiler can't tell window.location assignment from a mutation.
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = body.data.authorizationUrl;
      return;
    }

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        customerName,
        customerPhone,
        description: String(formData.get("description") ?? ""),
        quantity,
        destinationAddressText,
        instructions,
        preferredCommunicationChannel,
      }),
    });

    const body = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      setError(body?.error ?? "Something went wrong — please try again.");
      return;
    }
    router.push(`/request/success?jobId=${body.data.id}`);
  }

  return (
    <HandDrawnFrame className="mt-6 p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {payableProducts.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-ink">What do you need?</p>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink/20 bg-paper px-3 py-3">
              <input
                type="radio"
                name="productChoice"
                checked={selectedProductId === null}
                onChange={() => setSelectedProductId(null)}
                className="h-5 w-5 accent-green"
              />
              <span className="text-ink">Something else (describe below)</span>
            </label>

            {payableProducts.map((product) => (
              <label
                key={product.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-ink/20 bg-paper px-3 py-3"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="productChoice"
                    checked={selectedProductId === product.id}
                    onChange={() => setSelectedProductId(product.id)}
                    className="h-5 w-5 accent-green"
                  />
                  <span className="text-ink">{product.name}</span>
                </span>
                <span className="font-semibold text-ink">₦{product.priceNaira.toLocaleString()}</span>
              </label>
            ))}
          </div>
        ) : null}

        <Label htmlFor="customerName">
          Your name
          <Input id="customerName" name="customerName" required maxLength={120} />
        </Label>
        <Label htmlFor="customerPhone">
          Your phone number
          <Input id="customerPhone" name="customerPhone" type="tel" required maxLength={20} />
        </Label>

        {!selectedProduct ? (
          <Label htmlFor="description">
            What do you need from {businessName}?
            <Textarea id="description" name="description" required rows={3} maxLength={1000} />
          </Label>
        ) : null}

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
          {loading
            ? selectedProduct
              ? "Redirecting to payment…"
              : "Sending…"
            : selectedProduct
              ? `Pay ₦${selectedProduct.priceNaira.toLocaleString()} with Paystack`
              : "Send Request"}
        </Button>
      </form>
    </HandDrawnFrame>
  );
}
