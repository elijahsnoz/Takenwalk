"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Field";

export function AddWalkerForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/walkers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        phone: formData.get("phone"),
        whatsapp: formData.get("whatsapp") || undefined,
        communicationChannel: formData.get("communicationChannel"),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not add Walker.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add Walker</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Add Walker">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Label htmlFor="name">
            Name
            <Input id="name" name="name" required maxLength={120} />
          </Label>
          <Label htmlFor="phone">
            Phone
            <Input id="phone" name="phone" type="tel" required maxLength={20} />
          </Label>
          <Label htmlFor="whatsapp">
            WhatsApp (optional)
            <Input id="whatsapp" name="whatsapp" type="tel" maxLength={20} />
          </Label>
          <Label htmlFor="communicationChannel">
            Preferred communication
            <Select id="communicationChannel" name="communicationChannel" defaultValue="PHONE">
              <option value="APP">App</option>
              <option value="WEB">Web</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="SMS">SMS</option>
              <option value="PHONE">Phone call</option>
              <option value="COORDINATOR">Coordinator-assisted</option>
            </Select>
          </Label>
          {error ? <p className="text-sm text-red">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Adding…" : "Add Walker"}
          </Button>
        </form>
      </Drawer>
    </>
  );
}
