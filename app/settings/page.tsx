import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Key,
  RefreshCw,
  Clock,
} from "lucide-react";
import { getIntegrationStatus } from "@/lib/integrations";

export const dynamic = "force-dynamic";

interface Integration {
  name: string;
  description: string;
  statusKey: "stripe" | "resend" | "hubspot" | "centralDispatch";
  color: string;
  details: { label: string; value: string }[];
  webhookUrl?: string;
  image?: string;
}

const integrations: Integration[] = [
  {
    name: "HubSpot CRM",
    description:
      "Receives deal updates when a customer books. Creates orders automatically when a deal moves to 'Closed Won'. In live mode, also creates real deals + contacts in HubSpot.",
    statusKey: "hubspot",
    color: "#FF7A59",
    details: [
      { label: "Trigger", value: "Deal stage → Closed Won" },
      { label: "Action", value: "Create order in dashboard + HubSpot deal" },
      { label: "Sync", value: "Customer name, email, phone, vehicle info" },
    ],
    webhookUrl: "/api/webhooks/hubspot",
  },
  {
    name: "Stripe Payments",
    description:
      "Creates real Stripe checkout sessions for deposits. Handles webhook events for payment confirmation. In live mode, generates actual payment links.",
    statusKey: "stripe",
    color: "#635BFF",
    details: [
      { label: "Events", value: "checkout.session.completed" },
      { label: "Action", value: "Create checkout session + mark paid" },
      { label: "Checkout", value: "/api/stripe/checkout (POST)" },
    ],
    webhookUrl: "/api/webhooks/stripe",
  },
  {
    name: "Central Dispatch",
    description:
      "Polls for load status updates every 5 minutes. Detects pickup and delivery events, then triggers notifications. API access requires a broker account.",
    statusKey: "centralDispatch",
    color: "#1E40AF",
    details: [
      { label: "Method", value: "API Polling (every 5 min)" },
      { label: "Monitors", value: "Picked Up, Delivered status changes" },
      { label: "Actions", value: "Update order + send SMS/Email" },
    ],
    webhookUrl: "/api/polling/central-dispatch",
  },
  {
    name: "Resend (Email)",
    description:
      "Sends transactional email notifications using Resend. Beautifully designed HTML templates for booking confirmations, pickup, and delivery notifications.",
    statusKey: "resend",
    color: "#000000",
    details: [
      { label: "Triggers", value: "Booking, Pickup, In Transit, Delivery" },
      { label: "Templates", value: "Custom HTML with vehicle + route details" },
      { label: "Provider", value: "Resend (replaces SendGrid)" },
    ],
  },
];

const statusConfig = {
  live: {
    label: "Live",
    icon: CheckCircle2,
    className: "text-success bg-success-bg border-emerald-200",
  },
  demo: {
    label: "Demo Mode",
    icon: AlertTriangle,
    className: "text-warning bg-warning-bg border-amber-200",
  },
};

export default function SettingsPage() {
  const integrationStatus = getIntegrationStatus();

  const liveCount = Object.values(integrationStatus).filter(
    (s) => s.configured
  ).length;
  const totalCount = Object.keys(integrationStatus).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Integration configuration and connection status
        </p>
      </div>

      {/* Architecture Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-5 h-5 text-amber-300" />
          <h2 className="text-sm font-bold">Integration Architecture</h2>
        </div>
        <p className="text-sm text-blue-100 leading-relaxed max-w-2xl">
          This dashboard connects HubSpot (CRM), Stripe (payments), and Central
          Dispatch (load management) through webhooks and API polling. Status
          changes trigger automated email notifications via Resend.
        </p>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span className="text-xs text-blue-100">
              {liveCount}/{totalCount} integrations live
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-300" />
            <span className="text-xs text-blue-100">
              {totalCount - liveCount} in demo mode
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-200" />
            <span className="text-xs text-blue-100">5 min poll interval</span>
          </div>
        </div>
      </div>

      {/* Dual-Mode Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Dual-Mode Architecture
          </p>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Each integration works in two modes. When API keys are provided in{" "}
            <code className="bg-amber-100 px-1 rounded text-[11px] font-mono">
              .env.local
            </code>
            , the system uses real APIs (HubSpot deals, Stripe checkout, Resend
            emails). Without keys, it falls back to a fully functional demo mode
            with simulated data.
          </p>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="space-y-4">
        {integrations.map((integration, i) => {
          const status = integrationStatus[integration.statusKey];
          const statusInfo = statusConfig[status.mode];
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={integration.name}
              className="bg-white rounded-xl border border-border p-5 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${integration.color}15` }}
                  >
                    <div
                      className="w-5 h-5 rounded"
                      style={{ backgroundColor: integration.color }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {integration.name}
                    </h3>
                    <p className="text-[11px] text-text-secondary mt-0.5 max-w-lg">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border ${statusInfo.className}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                {integration.details.map((detail) => (
                  <div
                    key={detail.label}
                    className="bg-surface-raised rounded-lg p-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                      {detail.label}
                    </p>
                    <p className="text-xs text-text-primary mt-1">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>

              {integration.webhookUrl && (
                <div className="flex items-center gap-2 bg-surface-raised rounded-lg px-3 py-2">
                  <Key className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-[11px] text-text-secondary">
                    Endpoint:
                  </span>
                  <code className="text-[11px] font-mono text-accent">
                    {integration.webhookUrl}
                  </code>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Environment Variables */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-1">
          Environment Variables
        </h2>
        <p className="text-[11px] text-text-secondary mb-4">
          Add these to{" "}
          <code className="bg-surface-raised px-1 rounded text-[10px] font-mono">
            .env.local
          </code>{" "}
          to enable live integrations. The system auto-detects which APIs are
          configured.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              key: "STRIPE_SECRET_KEY",
              configured: integrationStatus.stripe.configured,
            },
            {
              key: "STRIPE_WEBHOOK_SECRET",
              configured: integrationStatus.stripe.configured,
            },
            {
              key: "RESEND_API_KEY",
              configured: integrationStatus.resend.configured,
            },
            {
              key: "RESEND_FROM_EMAIL",
              configured: integrationStatus.resend.configured,
            },
            {
              key: "HUBSPOT_ACCESS_TOKEN",
              configured: integrationStatus.hubspot.configured,
            },
            {
              key: "NEXT_PUBLIC_APP_URL",
              configured: !!process.env.NEXT_PUBLIC_APP_URL,
            },
          ].map(({ key, configured }) => (
            <div
              key={key}
              className="flex items-center gap-2 bg-surface-raised rounded-lg px-3 py-2"
            >
              <div
                className={`w-2 h-2 rounded-full ${configured ? "bg-emerald-500" : "bg-amber-400"}`}
              />
              <code className="text-[11px] font-mono text-text-secondary">
                {key}
              </code>
              <span className="text-[10px] text-text-muted ml-auto">
                {configured ? "Set" : "Not set"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
