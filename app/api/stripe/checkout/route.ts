import { store } from "@/lib/store";
import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  const { order_id } = await request.json();

  if (!order_id) {
    return Response.json({ error: "order_id is required" }, { status: 400 });
  }

  const order = await store.getOrder(order_id);
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  // --- LIVE MODE: Create real Stripe checkout session ---
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
        checkout_url: session.url,
        session_id: session.sessionId,
      });
    }

    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }

  // --- DEMO MODE: Return a simulated checkout URL ---
  return Response.json({
    success: true,
    mode: "demo",
    checkout_url: null,
    message: `Stripe not configured. In live mode, this would redirect to a Stripe checkout for $${order.deposit} deposit on ${order.order_number}.`,
  });
}
