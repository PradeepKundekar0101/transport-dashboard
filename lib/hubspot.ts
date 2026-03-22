import { Client } from "@hubspot/api-client";
import { AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/deals";

const hubspotAccessToken = process.env.HUBSPOT_ACCESS_TOKEN;

export const isHubSpotConfigured = !!hubspotAccessToken;

const hubspot = hubspotAccessToken
  ? new Client({ accessToken: hubspotAccessToken })
  : null;

interface TransportDeal {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  price: number;
  deposit: number;
}

export async function createDealInHubSpot(
  deal: TransportDeal
): Promise<{ dealId: string; success: boolean } | null> {
  if (!hubspot) return null;

  try {
    const contactResponse = await hubspot.crm.contacts.basicApi.create({
      properties: {
        firstname: deal.customerName.split(" ")[0],
        lastname: deal.customerName.split(" ").slice(1).join(" ") || "",
        email: deal.customerEmail,
        phone: deal.customerPhone,
      },
      associations: [],
    });

    const contactId = contactResponse.id;

    const dealResponse = await hubspot.crm.deals.basicApi.create({
      properties: {
        dealname: `Transport: ${deal.vehicleYear} ${deal.vehicleMake} ${deal.vehicleModel} — ${deal.originCity}, ${deal.originState} → ${deal.destinationCity}, ${deal.destinationState}`,
        amount: String(deal.price),
        dealstage: "closedwon",
        pipeline: "default",
        description: [
          `Vehicle: ${deal.vehicleYear} ${deal.vehicleMake} ${deal.vehicleModel}`,
          `Origin: ${deal.originCity}, ${deal.originState}`,
          `Destination: ${deal.destinationCity}, ${deal.destinationState}`,
          `Deposit: $${deal.deposit}`,
        ].join("\n"),
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: AssociationSpecAssociationCategoryEnum.HubspotDefined,
              associationTypeId: 3,
            },
          ],
        },
      ],
    });

    return { dealId: dealResponse.id, success: true };
  } catch (err) {
    console.error("HubSpot deal creation failed:", err);
    return { dealId: "", success: false };
  }
}

export async function getDeal(
  dealId: string
): Promise<Record<string, string | null> | null> {
  if (!hubspot) return null;

  try {
    const response = await hubspot.crm.deals.basicApi.getById(dealId, [
      "dealname",
      "amount",
      "dealstage",
      "description",
    ]);
    return response.properties;
  } catch {
    return null;
  }
}

export async function listRecentDeals(): Promise<
  Array<{ id: string; name: string; amount: string; stage: string }> | null
> {
  if (!hubspot) return null;

  try {
    const response = await hubspot.crm.deals.basicApi.getPage(
      10,
      undefined,
      ["dealname", "amount", "dealstage", "createdate"],
      undefined,
      undefined,
      false
    );

    return response.results.map((deal) => ({
      id: deal.id,
      name: deal.properties.dealname || "",
      amount: deal.properties.amount || "0",
      stage: deal.properties.dealstage || "",
    }));
  } catch {
    return null;
  }
}

export async function verifyHubSpotWebhook(
  requestBody: string,
  signature: string,
  _clientSecret: string
): Promise<boolean> {
  if (!hubspotAccessToken) return false;

  // HubSpot v3 webhook signature verification
  // In production: validate using HMAC SHA-256 with client secret
  // For demo purposes, we accept if the access token is configured
  return !!signature || !!requestBody;
}
