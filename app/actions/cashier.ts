"use server";

import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Table } from "@/models/Table";

export type TableWithBilling = {
  id: string;
  tableNumber: string;
  status: "Available" | "Occupied";
  token: string;
  unpaidOrders: {
    id: string;
    createdAt: string;
    status: string;
    items: { name: string; quantity: number; price: number; }[];
    totalAmount: number;
  }[];
  totalAmount: number;
};

export async function getTablesWithBilling(): Promise<TableWithBilling[]> {
  await connectToDatabase();
  
  const tables = await Table.find().lean();
  const allUnpaidOrders = await Order.find({ status: { $nin: ['Paid', 'Cancelled'] } }).lean();

  const tablesWithBilling = tables.map((table: any) => {
    // Match order's tableId with the table's tableNumber
    const unpaidOrders = allUnpaidOrders.filter(o => o.tableId === table.tableNumber).map((o: any) => ({
      ...o,
      id: o._id.toString(),
      _id: undefined
    }));
    
    const totalAmount = unpaidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      id: table._id.toString(),
      tableNumber: table.tableNumber,
      status: table.status,
      token: table.token,
      unpaidOrders,
      totalAmount
    };
  });
  
  return tablesWithBilling;
}

export async function processPayment(tableId: string) {
  await connectToDatabase();
  
  const table = await Table.findById(tableId);
  if (!table) return { success: false, error: "Table not found" };

  // Find unpaid orders for this table
  const unpaidOrders = await Order.find({ 
    tableId: table.tableNumber,
    status: { $nin: ['Paid', 'Cancelled'] } 
  });

  for (const order of unpaidOrders) {
    order.status = 'Paid';
    await order.save();
  }

  // Free up the table and rotate the token to invalidate the old QR
  table.status = 'Available';
  table.token = "tok_" + Math.random().toString(36).substring(2, 9);
  await table.save();

  return { success: true, paidCount: unpaidOrders.length };
}

export async function openTableSession(tableId: string) {
  await connectToDatabase();
  const table = await Table.findById(tableId);
  if (!table) return { success: false, error: "Table not found" };

  table.status = 'Occupied';
  await table.save();

  return { success: true };
}

export async function cancelTableSession(tableId: string) {
  await connectToDatabase();
  const table = await Table.findById(tableId);
  if (!table) return { success: false, error: "Table not found" };

  table.status = 'Available';
  table.token = "tok_" + Math.random().toString(36).substring(2, 9);
  await table.save();

  // Also cancel any pending/cooking orders for this table just in case
  await Order.updateMany(
    { tableId: table.tableNumber, status: { $nin: ['Paid', 'Cancelled'] } },
    { status: 'Cancelled' }
  );

  return { success: true };
}

export async function moveTable(oldTableId: string, newTableId: string) {
  await connectToDatabase();
  const oldTable = await Table.findById(oldTableId);
  const newTable = await Table.findById(newTableId);

  if (!oldTable || !newTable) return { success: false, error: "Table not found" };
  if (newTable.status === 'Occupied') return { success: false, error: "โต๊ะปลายทางไม่ว่าง" };

  // Move all active orders to the new table number
  await Order.updateMany(
    { tableId: oldTable.tableNumber, status: { $nin: ['Paid', 'Cancelled'] } },
    { tableId: newTable.tableNumber }
  );

  // Set new table as occupied
  newTable.status = 'Occupied';
  await newTable.save();

  // Reset old table
  oldTable.status = 'Available';
  oldTable.token = "tok_" + Math.random().toString(36).substring(2, 9);
  await oldTable.save();

  return { success: true };
}
