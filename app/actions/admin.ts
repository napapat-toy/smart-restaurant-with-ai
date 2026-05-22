"use server";

import connectToDatabase from "@/lib/mongodb";
import { Settings } from "@/models/Settings";
import { MenuItem } from "@/models/MenuItem";
import { Table } from "@/models/Table";
import { Category } from "@/models/Category";
import { Order } from "@/models/Order";
import { revalidatePath } from "next/cache";
import { verifyRole } from "./auth";
import { generateSecureToken } from "@/lib/utils";
import { decryptText, encryptText } from "@/lib/crypto";

export async function getAdminData() {
  await verifyRole(["admin"]);
  await connectToDatabase();
  
  const settings = await Settings.findOne().lean();
  const categories = await Category.find().sort({ order: 1 }).lean();
  const menuItems = await MenuItem.find().sort({ category: 1, name: 1 }).lean();
  const tables = await Table.find().lean();
  const formattedTables = tables.map((t: any) => ({ ...t, _id: t._id.toString() }));

  // Sort tables numerically by tableNumber
  formattedTables.sort((a, b) => {
    const numA = parseInt(a.tableNumber, 10);
    const numB = parseInt(b.tableNumber, 10);
    if (isNaN(numA) || isNaN(numB)) {
      return a.tableNumber.localeCompare(b.tableNumber);
    }
    return numA - numB;
  });

  return {
    settings: settings ? {
      ...settings,
      _id: settings._id.toString(),
      cashierPin: decryptText(settings.cashierPin),
      kitchenPin: decryptText(settings.kitchenPin),
    } : null,
    categories: categories.map((c: any) => ({ ...c, _id: c._id.toString() })),
    menuItems: menuItems.map((m: any) => ({ ...m, _id: m._id.toString() })),
    tables: formattedTables
  };
}

export async function generateNewPins() {
  await verifyRole(["admin"]);
  await connectToDatabase();
  const rawCashierPin = Math.floor(1000 + Math.random() * 9000).toString();
  const rawKitchenPin = Math.floor(1000 + Math.random() * 9000).toString();

  const encryptedCashierPin = encryptText(rawCashierPin);
  const encryptedKitchenPin = encryptText(rawKitchenPin);

  const settings = await Settings.findOne();
  if (settings) {
    settings.cashierPin = encryptedCashierPin;
    settings.kitchenPin = encryptedKitchenPin;
    settings.lastPinResetDate = new Date();
    await settings.save();
  } else {
    await Settings.create({
      cashierPin: encryptedCashierPin,
      kitchenPin: encryptedKitchenPin,
      lastPinResetDate: new Date()
    });
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function toggleMenuItemStatus(id: string, isAvailable: boolean) {
  await verifyRole(["admin"]);
  await connectToDatabase();
  await MenuItem.findByIdAndUpdate(id, { isAvailable });
  revalidatePath('/admin');
}

export async function addMenuItem(data: any) {
  await verifyRole(["admin"]);
  await connectToDatabase();
  await MenuItem.create(data);
  revalidatePath('/admin');
}

export async function updateMenuItem(id: string, data: any) {
  await verifyRole(["admin"]);
  await connectToDatabase();
  await MenuItem.findByIdAndUpdate(id, data);
  revalidatePath('/admin');
}

export async function deleteMenuItem(id: string) {
  await verifyRole(["admin"]);
  await connectToDatabase();
  await MenuItem.findByIdAndDelete(id);
  revalidatePath('/admin');
}

export async function generateTableToken(id: string) {
  await verifyRole(["admin"]);
  await connectToDatabase();
  const newToken = "tok_" + generateSecureToken(6);
  await Table.findByIdAndUpdate(id, { token: newToken, status: "Available" });
  revalidatePath('/admin');
}

export async function addTable(tableNumber: string) {
  await verifyRole(["admin"]);
  await connectToDatabase();
  const existing = await Table.findOne({ tableNumber });
  if (existing) return { error: "หมายเลขโต๊ะนี้มีอยู่แล้ว" };

  const token = "tok_" + generateSecureToken(6);
  await Table.create({ tableNumber, token, status: "Available" });
  revalidatePath('/admin');
}

export async function addCategory(name: string) {
  await verifyRole(["admin"]);
  await connectToDatabase();
  const existing = await Category.findOne({ name });
  if (existing) return { error: "หมวดหมู่นี้มีอยู่แล้ว" };
  
  const maxOrderCat = await Category.findOne().sort({ order: -1 });
  const order = maxOrderCat ? maxOrderCat.order + 1 : 0;
  
  await Category.create({ name, order });
  revalidatePath('/admin');
}

export async function deleteCategory(id: string) {
  await verifyRole(["admin"]);
  await connectToDatabase();
  await Category.findByIdAndDelete(id);
  revalidatePath('/admin');
}

export async function reorderCategories(orderedIds: string[]) {
  await verifyRole(["admin"]);
  await connectToDatabase();
  for (let i = 0; i < orderedIds.length; i++) {
    await Category.findByIdAndUpdate(orderedIds[i], { order: i });
  }
  revalidatePath('/admin');
}

export interface SearchOrdersParams {
  tableNumber?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function searchOrders({ tableNumber, status, dateFrom, dateTo, page = 1, limit = 20 }: SearchOrdersParams) {
  await verifyRole(["admin"]);
  await connectToDatabase();

  const query: any = {};
  if (tableNumber) query.tableId = tableNumber;
  if (status && status !== "all") query.status = status;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const totalCount = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    orders: orders.map((o: any) => ({
      id: o._id.toString(),
      tableId: o.tableId,
      status: o.status,
      totalAmount: o.totalAmount,
      items: (o.items || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        note: item.note || "",
        selectedOptions: item.selectedOptions || [],
      })),
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    })),
    totalCount,
    totalPages,
    page,
  };
}
