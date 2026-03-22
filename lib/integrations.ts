import { isStripeConfigured } from "./stripe";
import { isResendConfigured } from "./resend";
import { isHubSpotConfigured } from "./hubspot";
import { isSupabaseConfigured } from "./supabase";

export type IntegrationMode = "live" | "demo";

export function getIntegrationStatus() {
  return {
    supabase: {
      configured: isSupabaseConfigured,
      mode: (isSupabaseConfigured ? "live" : "demo") as IntegrationMode,
    },
    stripe: {
      configured: isStripeConfigured,
      mode: (isStripeConfigured ? "live" : "demo") as IntegrationMode,
    },
    resend: {
      configured: isResendConfigured,
      mode: (isResendConfigured ? "live" : "demo") as IntegrationMode,
    },
    hubspot: {
      configured: isHubSpotConfigured,
      mode: (isHubSpotConfigured ? "live" : "demo") as IntegrationMode,
    },
    centralDispatch: {
      configured: false,
      mode: "demo" as IntegrationMode,
    },
  };
}
