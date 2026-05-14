"use server";

import { mockOrders, mockTables, Order, OrderItem } from "@/data/mockDb";

export async function submitOrder(tableId: string, cartItems: { itemId: string, name: string, price: number, quantity: number, note?: string }[]) {
  try {
    // In a real app, we would calculate totalAmount from the DB price again to be safe.
    // For this prototype, we'll calculate it from the passed items.
    let totalAmount = 0;
    
    const orderItems: OrderItem[] = cartItems.map(item => {
      totalAmount += item.price * item.quantity;
      return {
        menuItemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        note: item.note || "",
      };
    });

    const newOrder: Order = {
      id: "ord_" + Math.random().toString(36).substring(2, 9),
      tableId,
      items: orderItems,
      totalAmount,
      status: "Pending",
      createdAt: new Date(),
    };

    // Push to mock database array
    mockOrders.push(newOrder);

    // Mark table as occupied
    const table = mockTables.find(t => t.tableNumber === tableId || t.id === tableId);
    if (table) {
      table.status = 'Occupied';
    }

    // Normally we would also trigger a Pusher event here to notify the kitchen
    // e.g. await pusher.trigger('kitchen', 'new-order', newOrder);

    return { success: true, orderId: newOrder.id };
  } catch (error) {
    console.error("Order submission failed:", error);
    return { success: false, error: "Failed to submit order" };
  }
}

export async function getTableOrders(tableId: string) {
  // Sort by newest first
  return mockOrders
    .filter(o => o.tableId === tableId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function cancelOrder(orderId: string) {
  const order = mockOrders.find(o => o.id === orderId);
  if (order && order.status === 'Pending') {
    order.status = 'Cancelled';
    return { success: true };
  }
  return { success: false, error: "Cannot cancel this order" };
}
