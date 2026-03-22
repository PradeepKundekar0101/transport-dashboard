import { store } from "@/lib/store";
import { createDealInHubSpot, isHubSpotConfigured } from "@/lib/hubspot";
import { sendTransportEmail, isResendConfigured } from "@/lib/resend";

const sampleBookings = [
  {
    customer_name: "Jennifer Walsh",
    customer_email: "jen.walsh@email.com",
    customer_phone: "(512) 555-0734",
    vehicle_year: 2023,
    vehicle_make: "Mercedes-Benz",
    vehicle_model: "GLE 450",
    vehicle_vin: "4JGFB4KB0PA12345",
    origin_city: "Austin",
    origin_state: "TX",
    origin_zip: "78701",
    destination_city: "Orlando",
    destination_state: "FL",
    destination_zip: "32801",
    distance_miles: 1140,
    price: 1200,
    deposit: 300,
  },
  {
    customer_name: "Marcus Thompson",
    customer_email: "m.thompson@email.com",
    customer_phone: "(206) 555-0891",
    vehicle_year: 2022,
    vehicle_make: "Jeep",
    vehicle_model: "Wrangler Rubicon",
    vehicle_vin: "1C4HJXFG3NW12345",
    origin_city: "Seattle",
    origin_state: "WA",
    origin_zip: "98101",
    destination_city: "San Diego",
    destination_state: "CA",
    destination_zip: "92101",
    distance_miles: 1255,
    price: 1100,
    deposit: 275,
  },
  {
    customer_name: "Rachel Green",
    customer_email: "rachel.g@email.com",
    customer_phone: "(646) 555-0423",
    vehicle_year: 2024,
    vehicle_make: "Rivian",
    vehicle_model: "R1S",
    vehicle_vin: "7FCTGAAL0RN12345",
    origin_city: "New York",
    origin_state: "NY",
    origin_zip: "10001",
    destination_city: "Chicago",
    destination_state: "IL",
    destination_zip: "60601",
    distance_miles: 790,
    price: 975,
    deposit: 250,
  },
];

export async function POST() {
  const raw =
    sampleBookings[Math.floor(Math.random() * sampleBookings.length)];
  const testEmail = process.env.TEST_RECIPIENT_EMAIL;
  const booking = testEmail
    ? { ...raw, customer_email: testEmail }
    : raw;

  let hubspotDealId = `hs_demo_${9000 + Math.floor(Math.random() * 999)}`;
  let mode = "demo";

  // --- LIVE: Create a real deal in HubSpot ---
  if (isHubSpotConfigured) {
    const result = await createDealInHubSpot({
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      vehicleYear: booking.vehicle_year,
      vehicleMake: booking.vehicle_make,
      vehicleModel: booking.vehicle_model,
      originCity: booking.origin_city,
      originState: booking.origin_state,
      destinationCity: booking.destination_city,
      destinationState: booking.destination_state,
      price: booking.price,
      deposit: booking.deposit,
    });

    if (result?.success) {
      hubspotDealId = result.dealId;
      mode = "live";
    }
  }

  const order = await store.createOrder({
    ...booking,
    balance_due: booking.price - booking.deposit,
    hubspot_deal_id: hubspotDealId,
    estimated_delivery: new Date(
      Date.now() + 86400000 * (5 + Math.floor(Math.random() * 5))
    ).toISOString(),
  });

  // --- LIVE: Send booking confirmation via Resend ---
  if (isResendConfigured) {
    await sendTransportEmail({
      to: booking.customer_email,
      customerName: booking.customer_name,
      orderNumber: order.order_number,
      subject: `Booking Confirmed — ${order.order_number}`,
      statusTitle: "Booking Confirmed",
      statusMessage: `Your transport order for your ${booking.vehicle_year} ${booking.vehicle_make} ${booking.vehicle_model} from ${booking.origin_city}, ${booking.origin_state} to ${booking.destination_city}, ${booking.destination_state} has been confirmed.`,
      vehicleDescription: `${booking.vehicle_year} ${booking.vehicle_make} ${booking.vehicle_model}`,
      route: `${booking.origin_city}, ${booking.origin_state} → ${booking.destination_city}, ${booking.destination_state}`,
    });

    await store.addNotification({
      order_id: order.id,
      order_number: order.order_number,
      type: "email",
      recipient: booking.customer_email,
      subject: `Booking Confirmed — ${order.order_number}`,
      message: `Transport confirmed for ${booking.vehicle_year} ${booking.vehicle_make} ${booking.vehicle_model}`,
      status: "sent",
      provider: "sendgrid",
    });
  }

  return Response.json({
    success: true,
    mode,
    hubspot: isHubSpotConfigured ? "live" : "demo",
    email: isResendConfigured ? "live" : "demo",
    message: `Order ${order.order_number} created${isHubSpotConfigured ? ` + HubSpot deal ${hubspotDealId} created` : ""}${isResendConfigured ? " + confirmation email sent via Resend" : ""} — ${booking.vehicle_year} ${booking.vehicle_make} ${booking.vehicle_model}`,
    order,
  });
}
