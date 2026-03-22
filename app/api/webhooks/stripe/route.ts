import { store } from "@/lib/store";
import { stripe, verifyWebhookSignature, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  // --- LIVE MODE: Real Stripe webhook with signature verification ---
  if (isStripeConfigured) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return Response.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const event = await verifyWebhookSignature(body, signature);
    if (!event) {
      return Response.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      const paymentId = session.payment_intent as string;

      if (orderId) {
        const order = await store.markOrderPaid(orderId, paymentId);
        if (order) {
          return Response.json({
            success: true,
            mode: "live",
            message: `Stripe payment ${paymentId} confirmed for order ${order.order_number}`,
          });
        }
      }
    }

    return Response.json({ received: true, mode: "live" });
  }

  // --- DEMO MODE: Accept raw JSON body ---
  const body = await request.json();
  const { order_id, payment_id } = body;

  if (!order_id) {
    return Response.json({ error: "order_id is required" }, { status: 400 });
  }

  const order = await store.markOrderPaid(order_id, payment_id || `pi_demo_${Date.now()}`);
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json({
    success: true,
    mode: "demo",
    message: `Payment confirmed for order ${order.order_number}`,
    order,
  });
}
