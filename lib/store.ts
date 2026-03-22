import type {
  Order,
  Carrier,
  Notification,
  StatusHistoryEntry,
  ActivityItem,
  OrderStatus,
} from "./types";
import {
  orders as seedOrders,
  carriers as seedCarriers,
  notifications as seedNotifications,
  statusHistory as seedHistory,
  activities as seedActivities,
} from "./mock-data";
import { generateId, generateOrderNumber } from "./utils";
import { supabase, isSupabaseConfigured } from "./supabase";

// ─── In-Memory Fallback (globalThis) ─────────────────
interface StoreData {
  orders: Order[];
  carriers: Carrier[];
  notifications: Notification[];
  statusHistory: StatusHistoryEntry[];
  activities: ActivityItem[];
}
const g = globalThis as unknown as { __store?: StoreData };
function mem(): StoreData {
  if (!g.__store) {
    g.__store = {
      orders: [...seedOrders],
      carriers: [...seedCarriers],
      notifications: [...seedNotifications],
      statusHistory: [...seedHistory],
      activities: [...seedActivities],
    };
  }
  return g.__store;
}

// ─── Helpers ──────────────────────────────────────────
function toOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    order_number: row.order_number as string,
    status: row.status as OrderStatus,
    customer_name: row.customer_name as string,
    customer_email: row.customer_email as string,
    customer_phone: row.customer_phone as string,
    vehicle_year: row.vehicle_year as number,
    vehicle_make: row.vehicle_make as string,
    vehicle_model: row.vehicle_model as string,
    vehicle_vin: row.vehicle_vin as string,
    vehicle_condition: row.vehicle_condition as "running" | "not_running",
    origin_city: row.origin_city as string,
    origin_state: row.origin_state as string,
    origin_zip: row.origin_zip as string,
    destination_city: row.destination_city as string,
    destination_state: row.destination_state as string,
    destination_zip: row.destination_zip as string,
    distance_miles: row.distance_miles as number,
    carrier_id: (row.carrier_id as string) ?? null,
    carrier_name: (row.carrier_name as string) ?? null,
    driver_name: (row.driver_name as string) ?? null,
    driver_phone: (row.driver_phone as string) ?? null,
    price: Number(row.price),
    deposit: Number(row.deposit),
    balance_due: Number(row.balance_due),
    is_paid: row.is_paid as boolean,
    stripe_payment_id: (row.stripe_payment_id as string) ?? null,
    hubspot_deal_id: (row.hubspot_deal_id as string) ?? null,
    central_dispatch_id: (row.central_dispatch_id as string) ?? null,
    pickup_date: (row.pickup_date as string) ?? null,
    delivery_date: (row.delivery_date as string) ?? null,
    estimated_delivery: (row.estimated_delivery as string) ?? null,
    notes: (row.notes as string) ?? "",
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

async function addActivityDB(data: Omit<ActivityItem, "id" | "created_at">) {
  if (supabase) {
    await supabase.from("activities").insert({ id: generateId(), ...data });
  } else {
    const d = mem();
    d.activities = [
      { ...data, id: generateId(), created_at: new Date().toISOString() },
      ...d.activities,
    ];
  }
}

async function addStatusHistoryDB(
  data: Omit<StatusHistoryEntry, "id" | "created_at">
) {
  if (supabase) {
    await supabase
      .from("status_history")
      .insert({ id: generateId(), ...data });
  } else {
    const d = mem();
    d.statusHistory = [
      { ...data, id: generateId(), created_at: new Date().toISOString() },
      ...d.statusHistory,
    ];
  }
}

