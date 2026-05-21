"use server";

import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { MenuItem } from "@/models/MenuItem";
import { verifyRole } from "./auth";
import { revalidateTag } from "next/cache";

export async function getActiveOrders() {
  await verifyRole(["admin", "kitchen"]);
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
  await verifyRole(["admin", "kitchen"]);
  await connectToDatabase();
  const order = await Order.findById(orderId);
  if (order) {
    order.status = status as any;
    await order.save();
    return { success: true };
  }
  return { success: false };
}

export async function getMenuAvailability() {
  await verifyRole(["admin", "kitchen"]);
  await connectToDatabase();
  const items = await MenuItem.find({ isAvailable: true })
    .select("_id name category soldOutToday")
    .sort({ category: 1, name: 1 })
    .lean();
  return items.map((item: any) => ({
    id: item._id.toString(),
    name: item.name,
    category: item.category,
    soldOutToday: item.soldOutToday || false,
  }));
}

export async function toggleMenuSoldOut(menuItemId: string, soldOut: boolean) {
  await verifyRole(["admin", "kitchen"]);
  await connectToDatabase();
  await MenuItem.findByIdAndUpdate(menuItemId, { soldOutToday: soldOut });
  // Invalidate the menu cache so customers see the change within 30s
  revalidateTag("menu-items", "max");
  return { success: true };
}

