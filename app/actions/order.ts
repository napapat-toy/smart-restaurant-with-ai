"use server";

import connectToDatabase from "@/lib/mongodb";
import { MenuItem } from "@/models/MenuItem";
import { Table } from "@/models/Table";
import { Order } from "@/models/Order";
import { RateLimit } from "@/models/RateLimit";

export async function submitOrder(tableId: string, token: string, cartItems: { itemId: string, quantity: number, note?: string }[]) {
  try {
    await connectToDatabase();

    // 1. Verify URL Tampering (Token Validation)
    const table = await Table.findOne({
      tableNumber: tableId,
      token: token
    });
    if (!table) {
      return { success: false, error: "ลิงก์โต๊ะไม่ถูกต้อง หรือหมดอายุแล้ว" };
    }

    // 2. Prevent API Spamming (Order Rate Limiting)
    const rateLimitKey = `order_limit_${table.tableNumber}`;
    const rateLimit = await RateLimit.findOne({ ip: rateLimitKey });
    
    if (rateLimit && rateLimit.attempts >= 5) {
      return { success: false, error: "คุณสั่งอาหารถี่เกินไป กรุณารอ 2 นาที" };
    }

    // Update or create rate limit
    if (rateLimit) {
      rateLimit.attempts += 1;
      await rateLimit.save();
    } else {
      await RateLimit.create({ 
        ip: rateLimitKey, 
        attempts: 1, 
        expireAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes window
      });
    }

    // 3. Secure Price Calculation
    let totalAmount = 0;
    
    // Using Promise.all to fetch all items securely
    const orderItems = await Promise.all(cartItems.map(async (item) => {
      let realMenuItem;
      try {
        realMenuItem = await MenuItem.findById(item.itemId);
      } catch (err) {
        throw new Error(`Invalid Menu Item ID: ${item.itemId}. (อาจเป็นข้อมูลเก่า กรุณาล้างตะกร้า)`);
      }
      
      if (!realMenuItem) throw new Error(`Menu item ${item.itemId} not found`);

      totalAmount += realMenuItem.price * item.quantity;
      return {
        menuItemId: realMenuItem._id.toString(),
        name: realMenuItem.name,
        price: realMenuItem.price,
        quantity: item.quantity,
        note: item.note || "",
      };
    }));

    const newOrder = new Order({
      tableId: table.tableNumber, // Use tableNumber as the identifier for simplicity
      items: orderItems,
      totalAmount,
      status: "Pending",
    });

    await newOrder.save();

    // Mark table as occupied
    table.status = 'Occupied';
    await table.save();

    return { success: true, orderId: newOrder._id.toString() };
  } catch (error) {
    console.error("Order submission failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสั่งอาหาร" };
  }
}

export async function getTableOrders(tableId: string) {
  await connectToDatabase();
  const orders = await Order.find({ tableId }).sort({ createdAt: -1 }).lean();
  
  return orders.map((o: any) => ({
    id: o._id.toString(),
    tableId: o.tableId,
    items: o.items,
    totalAmount: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt,
  }));
}

export async function cancelOrder(orderId: string) {
  await connectToDatabase();
  const order = await Order.findById(orderId);
  if (order && order.status === 'Pending') {
    order.status = 'Cancelled';
    await order.save();
    return { success: true };
  }
  return { success: false, error: "Cannot cancel this order" };
}
