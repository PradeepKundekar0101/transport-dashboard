import { createDealInHubSpot, listRecentDeals, isHubSpotConfigured } from "@/lib/hubspot";

export async function GET() {
  if (!isHubSpotConfigured) {
    return Response.json({
      mode: "demo",
      message: "HubSpot not configured. Set HUBSPOT_ACCESS_TOKEN to enable.",
      deals: [],
    });
  }

  const deals = await listRecentDeals();
  return Response.json({
    mode: "live",
    deals: deals || [],
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isHubSpotConfigured) {
    return Response.json({
      mode: "demo",
      message:
        "HubSpot not configured. In live mode, this would create a deal in HubSpot CRM.",
    });
  }

  const result = await createDealInHubSpot({
    customerName: body.customer_name,
    customerEmail: body.customer_email,
    customerPhone: body.customer_phone,
    vehicleYear: body.vehicle_year,
    vehicleMake: body.vehicle_make,
    vehicleModel: body.vehicle_model,
    originCity: body.origin_city,
    originState: body.origin_state,
    destinationCity: body.destination_city,
    destinationState: body.destination_state,
    price: body.price,
    deposit: body.deposit,
  });

  if (result?.success) {
    return Response.json({
      mode: "live",
      success: true,
      deal_id: result.dealId,
      message: `Deal created in HubSpot with ID ${result.dealId}`,
    });
  }

  return Response.json(
    { error: "Failed to create deal in HubSpot" },
    { status: 500 }
  );
}
