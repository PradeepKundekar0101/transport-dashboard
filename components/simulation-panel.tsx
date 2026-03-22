"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SimAction {
  id: string;
  label: string;
  description: string;
  endpoint: string;
  color: string;
  image?: string;
}

const simActions: SimAction[] = [
  {
    id: "hubspot",
    label: "New HubSpot Booking",
    description:
      "Creates order + HubSpot deal (if configured) + sends confirmation email",
    endpoint: "/api/simulate/hubspot-booking",
    color: "bg-orange-500 hover:bg-orange-600",
    image: "https://play-lh.googleusercontent.com/4ciMOQ0XcqbChkij9FV1HPShKHfCJwm5Ph5fypIG6veCOyAvFUmk7PCZgso_ub8nLw=w240-h480-rw"
  },
  {
    id: "stripe",
    label: "Stripe Payment",
    description:
      "Creates real Stripe checkout (if configured) or simulates deposit",
    endpoint: "/api/simulate/stripe-payment",
    color: "bg-violet-500 hover:bg-violet-600",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQGluJhW7I1NYU7jF77E-9K9I46_ib_DUNHw&s"
  },
  {
    id: "pickup",
    label: "Central Dispatch: Picked Up",
    description: "Detects pickup → updates status + sends real email via Resend",
    endpoint: "/api/simulate/central-dispatch-pickup",
    color: "bg-amber-500 hover:bg-amber-600",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJs_M6wd3tonSp17-iCnwHVXu5hzVuBlQOSA&s"
  },
  {
    id: "deliver",
    label: "Central Dispatch: Delivered",
    description:
      "Detects delivery → updates status + sends real email via Resend",
    endpoint: "/api/simulate/central-dispatch-delivery",
    color: "bg-emerald-500 hover:bg-emerald-600",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJs_M6wd3tonSp17-iCnwHVXu5hzVuBlQOSA&s"
  },
];

interface IntegrationStatus {
  stripe: { configured: boolean; mode: string };
  resend: { configured: boolean; mode: string };
  hubspot: { configured: boolean; mode: string };
  centralDispatch: { configured: boolean; mode: string };
}

export default function SimulationPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    message: string;
    mode?: string;
  } | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    if (open && !integrations) {
      fetch("/api/integrations/status")
        .then((r) => r.json())
        .then(setIntegrations)
        .catch(() => { });
    }
  }, [open, integrations]);

  async function runSimulation(action: SimAction) {
    setLoading(action.id);
    setLastResult(null);
    try {
      const res = await fetch(action.endpoint, { method: "POST" });
      const data = await res.json();

      if (data.checkout_url) {
        window.open(data.checkout_url, "_blank");
      }

      setLastResult({
        message: data.message || "Simulation complete",
        mode: data.mode,
      });
      router.refresh();
    } catch {
      setLastResult({ message: "Simulation failed — check console" });
    } finally {
      setLoading(null);
    }
  }

  const liveCount = integrations
    ? Object.values(integrations).filter((s) => s.configured).length
    : 0;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          "bg-white rounded-xl shadow-2xl border border-border overflow-hidden transition-all duration-300",
          open ? "w-[380px]" : "w-auto"
        )}
      >
        {open && (
          <div className="p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Simulate Events
                </h3>
              </div>
              {integrations && (
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full",
                    liveCount > 0
                      ? "text-success bg-success-bg"
                      : "text-text-muted bg-surface-raised"
                  )}
                >
                  {liveCount > 0
                    ? `${liveCount} live API${liveCount > 1 ? "s" : ""}`
                    : "Demo Mode"}
                </span>
              )}
            </div>

            {/* Live API indicators */}
            {integrations && liveCount > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {integrations.stripe.configured && (
                  <LiveBadge name="Stripe" />
                )}
                {integrations.resend.configured && (
                  <LiveBadge name="Resend" />
                )}
                {integrations.hubspot.configured && (
                  <LiveBadge name="HubSpot" />
                )}
              </div>
            )}

            <p className="text-[11px] text-text-secondary leading-relaxed">
              Trigger integration events to see the full data flow.
              {liveCount > 0
                ? " Connected APIs will make real calls."
                : " Add API keys in .env.local to enable live mode."}
            </p>

            <div className="space-y-2">
              {simActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => runSimulation(action)}
                  disabled={loading !== null}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                    "bg-surface-raised hover:bg-surface-hover border border-border",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white",
                      action.color
                    )}
                  >
                    {loading === action.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <img src={action.image} alt={action.label} className="w-8 h-8 rounded-lg" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-text-muted leading-snug mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {lastResult && (
              <div
                className={cn(
                  "rounded-lg p-2.5 border",
                  lastResult.mode === "live"
                    ? "bg-success-bg border-emerald-200"
                    : "bg-accent-light border-blue-200"
                )}
              >
                <div className="flex items-start gap-2">
                  {lastResult.mode === "live" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                  )}
                  <p
                    className={cn(
                      "text-[11px] font-medium",
                      lastResult.mode === "live"
                        ? "text-success"
                        : "text-accent"
                    )}
                  >
                    {lastResult.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 w-full transition-colors",
            "hover:bg-surface-hover",
            open && "border-t border-border"
          )}
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-text-primary">
            {open ? "Close Simulation Panel" : "Simulate Events"}
          </span>
          {open ? (
            <ChevronDown className="w-4 h-4 text-text-muted ml-auto" />
          ) : (
            <ChevronUp className="w-4 h-4 text-text-muted ml-auto" />
          )}
        </button>
      </div>
    </div>
  );
}

function LiveBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
      {name}
    </span>
  );
}
