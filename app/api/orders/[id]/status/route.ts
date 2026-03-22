import { store } from "@/lib/store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, changed_by } = body;

  if (!status) {
    return Response.json({ error: "Status is required" }, { status: 400 });
  }

  const order = await store.updateOrderStatus(
    id,
    status,
    changed_by || "Dashboard User"
  );
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json(order);
}
