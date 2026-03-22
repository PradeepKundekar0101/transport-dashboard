import { store } from "@/lib/store";
import { sendTransportEmail, isResendConfigured } from "@/lib/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const { order_id } = body;

  if (!order_id) {
    return Response.json({ error: "order_id is required" }, { status: 400 });
  }

  const order = await store.getOrder(order_id);
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  const statusMessages: Record<
    string,
    { title: string; message: string }
  > = {
    booked: {
      title: "Booking Confirmed",
      message: `Your transport order for your ${order.vehicle_year} ${order.vehicle_make} ${order.vehicle_model} from ${order.origin_city}, ${order.origin_state} to ${order.destination_city}, ${order.destination_state} has been confirmed. We'll notify you when a carrier is assigned.`,
    },
    dispatched: {
      title: "Carrier Assigned",
      message: `A carrier has been assigned to transport your ${order.vehicle_year} ${order.vehicle_make} ${order.vehicle_model}. ${order.carrier_name || "Your carrier"} will pick up your vehicle soon.`,
    },
    picked_up: {
      title: "Vehicle Picked Up",
      message: `Your ${order.vehicle_year} ${order.vehicle_make} ${order.vehicle_model} has been picked up and is now in transit to ${order.destination_city}, ${order.destination_state}.`,
    },
    in_transit: {
      title: "In Transit",
      message: `Your ${order.vehicle_year} ${order.vehicle_make} ${order.vehicle_model} is currently in transit to ${order.destination_city}, ${order.destination_state}. We'll notify you upon delivery.`,
    },
    delivered: {
      title: "Vehicle Delivered",
      message: `Your ${order.vehicle_year} ${order.vehicle_make} ${order.vehicle_model} has been successfully delivered to ${order.destination_city}, ${order.destination_state}. Thank you for choosing our service!`,
    },
  };

  const statusInfo = statusMessages[order.status] || {
    title: "Status Update",
    message: "Your order status has been updated.",
  };

  const results: Array<{ type: string; success: boolean; mode: string }> = [];

  // --- EMAIL via Resend (live or demo) ---
  if (isResendConfigured) {
    const emailResult = await sendTransportEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber: order.order_number,
      subject: `${statusInfo.title} — ${order.order_number}`,
      statusTitle: statusInfo.title,
      statusMessage: statusInfo.message,
      vehicleDescription: `${order.vehicle_year} ${order.vehicle_make} ${order.vehicle_model}`,
      route: `${order.origin_city}, ${order.origin_state} → ${order.destination_city}, ${order.destination_state}`,
      carrierName: order.carrier_name || undefined,
    });

    await store.addNotification({
      order_id: order.id,
      order_number: order.order_number,
      type: "email",
      recipient: order.customer_email,
      subject: `${statusInfo.title} — ${order.order_number}`,
      message: statusInfo.message,
      status: emailResult.success ? "sent" : "failed",
      provider: "sendgrid", // kept as "sendgrid" in type for backward compat, but it's Resend
    });

    results.push({
      type: "email",
      success: emailResult.success,
      mode: "live",
    });
  } else {
    await store.addNotification({
      order_id: order.id,
      order_number: order.order_number,
      type: "email",
      recipient: order.customer_email,
      subject: `${statusInfo.title} — ${order.order_number}`,
      message: statusInfo.message,
      status: "sent",
      provider: "sendgrid",
    });

    results.push({ type: "email", success: true, mode: "demo" });
  }

  // --- SMS (always demo for now, add Twilio later if needed) ---
  await store.addNotification({
    order_id: order.id,
    order_number: order.order_number,
    type: "sms",
    recipient: order.customer_phone,
    subject: `Order ${order.order_number} — ${statusInfo.title}`,
    message: `Hi ${order.customer_name}, ${statusInfo.message.charAt(0).toLowerCase()}${statusInfo.message.slice(1)}`,
    status: "sent",
    provider: "twilio",
  });

  results.push({ type: "sms", success: true, mode: "demo" });

  return Response.json({
    success: true,
    mode: isResendConfigured ? "live" : "demo",
    message: `Notifications sent for order ${order.order_number}`,
    results,
  });
}
