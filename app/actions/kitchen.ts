"use server";

import { mockOrders, Order } from "@/data/mockDb";

export async function getActiveOrders() {
  // Return orders that are not 'Paid' or 'Cancelled'
  return mockOrders.filter(o => ['Pending', 'Cooking'].includes(o.status));
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  const order = mockOrders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    return { success: true };
  }
  return { success: false };
}
