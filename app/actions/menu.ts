"use server";

import connectToDatabase from "@/lib/mongodb";
import { MenuItem } from "@/models/MenuItem";
import { Category } from "@/models/Category";
import { unstable_cache } from "next/cache";

export const getMenuData = unstable_cache(
  async () => {
    await connectToDatabase();
    
    // Fallback if no categories exist in the new model yet
    let categories = await Category.find().sort({ order: 1 }).lean();
    
    const items = await MenuItem.find({ isAvailable: true }).lean();
    const formattedItems = items.map((item: any) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
      options: item.options || []
    }));

    // If categories table is empty (from migration), extract distinct categories from items
    if (categories.length === 0) {
      const uniqueCats = Array.from(new Set(formattedItems.map(i => i.category)));
      categories = uniqueCats.map((name, idx) => ({ _id: name, name, order: idx }));
    } else {
      categories = categories.map((c: any) => ({ ...c, _id: c._id.toString() }));
    }

    return { categories, items: formattedItems };
  },
  ['menu-items'],
  { revalidate: 60 } // Revalidate every 60 seconds (ISR equivalent for Server Actions)
);
