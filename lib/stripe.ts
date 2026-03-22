import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const isStripeConfigured = !!stripeSecretKey;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-02-25.clover" })
  : null;

export async function createCheckoutSession({
  orderNumber,
  orderId,
  customerEmail,
  depositAmount,
  vehicleDescription,
}: {
  orderNumber: string;
  orderId: string;
  customerEmail: string;
  depositAmount: number;
  vehicleDescription: string;
}): Promise<{ url: string | null; sessionId: string } | null> {
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: depositAmount * 100,
          product_data: {
            name: `Transport Deposit — ${orderNumber}`,
            description: vehicleDescription,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      order_id: orderId,
      order_number: orderNumber,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${orderId}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${orderId}?payment=cancelled`,
  });

  return { url: session.url, sessionId: session.id };
}

export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event | null> {
  if (!stripe) return null;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return null;

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    console.error("Stripe webhook signature verification failed");
    return null;
  }
}

export async function retrieveSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) return null;
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
}
