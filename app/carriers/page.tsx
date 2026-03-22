import { Star, Phone, Mail, Shield, Truck, CheckCircle2 } from "lucide-react";
import { store } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CarriersPage() {
  const carriers = await store.getCarriers();
  const orders = await store.getOrders();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Carriers
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {carriers.length} registered carriers
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {carriers.map((carrier, i) => {
          const carrierOrders = orders.filter(
            (o) => o.carrier_id === carrier.id
          );
          const activeOrders = carrierOrders.filter(
            (o) => o.status !== "delivered"
          );

          return (
            <div
              key={carrier.id}
              className={`bg-white rounded-xl border border-border p-5 animate-fade-in`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {carrier.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] font-mono text-text-muted">
                      {carrier.mc_number}
                    </span>
                    <span className="text-[11px] font-mono text-text-muted">
                      {carrier.dot_number}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-700">
                    {carrier.rating}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-surface-raised rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-text-primary">
                    {carrier.total_deliveries}
                  </p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
                    Deliveries
                  </p>
                </div>
                <div className="bg-surface-raised rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-success">
                    {carrier.on_time_percentage}%
                  </p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
                    On Time
                  </p>
                </div>
                <div className="bg-surface-raised rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-accent">
                    {activeOrders.length}
                  </p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
                    Active
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-xs text-text-secondary">
                    {carrier.contact_name} · {carrier.contact_phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-xs text-text-secondary">
                    {carrier.contact_email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-xs text-text-secondary">
                    Insurance expires {formatDate(carrier.insurance_expiry)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
