import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  User,
  Car,
  MapPin,
  Truck,
  CreditCard,
  FileText,
  Clock,
  Bell,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { store } from "@/lib/store";
import { formatCurrency, formatDate, formatDateTime, timeAgo } from "@/lib/utils";
import { ORDER_STATUS_CONFIG, type OrderStatus } from "@/lib/types";
import StatusBadge from "@/components/status-badge";
import OrderActions from "./order-actions";


export const dynamic = "force-dynamic";

const statusSteps: OrderStatus[] = [
  "booked",
  "dispatched",
  "picked_up",
  "in_transit",
  "delivered",
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await store.getOrder(id);
  if (!order) notFound();

  const history = await store.getStatusHistory(id);
  const notifications = (await store.getNotifications()).filter(
    (n) => n.order_id === id
  );

  const currentStep = ORDER_STATUS_CONFIG[order.status].step;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/orders"
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-raised transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-text-primary tracking-tight font-mono">
              {order.order_number}
            </h1>
            <StatusBadge status={order.status} size="md" />
            {order.is_paid && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-success bg-success-bg rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Paid
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-0.5">
            {order.vehicle_year} {order.vehicle_make} {order.vehicle_model} ·{" "}
            {order.origin_city}, {order.origin_state} → {order.destination_city},{" "}
            {order.destination_state}
          </p>
        </div>
        <OrderActions orderId={order.id} currentStatus={order.status} isPaid={order.is_paid} />
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-5">
          Transport Progress
        </h2>
        <div className="flex items-center">
          {statusSteps.map((step, i) => {
            const config = ORDER_STATUS_CONFIG[step];
            const stepNum = config.step;
            const isComplete = currentStep >= stepNum;
            const isCurrent = currentStep === stepNum;
            const isLast = i === statusSteps.length - 1;

            return (
              <div
                key={step}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isComplete
                        ? isCurrent
                          ? "border-accent bg-accent text-white shadow-lg shadow-blue-200"
                          : "border-emerald-500 bg-emerald-500 text-white"
                        : "border-border bg-white text-text-muted"
                      }`}
                  >
                    {isComplete && !isCurrent ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{stepNum}</span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] font-medium mt-2 ${isComplete ? "text-text-primary" : "text-text-muted"
                      }`}
                  >
                    {config.label}
                  </p>
                </div>
                {!isLast && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mt-[-20px] rounded-full ${currentStep > stepNum ? "bg-emerald-500" : "bg-border"
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Customer
            </h3>
          </div>
          <div className="space-y-3">
            <InfoRow label="Name" value={order.customer_name} />
            <InfoRow label="Email" value={order.customer_email} />
            <InfoRow label="Phone" value={order.customer_phone} />
            {order.hubspot_deal_id && (
              <InfoRow label="HubSpot Deal" value={order.hubspot_deal_id} mono />
            )}
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-4 h-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Vehicle
            </h3>
          </div>
          <div className="space-y-3">
            <InfoRow
              label="Vehicle"
              value={`${order.vehicle_year} ${order.vehicle_make} ${order.vehicle_model}`}
            />
            <InfoRow label="VIN" value={order.vehicle_vin} mono />
            <InfoRow
              label="Condition"
              value={
                order.vehicle_condition === "running"
                  ? "Running"
                  : "Not Running"
              }
            />
          </div>
        </div>

        {/* Route Info */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Route
            </h3>
          </div>
          <div className="space-y-3">
            <InfoRow
              label="Origin"
              value={`${order.origin_city}, ${order.origin_state} ${order.origin_zip}`}
            />
            <InfoRow
              label="Destination"
              value={`${order.destination_city}, ${order.destination_state} ${order.destination_zip}`}
            />
            <InfoRow
              label="Distance"
              value={`${order.distance_miles.toLocaleString()} miles`}
            />
            {order.estimated_delivery && (
              <InfoRow
                label="Est. Delivery"
                value={formatDate(order.estimated_delivery)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Carrier Info */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Carrier
            </h3>
          </div>
          {order.carrier_name ? (
            <div className="space-y-3">
              <InfoRow label="Carrier" value={order.carrier_name} />
              {order.driver_name && (
                <InfoRow label="Driver" value={order.driver_name} />
              )}
              {order.driver_phone && (
                <InfoRow label="Driver Phone" value={order.driver_phone} />
              )}
              {order.central_dispatch_id && (
                <InfoRow
                  label="CD Reference"
                  value={order.central_dispatch_id}
                  mono
                />
              )}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              No carrier assigned yet
            </p>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Payment
            </h3>
          </div>
          <div className="space-y-3">
            <InfoRow label="Total Price" value={formatCurrency(order.price)} />
            <InfoRow label="Deposit" value={formatCurrency(order.deposit)} />
            <InfoRow
              label="Balance Due"
              value={formatCurrency(order.balance_due)}
            />
            <InfoRow
              label="Status"
              value={order.is_paid ? "Paid" : "Pending"}
            />
            {order.stripe_payment_id && (
              <InfoRow
                label="Stripe ID"
                value={order.stripe_payment_id}
                mono
              />
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Notes
            </h3>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {order.notes || "No notes"}
          </p>
          <div className="mt-4 pt-3 border-t border-border space-y-1">
            <p className="text-[11px] text-text-muted">
              Created: {formatDateTime(order.created_at)}
            </p>
            <p className="text-[11px] text-text-muted">
              Updated: {formatDateTime(order.updated_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Status History */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Status History
            </h3>
          </div>
          <div className="space-y-0">
            {history.map((entry, i) => (
              <div key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-surface-raised border border-border flex items-center justify-center">
                    <Circle className="w-2.5 h-2.5 text-text-muted fill-current" />
                  </div>
                  {i < history.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={entry.to_status} />
                    <span className="text-[10px] text-text-muted">
                      {timeAgo(entry.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1">
                    {entry.notes}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    by {entry.changed_by}
                  </p>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-sm text-text-muted">No history yet</p>
            )}
          </div>
        </div>

        {/* Notification Log */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Notifications Sent
            </h3>
          </div>
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 rounded-lg bg-surface-raised border border-border"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider ${notif.type === "sms"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                    >
                      {notif.type}
                    </span>
                    <span
                      className={`text-[10px] font-medium ${notif.status === "sent"
                          ? "text-success"
                          : "text-danger"
                        }`}
                    >
                      {notif.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {timeAgo(notif.created_at)}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-text-primary">
                  {notif.subject}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  To: {notif.recipient}
                </p>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-sm text-text-muted">
                No notifications sent yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </p>
      <p
        className={`text-sm text-text-primary mt-0.5 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
