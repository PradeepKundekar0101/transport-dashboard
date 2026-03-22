import { store } from "@/lib/store";

export async function GET() {
  const orders = await store.getOrders();
  const dispatchedOrders = orders.filter(
    (o) =>
      o.central_dispatch_id &&
      (o.status === "dispatched" || o.status === "picked_up" || o.status === "in_transit")
  );

  const updates = dispatchedOrders.map((order) => ({
    order_id: order.id,
    order_number: order.order_number,
    central_dispatch_id: order.central_dispatch_id,
    current_status: order.status,
    last_checked: new Date().toISOString(),
  }));

  return Response.json({
    message: `Polling ${updates.length} orders on Central Dispatch`,
    orders_checked: updates,
    next_poll: "5 minutes",
  });
}
