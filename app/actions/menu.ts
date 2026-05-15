"use server";

import connectToDatabase from "@/lib/mongodb";
import { MenuItem } from "@/models/MenuItem";
import { unstable_cache } from "next/cache";

export const getMenuItems = unstable_cache(
  async () => {
    await connectToDatabase();
    const items = await MenuItem.find({ isAvailable: true }).lean();
    return items.map((item: any) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined
    }));
  },
  ['menu-items'],
  { revalidate: 60 } // Revalidate every 60 seconds (ISR equivalent for Server Actions)
);
