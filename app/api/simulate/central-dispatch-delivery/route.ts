import { store } from "@/lib/store";
import { sendTransportEmail, isResendConfigured } from "@/lib/resend";

export async function POST() {
  const orders = await store.getOrders();

  let target = orders.find(
    (o) => o.status === "in_transit" || o.status === "picked_up"
  );

  if (!target) {
    return Response.json({
      success: false,
      message:
        "No in-transit or picked-up orders available. Simulate a pickup first.",
    });
  }

  if (target.status === "picked_up") {
    await store.updateOrderStatus(target.id, "in_transit", "System");
  }

  const updated = await store.updateOrderStatus(
    target.id,
    "delivered",
    "Central Dispatch Polling"
  );

  let emailMode = "demo";

  // --- LIVE: Send real delivery email via Resend ---
  if (isResendConfigured) {
    const result = await sendTransportEmail({
      to: target.customer_email,
      customerName: target.customer_name,
      orderNumber: target.order_number,
      subject: `Vehicle Delivered — ${target.order_number}`,
      statusTitle: "Vehicle Delivered",
      statusMessage: `Your ${target.vehicle_year} ${target.vehicle_make} ${target.vehicle_model} has been successfully delivered to ${target.destination_city}, ${target.destination_state}. Thank you for choosing our service!`,
      vehicleDescription: `${target.vehicle_year} ${target.vehicle_make} ${target.vehicle_model}`,
      route: `${target.origin_city}, ${target.origin_state} → ${target.destination_city}, ${target.destination_state}`,
      carrierName: target.carrier_name || undefined,
    });

    emailMode = result.success ? "live" : "failed";
  }

  await store.addNotification({
    order_id: target.id,
    order_number: target.order_number,
    type: "sms",
    recipient: target.customer_phone,
    subject: "Vehicle Delivered",
    message: `Hi ${target.customer_name}, your ${target.vehicle_year} ${target.vehicle_make} ${target.vehicle_model} has been delivered to ${target.destination_city}, ${target.destination_state}. Thank you!`,
    status: "sent",
    provider: "twilio",
  });

  await store.addNotification({
    order_id: target.id,
    order_number: target.order_number,
    type: "email",
    recipient: target.customer_email,
    subject: `Your Vehicle Has Been Delivered — ${target.order_number}`,
    message: `Your ${target.vehicle_year} ${target.vehicle_make} ${target.vehicle_model} has been delivered to ${target.destination_city}, ${target.destination_state}.`,
    status: emailMode === "failed" ? "failed" : "sent",
    provider: "sendgrid",
  });

  return Response.json({
    success: true,
    email: emailMode,
    message: `Central Dispatch confirmed delivery — ${target.order_number} delivered to ${target.destination_city}, ${target.destination_state}.${emailMode === "live" ? " Real email sent via Resend." : " SMS + Email logged."}`,
    order: updated,
  });
}
