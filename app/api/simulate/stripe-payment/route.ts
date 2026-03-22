import { store } from "@/lib/store";
import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe";

export async function POST() {
  const orders = await store.getOrders();
  const unpaid = orders.filter((o) => !o.is_paid);

  if (unpaid.length === 0) {
    return Response.json({
      success: false,
      message: "All orders are already paid",
    });
  }

  const order = unpaid[Math.floor(Math.random() * unpaid.length)];

  // --- LIVE: Create a real Stripe checkout session ---
  if (isStripeConfigured) {
    const session = await createCheckoutSession({
      orderNumber: order.order_number,
      orderId: order.id,
      customerEmail: order.customer_email,
      depositAmount: order.deposit,
      vehicleDescription: `${order.vehicle_year} ${order.vehicle_make} ${order.vehicle_model} — ${order.origin_city}, ${order.origin_state} → ${order.destination_city}, ${order.destination_state}`,
    });

    if (session) {
      return Response.json({
        success: true,
        mode: "live",
        message: `Stripe checkout session created for $${order.deposit} deposit on ${order.order_number}. Opening checkout...`,
        checkout_url: session.url,
        session_id: session.sessionId,
        order_id: order.id,
      });
    }
  }

  // --- DEMO: Simulate instant payment ---
  const paymentId = `pi_demo_${Date.now().toString(36)}`;
  const updated = await store.markOrderPaid(order.id, paymentId);

  return Response.json({
    success: true,
    mode: "demo",
    message: `Stripe payment ${paymentId} confirmed — $${order.deposit} deposit for order ${order.order_number}`,
    order: updated,
  });
}
