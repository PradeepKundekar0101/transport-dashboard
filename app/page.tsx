import {
  Package,
  DollarSign,
  Truck,
  CheckCircle2,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Zap,
  Mail,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { store } from "@/lib/store";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { ORDER_STATUS_CONFIG, type OrderStatus } from "@/lib/types";
import { getIntegrationStatus } from "@/lib/integrations";
import StatusBadge from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await store.getStats();
  const orders = await store.getOrders();
  const activities = (await store.getActivities()).slice(0, 8);

  const kpis = [
    {
      label: "Total Orders",
      value: stats.total,
      icon: Package,
      color: "text-accent",
      bg: "bg-accent-light",
    },
    {
      label: "Revenue",
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      color: "text-success",
      bg: "bg-success-bg",
    },
    {
      label: "In Transit",
      value: stats.inTransit,
      icon: Truck,
      color: "text-warning",
      bg: "bg-warning-bg",
    },
    {
      label: "Delivered This Week",
      value: stats.deliveredThisWeek,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const pipeline: { status: OrderStatus; count: number }[] = [
    { status: "booked", count: stats.byStatus.booked },
    { status: "dispatched", count: stats.byStatus.dispatched },
    { status: "picked_up", count: stats.byStatus.picked_up },
    { status: "in_transit", count: stats.byStatus.in_transit },
    { status: "delivered", count: stats.byStatus.delivered },
  ];

  const activityIcons: Record<string, typeof Package> = {
    status_change: Truck,
    payment: DollarSign,
    notification: Mail,
    new_order: Package,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Overview of your transport operations
          </p>
        </div>
        <Link
          href="/orders"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
        >
          View All Orders
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`bg-white rounded-xl border border-border p-5 animate-fade-in stagger-${i + 1}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}
              >
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{kpi.value}</p>
            <p className="text-xs text-text-secondary mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">
            Order Pipeline
          </h2>
          <span className="text-xs text-text-muted">
            {stats.total} total orders
          </span>
        </div>
        <div className="flex gap-2">
          {pipeline.map((p) => {
            const config = ORDER_STATUS_CONFIG[p.status];
            const pct =
              stats.total > 0
                ? Math.max((p.count / stats.total) * 100, 8)
                : 20;
            return (
              <Link
                key={p.status}
                href={`/orders?status=${p.status}`}
                className="group flex-1 min-w-0"
                style={{ flex: `${pct} 1 0%` }}
              >
                <div
                  className={`h-12 rounded-lg ${config.bgColor} border flex items-center justify-center transition-all group-hover:scale-[1.02] group-hover:shadow-sm`}
                >
                  <span className={`text-lg font-bold ${config.color}`}>
                    {p.count}
                  </span>
                </div>
                <p
                  className={`text-[11px] font-medium mt-1.5 text-center ${config.color}`}
                >
                  {config.label}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Recent Activity */}
        <div className="col-span-3 bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">
              Recent Activity
            </h2>
            <Clock className="w-4 h-4 text-text-muted" />
          </div>
          <div className="space-y-1">
            {activities.map((act) => {
              const Icon = activityIcons[act.type] || Zap;
              return (
                <Link
                  key={act.id}
                  href={`/orders/${act.order_id}`}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-raised transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center shrink-0 group-hover:bg-white">
                    <Icon className="w-4 h-4 text-text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {act.title}
                      </p>
                      <span className="text-[10px] text-text-muted font-mono">
                        {act.order_number}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5 truncate">
                      {act.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-text-muted whitespace-nowrap shrink-0">
                    {timeAgo(act.created_at)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-span-2 bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">
              Recent Orders
            </h2>
            <Link
              href="/orders"
              className="text-[11px] text-accent font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {orders.slice(0, 6).map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-raised transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-medium text-text-primary">
                      {order.order_number}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5 truncate">
                    {order.vehicle_year} {order.vehicle_make}{" "}
                    {order.vehicle_model}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-text-primary">
                    {formatCurrency(order.price)}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {order.origin_state} → {order.destination_state}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <IntegrationStatusBar />
    </div>
  );
}

function IntegrationStatusBar() {
  const status = getIntegrationStatus();

  const items = [
    {
      name: "HubSpot",
      configured: status.hubspot.configured,
      image: "https://play-lh.googleusercontent.com/4ciMOQ0XcqbChkij9FV1HPShKHfCJwm5Ph5fypIG6veCOyAvFUmk7PCZgso_ub8nLw=w240-h480-rw"
    },
    {
      name: "Stripe",
      configured: status.stripe.configured,
    },
    {
      name: "Central Dispatch",
      configured: false,
      alwaysPolling: true,
    },
    {
      name: "Resend (Email)",
      configured: status.resend.configured,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold text-text-primary mb-3">
        Integration Status
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {items.map((integration) => (
          <div
            key={integration.name}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-raised border border-border"
          >
            <div
              className={`w-2 h-2 rounded-full ${integration.configured
                  ? "bg-emerald-500"
                  : integration.alwaysPolling
                    ? "bg-amber-500"
                    : "bg-amber-400"
                } animate-pulse-dot`}
            />
            <div>
              <p className="text-xs font-medium text-text-primary">
                {integration.name}
              </p>
              <p className="text-[10px] text-text-muted">
                {integration.configured
                  ? "Live"
                  : integration.alwaysPolling
                    ? "Polling (Demo)"
                    : "Demo Mode"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
