import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { store } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";
import OrdersFilter from "./orders-filter";
import CreateOrderForm from "./create-order-form";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  let orders = await store.getOrders();

  if (params.status) {
    orders = orders.filter((o) => o.status === params.status);
  }

  if (params.q) {
    const q = params.q.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.vehicle_make.toLowerCase().includes(q) ||
        o.vehicle_model.toLowerCase().includes(q) ||
        o.origin_city.toLowerCase().includes(q) ||
        o.destination_city.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {orders.length} order{orders.length !== 1 ? "s" : ""}{" "}
            {params.status ? `· Filtered by ${params.status.replace("_", " ")}` : ""}
          </p>
        </div>
        <CreateOrderForm />
      </div>

      <OrdersFilter currentStatus={params.status} currentQuery={params.q} />

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-raised">
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Order
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Customer
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Vehicle
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Route
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Price
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Date
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order, i) => (
              <tr
                key={order.id}
                className={`hover:bg-surface-raised transition-colors group animate-fade-in`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs font-mono font-semibold text-accent hover:underline"
                  >
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-text-primary">
                    {order.customer_name}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {order.customer_phone}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-text-primary">
                    {order.vehicle_year} {order.vehicle_make}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {order.vehicle_model}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                    <MapPin className="w-3 h-3" />
                    {order.origin_city}, {order.origin_state}
                    <span className="text-text-muted mx-0.5">→</span>
                    {order.destination_city}, {order.destination_state}
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {order.distance_miles.toLocaleString()} mi
                  </p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-semibold text-text-primary">
                    {formatCurrency(order.price)}
                  </p>
                  {order.is_paid && (
                    <p className="text-[10px] text-success font-medium">Paid</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-[11px] text-text-secondary">
                    {formatDate(order.created_at)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/orders/${order.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-text-muted"
                >
                  No orders found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
