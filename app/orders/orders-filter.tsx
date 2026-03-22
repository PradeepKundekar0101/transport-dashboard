"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_CONFIG, type OrderStatus } from "@/lib/types";

const statuses: (OrderStatus | "all")[] = [
  "all",
  "booked",
  "dispatched",
  "picked_up",
  "in_transit",
  "delivered",
];

export default function OrdersFilter({
  currentStatus,
  currentQuery,
}: {
  currentStatus?: string;
  currentQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/orders?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search orders..."
          defaultValue={currentQuery}
          onChange={(e) => {
            const val = e.target.value;
            if (val.length === 0 || val.length >= 2) {
              updateParams("q", val || null);
            }
          }}
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
        />
      </div>

      <div className="flex items-center gap-1 bg-white border border-border rounded-lg p-1">
        {statuses.map((s) => {
          const isActive = s === "all" ? !currentStatus : currentStatus === s;
          const label =
            s === "all" ? "All" : ORDER_STATUS_CONFIG[s].label;

          return (
            <button
              key={s}
              onClick={() => updateParams("status", s === "all" ? null : s)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-medium rounded-md transition-all",
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
