import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUS_CONFIG } from "@/lib/types";

export default function StatusBadge({
  status,
  size = "sm",
}: {
  status: OrderStatus;
  size?: "sm" | "md";
}) {
  const config = ORDER_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border rounded-full",
        config.bgColor,
        config.color,
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          status === "in_transit" || status === "picked_up"
            ? "animate-pulse-dot"
            : "",
          status === "booked" && "bg-blue-500",
          status === "dispatched" && "bg-orange-500",
          status === "picked_up" && "bg-amber-500",
          status === "in_transit" && "bg-violet-500",
          status === "delivered" && "bg-emerald-500"
        )}
      />
      {config.label}
    </span>
  );
}