// ─── Store (async, Supabase-first) ────────────────────
export const store = {
  // ── Orders ─────────────────────────────────────────
  getOrders: async (): Promise<Order[]> => {
    if (supabase) {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []).map(toOrder);
    }
    return [...mem().orders];
  },

  getOrder: async (id: string): Promise<Order | null> => {
    if (supabase) {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();
      return data ? toOrder(data) : null;
    }
    return mem().orders.find((o) => o.id === id) ?? null;
  },

  createOrder: async (data: Partial<Order>): Promise<Order> => {
    const order: Order = {
      id: generateId(),
      order_number: generateOrderNumber(),
      status: "booked",
      customer_name: data.customer_name ?? "",
      customer_email: data.customer_email ?? "",
      customer_phone: data.customer_phone ?? "",
      vehicle_year: data.vehicle_year ?? 2024,
      vehicle_make: data.vehicle_make ?? "",
      vehicle_model: data.vehicle_model ?? "",
      vehicle_vin: data.vehicle_vin ?? "",
      vehicle_condition: data.vehicle_condition ?? "running",
      origin_city: data.origin_city ?? "",
      origin_state: data.origin_state ?? "",
      origin_zip: data.origin_zip ?? "",
      destination_city: data.destination_city ?? "",
      destination_state: data.destination_state ?? "",
      destination_zip: data.destination_zip ?? "",
      distance_miles: data.distance_miles ?? 0,
      carrier_id: data.carrier_id ?? null,
      carrier_name: data.carrier_name ?? null,
      driver_name: data.driver_name ?? null,
      driver_phone: data.driver_phone ?? null,
      price: data.price ?? 0,
      deposit: data.deposit ?? 0,
      balance_due: data.balance_due ?? 0,
      is_paid: data.is_paid ?? false,
      stripe_payment_id: data.stripe_payment_id ?? null,
      hubspot_deal_id: data.hubspot_deal_id ?? null,
      central_dispatch_id: data.central_dispatch_id ?? null,
      pickup_date: data.pickup_date ?? null,
      delivery_date: data.delivery_date ?? null,
      estimated_delivery: data.estimated_delivery ?? null,
      notes: data.notes ?? "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      await supabase.from("orders").insert(order);
    } else {
      mem().orders = [order, ...mem().orders];
    }

    await addActivityDB({
      type: "new_order",
      title: "New Order Created",
      description: `${order.vehicle_year} ${order.vehicle_make} ${order.vehicle_model} — ${order.origin_city}, ${order.origin_state} → ${order.destination_city}, ${order.destination_state}`,
      order_id: order.id,
      order_number: order.order_number,
    });

    await addStatusHistoryDB({
      order_id: order.id,
      order_number: order.order_number,
      from_status: null,
      to_status: "booked",
      changed_by: data.hubspot_deal_id ? "HubSpot Webhook" : "Manual",
      notes: data.hubspot_deal_id
        ? `Order created from HubSpot deal ${data.hubspot_deal_id}`
        : "Order created manually",
    });

    return order;
  },

  updateOrderStatus: async (
    id: string,
    newStatus: OrderStatus,
    changedBy: string = "System"
  ): Promise<Order | null> => {
    const order = await store.getOrder(id);
    if (!order) return null;

    const oldStatus = order.status;
    const updates: Partial<Order> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      pickup_date:
        newStatus === "picked_up" && !order.pickup_date
          ? new Date().toISOString()
          : order.pickup_date,
      delivery_date:
        newStatus === "delivered" && !order.delivery_date
          ? new Date().toISOString()
          : order.delivery_date,
      balance_due: newStatus === "delivered" ? 0 : order.balance_due,
    };

    if (supabase) {
      const { data } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();
      if (!data) return null;
    } else {
      const d = mem();
      const idx = d.orders.findIndex((o) => o.id === id);
      if (idx === -1) return null;
      d.orders[idx] = { ...d.orders[idx], ...updates } as Order;
    }

    const statusLabels: Record<OrderStatus, string> = {
      booked: "Booked",
      dispatched: "Carrier Dispatched",
      picked_up: "Vehicle Picked Up",
      in_transit: "In Transit Update",
      delivered: "Vehicle Delivered",
    };

    await addActivityDB({
      type: "status_change",
      title: statusLabels[newStatus],
      description: `${order.vehicle_year} ${order.vehicle_make} ${order.vehicle_model} — ${order.order_number}`,
      order_id: order.id,
      order_number: order.order_number,
    });

    await addStatusHistoryDB({
      order_id: order.id,
      order_number: order.order_number,
      from_status: oldStatus,
      to_status: newStatus,
      changed_by: changedBy,
      notes: `Status changed from ${oldStatus} to ${newStatus}`,
    });

    return { ...order, ...updates } as Order;
  },

  updateOrder: async (
    id: string,
    data: Partial<Order>
  ): Promise<Order | null> => {
    const updates = { ...data, updated_at: new Date().toISOString() };
    if (supabase) {
      const { data: row } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();
      return row ? toOrder(row) : null;
    }
    const d = mem();
    const idx = d.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    d.orders[idx] = { ...d.orders[idx], ...updates } as Order;
    return d.orders[idx];
  },

  markOrderPaid: async (
    id: string,
    stripePaymentId: string
  ): Promise<Order | null> => {
    if (supabase) {
      const { data: row } = await supabase
        .from("orders")
        .update({
          is_paid: true,
          stripe_payment_id: stripePaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();
      if (!row) return null;
      const order = toOrder(row);
      await addActivityDB({
        type: "payment",
        title: "Deposit Received",
        description: `$${order.deposit} deposit received via Stripe for order ${order.order_number}`,
        order_id: id,
        order_number: order.order_number,
      });
      return order;
    }
    const d = mem();
    const idx = d.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    d.orders[idx] = {
      ...d.orders[idx],
      is_paid: true,
      stripe_payment_id: stripePaymentId,
      updated_at: new Date().toISOString(),
    };
    await addActivityDB({
      type: "payment",
      title: "Deposit Received",
      description: `$${d.orders[idx].deposit} deposit received via Stripe for order ${d.orders[idx].order_number}`,
      order_id: id,
      order_number: d.orders[idx].order_number,
    });
    return d.orders[idx];
  },

  // ── Carriers ───────────────────────────────────────
  getCarriers: async (): Promise<Carrier[]> => {
    if (supabase) {
      const { data } = await supabase.from("carriers").select("*").order("name");
      return (data ?? []) as Carrier[];
    }
    return [...mem().carriers];
  },

  getCarrier: async (id: string): Promise<Carrier | null> => {
    if (supabase) {
      const { data } = await supabase
        .from("carriers")
        .select("*")
        .eq("id", id)
        .single();
      return (data as Carrier) ?? null;
    }
    return mem().carriers.find((c) => c.id === id) ?? null;
  },

  // ── Notifications ──────────────────────────────────
  getNotifications: async (): Promise<Notification[]> => {
    if (supabase) {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as Notification[];
    }
    return [...mem().notifications];
  },

  addNotification: async (
    data: Omit<Notification, "id" | "created_at">
  ): Promise<Notification> => {
    const notif: Notification = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    if (supabase) {
      await supabase.from("notifications").insert(notif);
    } else {
      mem().notifications = [notif, ...mem().notifications];
    }
    await addActivityDB({
      type: "notification",
      title: data.type === "sms" ? "SMS Sent" : "Email Sent",
      description: `${data.subject} — sent to ${data.recipient}`,
      order_id: data.order_id,
      order_number: data.order_number,
    });
    return notif;
  },

  // ── Status History ─────────────────────────────────
  getStatusHistory: async (orderId?: string): Promise<StatusHistoryEntry[]> => {
    if (supabase) {
      let q = supabase
        .from("status_history")
        .select("*")
        .order("created_at", { ascending: false });
      if (orderId) q = q.eq("order_id", orderId);
      const { data } = await q;
      return (data ?? []) as StatusHistoryEntry[];
    }
    return orderId
      ? mem().statusHistory.filter((h) => h.order_id === orderId)
      : [...mem().statusHistory];
  },

  // ── Activities ─────────────────────────────────────
  getActivities: async (): Promise<ActivityItem[]> => {
    if (supabase) {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as ActivityItem[];
    }
    return [...mem().activities];
  },

  // ── Stats ──────────────────────────────────────────
  getStats: async () => {
    const orders = await store.getOrders();
    const total = orders.length;
    const byStatus = {
      booked: orders.filter((o) => o.status === "booked").length,
      dispatched: orders.filter((o) => o.status === "dispatched").length,
      picked_up: orders.filter((o) => o.status === "picked_up").length,
      in_transit: orders.filter((o) => o.status === "in_transit").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
    const revenue = orders.reduce((sum, o) => sum + o.price, 0);
    const collected = orders
      .filter((o) => o.is_paid)
      .reduce((sum, o) => sum + o.deposit, 0);
    const inTransit = byStatus.picked_up + byStatus.in_transit;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const deliveredThisWeek = orders.filter(
      (o) =>
        o.status === "delivered" &&
        o.delivery_date &&
        new Date(o.delivery_date) >= weekAgo
    ).length;
    return { total, byStatus, revenue, collected, inTransit, deliveredThisWeek };
  },
};
