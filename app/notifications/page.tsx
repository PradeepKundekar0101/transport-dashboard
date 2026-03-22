import {
  MessageSquare,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { store } from "@/lib/store";
import { formatDateTime, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await store.getNotifications();

  const stats = {
    total: notifications.length,
    sms: notifications.filter((n) => n.type === "sms").length,
    email: notifications.filter((n) => n.type === "email").length,
    sent: notifications.filter((n) => n.status === "sent").length,
    failed: notifications.filter((n) => n.status === "failed").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Notifications
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          SMS and email notification history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Sent" value={stats.total} icon={CheckCircle2} />
        <StatCard label="SMS (Twilio)" value={stats.sms} icon={MessageSquare} />
        <StatCard label="Email (SendGrid)" value={stats.email} icon={Mail} />
        <StatCard
          label="Success Rate"
          value={
            stats.total > 0
              ? `${Math.round((stats.sent / stats.total) * 100)}%`
              : "—"
          }
          icon={CheckCircle2}
        />
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-raised">
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Recipient
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Subject
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Order
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Provider
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Sent At
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {notifications.map((notif, i) => (
              <tr
                key={notif.id}
                className="hover:bg-surface-raised transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider ${
                      notif.type === "sms"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {notif.type === "sms" ? (
                      <MessageSquare className="w-3 h-3" />
                    ) : (
                      <Mail className="w-3 h-3" />
                    )}
                    {notif.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-text-primary">
                  {notif.recipient}
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-text-primary truncate max-w-[200px]">
                    {notif.subject}
                  </p>
                  <p className="text-[10px] text-text-muted truncate max-w-[200px] mt-0.5">
                    {notif.message}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/orders/${notif.order_id}`}
                    className="text-xs font-mono text-accent hover:underline"
                  >
                    {notif.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-text-secondary capitalize">
                    {notif.provider}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                      notif.status === "sent"
                        ? "text-success"
                        : notif.status === "failed"
                          ? "text-danger"
                          : "text-warning"
                    }`}
                  >
                    {notif.status === "sent" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : notif.status === "failed" ? (
                      <XCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {notif.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[11px] text-text-secondary whitespace-nowrap">
                  {timeAgo(notif.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof CheckCircle2;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-surface-raised flex items-center justify-center">
        <Icon className="w-5 h-5 text-text-secondary" />
      </div>
      <div>
        <p className="text-lg font-bold text-text-primary">{value}</p>
        <p className="text-[11px] text-text-muted">{label}</p>
      </div>
    </div>
  );
}
