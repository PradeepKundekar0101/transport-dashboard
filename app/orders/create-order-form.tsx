"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const initialForm = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  vehicle_year: "2024",
  vehicle_make: "",
  vehicle_model: "",
  vehicle_vin: "",
  origin_city: "",
  origin_state: "",
  origin_zip: "",
  destination_city: "",
  destination_state: "",
  destination_zip: "",
  distance_miles: "",
  price: "",
  deposit: "",
  notes: "",
};

export default function CreateOrderForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const router = useRouter();

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const price = Number(form.price) || 0;
      const deposit = Number(form.deposit) || 0;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          vehicle_year: Number(form.vehicle_year),
          distance_miles: Number(form.distance_miles) || 0,
          price,
          deposit,
          balance_due: price - deposit,
          is_paid: false,
          vehicle_condition: "running",
        }),
      });

      if (res.ok) {
        const order = await res.json();
        setForm(initialForm);
        setOpen(false);
        router.push(`/orders/${order.id}`);
        router.refresh();
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Order
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4">
        <div className="bg-white rounded-xl shadow-2xl border border-border w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-white rounded-t-xl z-10">
            <h2 className="text-lg font-bold text-text-primary">
              Create New Order
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-raised transition-colors"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Customer */}
            <fieldset>
              <legend className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Customer Information
              </legend>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Full Name"
                  value={form.customer_name}
                  onChange={(v) => set("customer_name", v)}
                  required
                  placeholder="John Smith"
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.customer_email}
                  onChange={(v) => set("customer_email", v)}
                  required
                  placeholder="john@email.com"
                />
                <Input
                  label="Phone"
                  value={form.customer_phone}
                  onChange={(v) => set("customer_phone", v)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </fieldset>

            {/* Vehicle */}
            <fieldset>
              <legend className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Vehicle Information
              </legend>
              <div className="grid grid-cols-4 gap-3">
                <Input
                  label="Year"
                  value={form.vehicle_year}
                  onChange={(v) => set("vehicle_year", v)}
                  required
                  placeholder="2024"
                />
                <Input
                  label="Make"
                  value={form.vehicle_make}
                  onChange={(v) => set("vehicle_make", v)}
                  required
                  placeholder="Toyota"
                />
                <Input
                  label="Model"
                  value={form.vehicle_model}
                  onChange={(v) => set("vehicle_model", v)}
                  required
                  placeholder="Camry"
                />
                <Input
                  label="VIN"
                  value={form.vehicle_vin}
                  onChange={(v) => set("vehicle_vin", v)}
                  placeholder="Optional"
                />
              </div>
            </fieldset>

            {/* Route */}
            <fieldset>
              <legend className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Route
              </legend>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-[11px] font-medium text-text-muted">
                    Origin
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Input
                        label="City"
                        value={form.origin_city}
                        onChange={(v) => set("origin_city", v)}
                        required
                        placeholder="Los Angeles"
                      />
                    </div>
                    <Input
                      label="State"
                      value={form.origin_state}
                      onChange={(v) => set("origin_state", v)}
                      required
                      placeholder="CA"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-medium text-text-muted">
                    Destination
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Input
                        label="City"
                        value={form.destination_city}
                        onChange={(v) => set("destination_city", v)}
                        required
                        placeholder="Miami"
                      />
                    </div>
                    <Input
                      label="State"
                      value={form.destination_state}
                      onChange={(v) => set("destination_state", v)}
                      required
                      placeholder="FL"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Pricing */}
            <fieldset>
              <legend className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Pricing
              </legend>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Total Price ($)"
                  value={form.price}
                  onChange={(v) => set("price", v)}
                  required
                  placeholder="1200"
                  type="number"
                />
                <Input
                  label="Deposit ($)"
                  value={form.deposit}
                  onChange={(v) => set("deposit", v)}
                  required
                  placeholder="300"
                  type="number"
                />
                <Input
                  label="Distance (mi)"
                  value={form.distance_miles}
                  onChange={(v) => set("distance_miles", v)}
                  placeholder="1200"
                  type="number"
                />
              </div>
            </fieldset>

            {/* Notes */}
            <fieldset>
              <legend className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Notes
              </legend>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={2}
                placeholder="Any special instructions..."
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
              />
            </fieldset>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-raised transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-text-secondary mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
      />
    </div>
  );
}
