import { getIntegrationStatus } from "@/lib/integrations";

export async function GET() {
  const status = getIntegrationStatus();
  return Response.json(status);
}
