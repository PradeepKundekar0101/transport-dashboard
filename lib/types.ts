export type OrderStatus =
  | "booked"
  | "dispatched"
  | "picked_up"
  | "in_transit"
  | "delivered";

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_year: number;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_vin: string;
  vehicle_condition: "running" | "not_running";
  origin_city: string;
  origin_state: string;
  origin_zip: string;
  destination_city: string;
  destination_state: string;
  destination_zip: string;
  distance_miles: number;
  carrier_id: string | null;
  carrier_name: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  price: number;
  deposit: number;
  balance_due: number;
  is_paid: boolean;
  stripe_payment_id: string | null;
  hubspot_deal_id: string | null;
  central_dispatch_id: string | null;
  pickup_date: string | null;
  delivery_date: string | null;
  estimated_delivery: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Carrier {
  id: string;
  name: string;
  mc_number: string;
  dot_number: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  rating: number;
  total_deliveries: number;
  on_time_percentage: number;
  insurance_expiry: string;
  created_at: string;
}

export interface Notification {
  id: string;
  order_id: string;
  order_number: string;
  type: "sms" | "email";
  recipient: string;
  subject: string;
  message: string;
  status: "sent" | "failed" | "pending";
  provider: "twilio" | "sendgrid" | "resend";
  created_at: string;
}

export interface StatusHistoryEntry {
  id: string;
  order_id: string;
  order_number: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string;
  notes: string;
  created_at: string;
}

export interface IntegrationLog {
  id: string;
  service: "hubspot" | "stripe" | "central_dispatch" | "twilio" | "sendgrid";
  action: string;
  status: "success" | "error";
  request_body: string;
  response_body: string;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  type: "status_change" | "payment" | "notification" | "new_order";
  title: string;
  description: string;
  order_id: string;
  order_number: string;
  created_at: string;
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; step: number }
> = {
  booked: {
    label: "Booked",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    step: 1,
  },
  dispatched: {
    label: "Dispatched",
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    step: 2,
  },
  picked_up: {
    label: "Picked Up",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    step: 3,
  },
  in_transit: {
    label: "In Transit",
    color: "text-violet-700",
    bgColor: "bg-violet-50 border-violet-200",
    step: 4,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    step: 5,
  },
};
