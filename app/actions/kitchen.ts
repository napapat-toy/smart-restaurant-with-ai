"use server";

import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function getActiveOrders() {
  await connectToDatabase();
  const orders = await Order.find({ status: { $in: ['Pending', 'Cooking'] } })
    .sort({ createdAt: 1 })
    .lean();
    
  return orders.map((o: any) => ({
    id: o._id.toString(),
    tableId: o.tableId,
    items: o.items,
    totalAmount: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt,
  }));
}

export async function updateOrderStatus(orderId: string, status: string) {
  await connectToDatabase();
  const order = await Order.findById(orderId);
  if (order) {
    order.status = status as any;
    await order.save();
    return { success: true };
  }
  return { success: false };
}
