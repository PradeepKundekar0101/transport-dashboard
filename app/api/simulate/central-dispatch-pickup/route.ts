import { store } from "@/lib/store";
import { sendTransportEmail, isResendConfigured } from "@/lib/resend";

const sampleCarriers = [
  {
    carrier_id: "car_01",
    carrier_name: "Swift Auto Carriers",
    driver_name: "Carlos Mendez",
    driver_phone: "(786) 555-0412",
  },
  {
    carrier_id: "car_03",
    carrier_name: "Heartland Auto Movers",
    driver_name: "Bill Watson",
    driver_phone: "(816) 555-0291",
  },
  {
    carrier_id: "car_05",
    carrier_name: "Summit Express Transport",
    driver_name: "Ryan Cole",
    driver_phone: "(208) 555-0391",
  },
];

export async function POST() {
  const orders = await store.getOrders();

  let target = orders.find((o) => o.status === "dispatched");
  if (!target) {
    target = orders.find((o) => o.status === "booked");
    if (target) {
      const carrier =
        sampleCarriers[Math.floor(Math.random() * sampleCarriers.length)];
      await store.updateOrder(target.id, {
        ...carrier,
        central_dispatch_id: `CD-${774000 + Math.floor(Math.random() * 999)}`,
      });
      await store.updateOrderStatus(target.id, "dispatched", "System");
    }
  }

  if (!target) {
    return Response.json({
      success: false,
      message:
        "No dispatched or booked orders available. Create a new booking first.",
    });
  }

  const updated = await store.updateOrderStatus(
    target.id,
    "picked_up",
    "Central Dispatch Polling"
  );

  let emailMode = "demo";

  // --- LIVE: Send real email via Resend ---
  if (isResendConfigured) {
    const result = await sendTransportEmail({
      to: target.customer_email,
      customerName: target.customer_name,
      orderNumber: target.order_number,
      subject: `Vehicle Picked Up — ${target.order_number}`,
      statusTitle: "Vehicle Picked Up",
      statusMessage: `Your ${target.vehicle_year} ${target.vehicle_make} ${target.vehicle_model} has been picked up and is now in transit to ${target.destination_city}, ${target.destination_state}.`,
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
    subject: "Vehicle Picked Up",
    message: `Hi ${target.customer_name}, your ${target.vehicle_year} ${target.vehicle_make} ${target.vehicle_model} has been picked up and is now in transit to ${target.destination_city}, ${target.destination_state}.`,
    status: "sent",
    provider: "twilio",
  });

  await store.addNotification({
    order_id: target.id,
    order_number: target.order_number,
    type: "email",
    recipient: target.customer_email,
    subject: `Your Vehicle Has Been Picked Up — ${target.order_number}`,
    message: `Your ${target.vehicle_year} ${target.vehicle_make} ${target.vehicle_model} has been picked up and is now in transit.`,
    status: emailMode === "failed" ? "failed" : "sent",
    provider: "sendgrid",
  });

  return Response.json({
    success: true,
    email: emailMode,
    message: `Central Dispatch detected pickup — ${target.order_number} (${target.vehicle_year} ${target.vehicle_make} ${target.vehicle_model}).${emailMode === "live" ? " Real email sent via Resend." : " SMS + Email logged."}`,
    order: updated,
  });
}
