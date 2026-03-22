import { store } from "@/lib/store";

export async function GET() {
  const orders = await store.getOrders();
  return Response.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();
  const order = await store.createOrder(body);
  return Response.json(order, { status: 201 });
}
