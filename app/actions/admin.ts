"use server";

import connectToDatabase from "@/lib/mongodb";
import { Settings } from "@/models/Settings";
import { MenuItem } from "@/models/MenuItem";
import { Table } from "@/models/Table";
import { revalidatePath } from "next/cache";

export async function getAdminData() {
  await connectToDatabase();
  
  const settings = await Settings.findOne().lean();
  const menuItems = await MenuItem.find().sort({ category: 1, name: 1 }).lean();
  const tables = await Table.find().sort({ tableNumber: 1 }).lean();

  return {
    settings: settings ? { ...settings, _id: settings._id.toString() } : null,
    menuItems: menuItems.map((m: any) => ({ ...m, _id: m._id.toString() })),
    tables: tables.map((t: any) => ({ ...t, _id: t._id.toString() }))
  };
}

export async function generateNewPins() {
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
  await connectToDatabase();
  await MenuItem.findByIdAndUpdate(id, { isAvailable });
  revalidatePath('/admin');
}

export async function addMenuItem(data: any) {
  await connectToDatabase();
  await MenuItem.create(data);
  revalidatePath('/admin');
}

export async function updateMenuItem(id: string, data: any) {
  await connectToDatabase();
  await MenuItem.findByIdAndUpdate(id, data);
  revalidatePath('/admin');
}

export async function deleteMenuItem(id: string) {
  await connectToDatabase();
  await MenuItem.findByIdAndDelete(id);
  revalidatePath('/admin');
}

export async function generateTableToken(id: string) {
  await connectToDatabase();
  const newToken = "tok_" + Math.random().toString(36).substring(2, 9);
  await Table.findByIdAndUpdate(id, { token: newToken, status: "Available" });
  revalidatePath('/admin');
}

export async function addTable(tableNumber: string) {
  await connectToDatabase();
  const existing = await Table.findOne({ tableNumber });
  if (existing) return { error: "หมายเลขโต๊ะนี้มีอยู่แล้ว" };

  const token = "tok_" + Math.random().toString(36).substring(2, 9);
  await Table.create({ tableNumber, token, status: "Available" });
  revalidatePath('/admin');
}
