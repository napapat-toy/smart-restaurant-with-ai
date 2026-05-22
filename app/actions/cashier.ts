"use server";

import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Order, ACTIVE_ORDER_QUERY } from "@/models/Order";
import { Table } from "@/models/Table";
import { verifyRole } from "./auth";
import { generateSecureToken } from "@/lib/utils";
import { applyDiscountUsage } from "./discount";
import { learnPairingsFromOrders } from "./recommendations";

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
  await verifyRole(["admin", "cashier"]);
  await connectToDatabase();
  
  const tables = await Table.find().lean();
  const allUnpaidOrders = await Order.find(ACTIVE_ORDER_QUERY).lean();

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
  
  // Sort tables numerically by tableNumber
  tablesWithBilling.sort((a, b) => {
    const numA = parseInt(a.tableNumber, 10);
    const numB = parseInt(b.tableNumber, 10);
    if (isNaN(numA) || isNaN(numB)) {
      return a.tableNumber.localeCompare(b.tableNumber);
    }
    return numA - numB;
  });
  
  return tablesWithBilling;
}

export async function processPayment(tableId: string, discountCode?: string, discountAmount?: number) {
  try {
    await verifyRole(["admin", "cashier"]);
    await connectToDatabase();
  } catch (error: any) {
    console.error("Auth or Connection error in processPayment:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }

  let session: any = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    
    const result = await executePayment(session);
    await session.commitTransaction();
    return result;
  } catch (txError: any) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {
        // ignore abort error
      }
    }
    
    // Check if the error indicates transaction is not supported (replica set warning or sessions not supported)
    const isNoReplicaSet = 
      txError.message.includes("replica set") || 
      txError.message.includes("does not support sessions") ||
      txError.message.includes("Transaction numbers are only allowed") ||
      txError.code === 20;

    if (isNoReplicaSet) {
      console.warn("MongoDB transactions not supported by deployment (no replica set). Falling back to non-transactional execution.");
      // Fallback: run without transaction session
      try {
        return await executePayment(undefined);
      } catch (fallbackError: any) {
        console.error("Error processing payment (fallback):", fallbackError);
        return { success: false, error: fallbackError.message || "An unexpected error occurred." };
      }
    } else {
      console.error("Transaction aborted due to error:", txError);
      return { success: false, error: txError.message || "An unexpected error occurred." };
    }
  } finally {
    if (session) {
      await session.endSession();
    }
  }

  async function executePayment(txSession?: any) {
    const table = txSession 
      ? await Table.findById(tableId).session(txSession)
      : await Table.findById(tableId);

    if (!table) return { success: false, error: "Table not found" };

    // Find unpaid orders for this table
    const unpaidOrders = txSession
      ? await Order.find({ tableId: table.tableNumber, ...ACTIVE_ORDER_QUERY }).session(txSession)
      : await Order.find({ tableId: table.tableNumber, ...ACTIVE_ORDER_QUERY });

    if (discountAmount && discountAmount > 0) {
      const totalBeforeDiscount = unpaidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      if (totalBeforeDiscount > 0) {
        let remainingDiscount = discountAmount;
        for (let i = 0; i < unpaidOrders.length; i++) {
          const order = unpaidOrders[i];
          if (i === unpaidOrders.length - 1) {
            order.totalAmount = Math.max(0, order.totalAmount - remainingDiscount);
          } else {
            const share = Math.min(order.totalAmount, Math.round((order.totalAmount / totalBeforeDiscount) * discountAmount));
            order.totalAmount = order.totalAmount - share;
            remainingDiscount -= share;
          }
        }
      }
    }

    for (const order of unpaidOrders) {
      order.status = 'Paid';
      if (txSession) {
        await order.save({ session: txSession });
      } else {
        await order.save();
      }
    }

    // Apply discount usage count if a valid code was used
    if (discountCode) {
      await applyDiscountUsage(discountCode, txSession ? { session: txSession } : undefined);
    }

    // Free up the table and rotate the token to invalidate the old QR
    table.status = 'Available';
    table.token = "tok_" + generateSecureToken(6);
    
    if (txSession) {
      await table.save({ session: txSession });
    } else {
      await table.save();
    }

    // Fire-and-forget: update recommendation pairings from this new paid data
    learnPairingsFromOrders().catch(() => {});

    return { success: true, paidCount: unpaidOrders.length };
  }
}

export async function openTableSession(tableId: string) {
  try {
    await verifyRole(["admin", "cashier"]);
    await connectToDatabase();
    const table = await Table.findById(tableId);
    if (!table) return { success: false, error: "Table not found" };

    table.status = 'Occupied';
    await table.save();

    return { success: true };
  } catch (error: any) {
    console.error("Error opening table session:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function cancelTableSession(tableId: string) {
  try {
    await verifyRole(["admin", "cashier"]);
    await connectToDatabase();
    const table = await Table.findById(tableId);
    if (!table) return { success: false, error: "Table not found" };

    table.status = 'Available';
    table.token = "tok_" + generateSecureToken(6);
    await table.save();

    // Also cancel any pending/cooking orders for this table just in case
    await Order.updateMany(
      { tableId: table.tableNumber, ...ACTIVE_ORDER_QUERY },
      { status: 'Cancelled' }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error canceling table session:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function moveTable(oldTableId: string, newTableId: string) {
  try {
    await verifyRole(["admin", "cashier"]);
    await connectToDatabase();
    const oldTable = await Table.findById(oldTableId);
    const newTable = await Table.findById(newTableId);

    if (!oldTable || !newTable) return { success: false, error: "Table not found" };
    if (newTable.status === 'Occupied') return { success: false, error: "โต๊ะปลายทางไม่ว่าง" };

    // Move all active orders to the new table number and copy the new table's token to keep them visible
    await Order.updateMany(
      { tableId: oldTable.tableNumber, ...ACTIVE_ORDER_QUERY },
      { tableId: newTable.tableNumber, token: newTable.token }
    );

    // Set new table as occupied
    newTable.status = 'Occupied';
    await newTable.save();

    // Reset old table
    oldTable.status = 'Available';
    oldTable.token = "tok_" + generateSecureToken(6);
    await oldTable.save();

    return { success: true };
  } catch (error: any) {
    console.error("Error moving table:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
