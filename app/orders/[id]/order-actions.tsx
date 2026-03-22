"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUS_CONFIG } from "@/lib/types";

const transitions: Record<OrderStatus, OrderStatus | null> = {
  booked: "dispatched",
  dispatched: "picked_up",
  picked_up: "in_transit",
  in_transit: "delivered",
  delivered: null,
};

export default function OrderActions({
  orderId,
  currentStatus,
  isPaid,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  isPaid: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const nextStatus = transitions[currentStatus];

  async function advanceStatus(targetStatus: OrderStatus) {
    setLoading(true);
    setShowMenu(false);
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      router.refresh();
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function sendNotification() {
    setLoading(true);
    try {
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      router.refresh();
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function openStripeCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();

      if (data.checkout_url) {
        window.open(data.checkout_url, "_blank");
      } else if (data.mode === "demo") {
        await fetch("/api/webhooks/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            payment_id: `pi_demo_${Date.now().toString(36)}`,
          }),
        });
        router.refresh();
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "delivered") {
    return (
      <span className="px-4 py-2 text-xs font-medium text-success bg-success-bg rounded-lg border border-emerald-200">
        Order Complete
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 relative">
      {!isPaid && (
        <button
          onClick={openStripeCheckout}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <CreditCard className="w-3.5 h-3.5" />
          Pay with Stripe
        </button>
      )}

      <button
        onClick={sendNotification}
        disabled={loading}
        className="px-3 py-2 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-raised transition-colors disabled:opacity-50"
      >
        Send Notification
      </button>

      {nextStatus && (
        <div className="relative">
          <div className="flex">
            <button
              onClick={() => advanceStatus(nextStatus)}
              disabled={loading}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-medium text-white rounded-l-lg transition-colors disabled:opacity-50",
                "bg-accent hover:bg-accent-hover"
              )}
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              Move to {ORDER_STATUS_CONFIG[nextStatus].label}
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="px-2 py-2 bg-accent hover:bg-accent-hover text-white rounded-r-lg border-l border-white/20"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[180px] z-10">
              {(Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[])
                .filter((s) => s !== currentStatus)
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => advanceStatus(s)}
                    className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-surface-raised transition-colors"
                  >
                    Set to {ORDER_STATUS_CONFIG[s].label}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
