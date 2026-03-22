import { store } from "@/lib/store";
import { isHubSpotConfigured } from "@/lib/hubspot";

export async function POST(request: Request) {
  const body = await request.json();

  // --- LIVE MODE: Handle real HubSpot webhook payload ---
  if (isHubSpotConfigured) {
    // HubSpot sends an array of events
    const events = Array.isArray(body) ? body : [body];

    const results = [];
    for (const event of events) {
      // HubSpot deal webhook payload structure
      if (
        event.subscriptionType === "deal.propertyChange" &&
        event.propertyName === "dealstage" &&
        event.propertyValue === "closedwon"
      ) {
        const dealId = String(event.objectId);

        // Fetch deal details from HubSpot to get full info
        const { getDeal } = await import("@/lib/hubspot");
        const dealProps = await getDeal(dealId);

        if (dealProps) {
          const order = await store.createOrder({
            customer_name: dealProps.dealname?.split("—")[0]?.trim() || "HubSpot Customer",
            customer_email: "",
            customer_phone: "",
            vehicle_year: 2024,
            vehicle_make: "Vehicle",
            vehicle_model: "From HubSpot",
            price: Number(dealProps.amount) || 0,
            deposit: Math.round((Number(dealProps.amount) || 0) * 0.25),
            balance_due: Math.round((Number(dealProps.amount) || 0) * 0.75),
            hubspot_deal_id: dealId,
          });

          results.push({
            deal_id: dealId,
            order_number: order.order_number,
            status: "created",
          });
        }
      }
    }

    return Response.json({
      success: true,
      mode: "live",
      processed: results.length,
      results,
    });
  }

  // --- DEMO MODE: Accept simplified payload ---
  const {
    deal_id,
    customer_name,
    customer_email,
    customer_phone,
    vehicle_year,
    vehicle_make,
    vehicle_model,
    vehicle_vin,
    origin_city,
    origin_state,
    origin_zip,
    destination_city,
    destination_state,
    destination_zip,
    price,
    deposit,
  } = body;

  const order = await store.createOrder({
    customer_name,
    customer_email,
    customer_phone,
    vehicle_year,
    vehicle_make,
    vehicle_model,
    vehicle_vin: vehicle_vin || "",
    vehicle_condition: "running",
    origin_city,
    origin_state,
    origin_zip,
    destination_city,
    destination_state,
    destination_zip,
    distance_miles: body.distance_miles || 0,
    price,
    deposit,
    balance_due: price - deposit,
    hubspot_deal_id: deal_id,
  });

  return Response.json({
    success: true,
    mode: "demo",
    message: `Order ${order.order_number} created from HubSpot deal ${deal_id}`,
    order,
  });
}
