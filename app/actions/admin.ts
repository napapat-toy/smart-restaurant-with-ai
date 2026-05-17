"use server";

import connectToDatabase from "@/lib/mongodb";
import { Settings } from "@/models/Settings";
import { MenuItem } from "@/models/MenuItem";
import { Table } from "@/models/Table";
import { Category } from "@/models/Category";
import { revalidatePath } from "next/cache";
import { verifyRole } from "./auth";
import { generateSecureToken } from "@/lib/utils";

export async function getAdminData() {
  await verifyRole(["admin"]);
  await connectToDatabase();
  
  const settings = await Settings.findOne().lean();
  const categories = await Category.find().sort({ order: 1 }).lean();
  const menuItems = await MenuItem.find().sort({ category: 1, name: 1 }).lean();
  const tables = await Table.find().sort({ tableNumber: 1 }).lean();

  return {
    settings: settings ? { ...settings, _id: settings._id.toString() } : null,
    categories: categories.map((c: any) => ({ ...c, _id: c._id.toString() })),
    menuItems: menuItems.map((m: any) => ({ ...m, _id: m._id.toString() })),
    tables: tables.map((t: any) => ({ ...t, _id: t._id.toString() }))
  };
}

export async function generateNewPins() {
  await verifyRole(["admin"]);
  await connectToDatabase();
  const cashierPin = Math.floor(1000 + Math.random() * 9000).toString();
  const kitchenPin = Math.floor(1000 + Math.random() * 9000).toString();

  const settings = await Settings.findOne();
  if (settings) {
    settings.cashierPin = cashierPin;
    settings.kitchenPin = kitchenPin;
    settings.lastPinResetDate = new Date();
    await settings.save();
  } else {
    await Settings.create({ cashierPin, kitchenPin, lastPinResetDate: new Date() });
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
