import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { MenuItem } from "@/models/MenuItem";
import { Table } from "@/models/Table";
import { Order } from "@/models/Order";
import { Settings } from "@/models/Settings";
import { Category } from "@/models/Category";
import { mockMenuItems, mockTables, mockCategories } from "./mockData";
import { encryptText } from "@/lib/crypto";

export async function GET() {
  try {
    await connectToDatabase();

    // Clear existing data
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await Order.deleteMany({});
    await Settings.deleteMany({});
    await Category.deleteMany({});

    // Seed Categories
    await Category.insertMany(mockCategories);

    // Seed Menu Items
    const menuItems = mockMenuItems.map(m => ({
      name: m.name,
      description: m.description,
      price: m.price,
      image: m.image,
      category: m.category,
      isAvailable: m.isAvailable,
      options: m.options || [] // Seed customizable choices & variations
    }));
    await MenuItem.insertMany(menuItems);

    // Seed Tables
    const tables = mockTables.map(t => ({
      tableNumber: t.tableNumber,
      status: t.status,
      token: t.token
    }));
    await Table.insertMany(tables);

    // Seed Settings (PINs)
    // cashier = 1111, kitchen = 2222
    await Settings.create({
      cashierPin: encryptText("1111"),
      kitchenPin: encryptText("2222"),
      lastPinResetDate: new Date()
    });

    return NextResponse.json({ message: "Database seeded successfully! (Cashier PIN: 1111, Kitchen PIN: 2222)" });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
