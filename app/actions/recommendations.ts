"use server";

import connectToDatabase from "@/lib/mongodb";
import { MenuItem } from "@/models/MenuItem";
import { Order } from "@/models/Order";
import { Table } from "@/models/Table";

// Memory cache for storing recommendation results
const recommendationCache = new Map<string, { items: any[]; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache TTL

// Learned pairings from real order data (updated via learnPairingsFromOrders)
// Key: item name → Value: array of co-ordered item names sorted by frequency
const learnedPairings = new Map<string, string[]>();
let learnedPairingsLastUpdated: number | null = null;

// แผนผังการแนะนำอาหารแบบรายเมนู (Direct Item Pairing)
// คีย์คือชื่อเมนูที่อยู่ในตะกร้า, ค่าคืออาเรย์ของชื่อเมนูที่ควรแนะนำคู่กัน
const ITEM_PAIRINGS: Record<string, string[]> = {
  "ข้าวกะเพราหมูสับไข่ดาวกรอบ": [
    "แกงจืดเต้าหู้หมูสับสาหร่าย",
    "ชาไทยเย็นสูตรนมสดเข้มข้น",
    "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ"
  ],
  "ข้าวกะเพราหมูกรอบไข่ดาว": [
    "แกงจืดเต้าหู้หมูสับสาหร่าย",
    "น้ำเก๊กฮวยต้มใบเตยเย็นชื่นใจ",
    "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย"
  ],
  "ข้าวผัดคะน้าหมูกรอบ": [
    "ต้มยำกุ้งแม่น้ำมะพร้าวอ่อนน้ำข้น",
    "น้ำเก๊กฮวยต้มใบเตยเย็นชื่นใจ",
    "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ"
  ],
  "ข้าวหมูทอดกระเทียมพริกไทย": [
    "ต้มยำโป๊ะแตกทะเลระเบิด",
    "โอเลี้ยงโบราณราดยกล้อ",
    "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย"
  ],
  "ข้าวผัดพริกแกงหมูชิ้นหน่อไม้ดอง": [
    "แกงจืดเต้าหู้หมูสับสาหร่าย",
    "ชาไทยเย็นสูตรนมสดเข้มข้น",
    "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย"
  ],
  "ข้าวไข่ข้นซอสต้มยำกุ้งสด": [
    "แกงจืดเต้าหู้หมูสับสาหร่าย",
    "น้ำเก๊กฮวยต้มใบเตยเย็นชื่นใจ",
    "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ"
  ],
  "ข้าวผัดปูสูตรเมืองทอง": [
    "ต้มยำกุ้งแม่น้ำมะพร้าวอ่อนน้ำข้น",
    "ชาไทยเย็นสูตรนมสดเข้มข้น",
    "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย"
  ],
  "ข้าวไข่เจียวหมูสับฟูกรอบ": [
    "ต้มยำกุ้งแม่น้ำมะพร้าวอ่อนน้ำข้น",
    "ต้มยำโป๊ะแตกทะเลระเบิด",
    "น้ำเก๊กฮวยต้มใบเตยเย็นชื่นใจ"
  ],
  "ผัดซีอิ๊วเส้นใหญ่หมูนุ่ม": [
    "โอเลี้ยงโบราณราดยกล้อ",
    "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย",
    "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ"
  ],
  "ผัดไทยกุ้งสดเส้นจันท์": [
    "ชาไทยเย็นสูตรนมสดเข้มข้น",
    "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ",
    "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย"
  ],
  "ราดหน้าเส้นใหญ่ยอดผักหมูหมัก": [
    "โอเลี้ยงโบราณราดยกล้อ",
    "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ",
    "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย"
  ],
  "มาม่าผัดขี้เมาทะเลใต้เดือด": [
    "แกงจืดเต้าหู้หมูสับสาหร่าย",
    "น้ำเก๊กฮวยต้มใบเตยเย็นชื่นใจ",
    "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย"
  ],
  "ต้มยำกุ้งแม่น้ำมะพร้าวอ่อนน้ำข้น": [
    "ข้าวไข่เจียวหมูสับฟูกรอบ",
    "ชาไทยเย็นสูตรนมสดเข้มข้น",
    "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ"
  ],
  "แกงจืดเต้าหู้หมูสับสาหร่าย": [
    "ข้าวกะเพราหมูสับไข่ดาวกรอบ",
    "ข้าวหมูทอดกระเทียมพริกไทย",
    "โอเลี้ยงโบราณราดยกล้อ"
  ],
  "ผัดผักบุ้งไฟแดงเต้าเจี้ยวพริกสด": [
    "หมูกรอบทอดซอสน้ำปลาหอม",
    "น้ำเก๊กฮวยต้มใบเตยเย็นชื่นใจ",
    "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ"
  ],
  "หมูกรอบทอดซอสน้ำปลาหอม": [
    "ต้มยำโป๊ะแตกทะเลระเบิด",
    "ชาไทยเย็นสูตรนมสดเข้มข้น",
    "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย"
  ],
  "ต้มยำโป๊ะแตกทะเลระเบิด": [
    "ข้าวไข่เจียวหมูสับฟูกรอบ",
    "น้ำเก๊กฮวยต้มใบเตยเย็นชื่นใจ",
    "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ"
  ],
  "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ": [
    "ชาไทยเย็นสูตรนมสดเข้มข้น",
    "โอเลี้ยงโบราณราดยกล้อ"
  ],
  "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย": [
    "ชาไทยเย็นสูตรนมสดเข้มข้น",
    "โอเลี้ยงโบราณราดยกล้อ"
  ],
  "ชาไทยเย็นสูตรนมสดเข้มข้น": [
    "ข้าวกะเพราหมูสับไข่ดาวกรอบ",
    "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ",
    "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย"
  ],
  "โอเลี้ยงโบราณราดยกล้อ": [
    "ข้าวหมูทอดกระเทียมพริกไทย",
    "ผัดซีอิ๊วเส้นใหญ่หมูนุ่ม",
    "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย"
  ],
  "น้ำเก๊กฮวยต้มใบเตยเย็นชื่นใจ": [
    "มาม่าผัดขี้เมาทะเลใต้เดือด",
    "ข้าวกะเพราหมูกรอบไข่ดาว",
    "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ"
  ]
};

// แผนผังการแนะนำอาหารตามหมวดหมู่ (Category-Based Pairing)
const CATEGORY_PAIRINGS: Record<string, string[]> = {
  "เมนูราดข้าว": ["เครื่องดื่ม", "ของทานเล่น", "เมนูกับข้าว"],
  "เมนูเส้น": ["เครื่องดื่ม", "ของทานเล่น", "เมนูกับข้าว"],
  "เมนูกับข้าว": ["เมนูราดข้าว", "เครื่องดื่ม", "ของทานเล่น"],
  "ของทานเล่น": ["เครื่องดื่ม", "เมนูราดข้าว", "เมนูเส้น"],
  "เครื่องดื่ม": ["ของทานเล่น", "เมนูราดข้าว", "เมนูเส้น"]
};

export async function getAIRecommendations(cartItems: { id: string; name: string; category: string }[]) {
  // Generate cache key from sorted cart item IDs
  const sortedIds = [...cartItems].map(item => item.id).sort().join(",");
  const cacheKey = sortedIds || "empty_cart";

  // Check cache hit
  const cachedEntry = recommendationCache.get(cacheKey);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
    return cachedEntry.items;
  }

  try {
    await connectToDatabase();
    
    // Fetch all available menu items
    const allItems = await MenuItem.find({ isAvailable: true }).lean();
    if (allItems.length === 0) return [];
    
    const formattedAllItems = allItems.map((item: any) => ({
      id: item._id.toString(),
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      image: item.image,
      options: item.options || []
    }));

    // Filter out items that are already in the cart
    const cartItemIds = new Set(cartItems.map(i => i.id));
    const cartItemNames = new Set(cartItems.map(i => i.name));

    // Candidate items (available items not in the cart)
    const candidateItems = formattedAllItems.filter(item => !cartItemIds.has(item.id));
    if (candidateItems.length === 0) {
      return [];
    }

    // 1. Collect Direct Pairings for items in the cart
    const directPairedNames: string[] = [];
    cartItems.forEach(cartItem => {
      const pairings = ITEM_PAIRINGS[cartItem.name];
      if (pairings) {
        pairings.forEach(name => {
          if (!cartItemNames.has(name) && !directPairedNames.includes(name)) {
            directPairedNames.push(name);
          }
        });
      }
    });

    // Match candidate items that have exact name match in direct pairings
    const directMatches = candidateItems.filter(item => directPairedNames.includes(item.name));

    // 1b. Collect Learned Pairings (P0 - from real order data, highest priority)
    const learnedPairedNames: string[] = [];
    cartItems.forEach(cartItem => {
      const learned = learnedPairings.get(cartItem.name);
      if (learned) {
        learned.forEach(name => {
          if (!cartItemNames.has(name) && !learnedPairedNames.includes(name)) {
            learnedPairedNames.push(name);
          }
        });
      }
    });
    const learnedMatches = candidateItems.filter(item => learnedPairedNames.includes(item.name));

    // 2. Collect Category Pairings for items in the cart
    const targetCategories: string[] = [];
    cartItems.forEach(cartItem => {
      const pairings = CATEGORY_PAIRINGS[cartItem.category];
      if (pairings) {
        pairings.forEach(cat => {
          if (!targetCategories.includes(cat)) {
            targetCategories.push(cat);
          }
        });
      }
    });

    // Match candidate items in the target categories (excluding already matched items)
    const highPriorityIds = new Set([...learnedMatches, ...directMatches].map(r => r.id));
    const categoryMatches = candidateItems.filter(item =>
      !highPriorityIds.has(item.id) && targetCategories.includes(item.category)
    );

    // 3. Assemble pool with priorities:
    // P0: Learned pairings from real order data
    // P1: Direct hardcoded pairings
    // P2: Category-based pairings
    // P3: Remaining candidates (fallback)
    const poolIds = new Set([...learnedMatches, ...directMatches, ...categoryMatches].map(r => r.id));
    const otherCandidates = candidateItems.filter(item => !poolIds.has(item.id));

    // Shuffle within each tier but respect tier priority
    const finalPool = [
      ...getRandomFallback(learnedMatches, learnedMatches.length),
      ...getRandomFallback(directMatches.filter(m => !new Set(learnedMatches.map(l => l.id)).has(m.id)), directMatches.length),
      ...getRandomFallback(categoryMatches, categoryMatches.length),
      ...getRandomFallback(otherCandidates, otherCandidates.length)
    ];

    const finalRecommendations = finalPool.slice(0, 3);

    // Cache the result
    recommendationCache.set(cacheKey, {
      items: finalRecommendations,
      timestamp: Date.now()
    });

    return finalRecommendations;
  } catch (error) {
    console.error("Local rules recommendation failed:", error);
    try {
      const allItems = await MenuItem.find({ isAvailable: true }).lean();
      const formattedAllItems = allItems.map((item: any) => ({
        id: item._id.toString(),
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category,
        image: item.image,
        options: item.options || []
      }));
      const cartItemIds = new Set(cartItems.map(i => i.id));
      const candidates = formattedAllItems.filter(item => !cartItemIds.has(item.id));
      const fallbackItems = getRandomFallback(candidates.length > 0 ? candidates : formattedAllItems, 3);
      
      recommendationCache.set(cacheKey, {
        items: fallbackItems,
        timestamp: Date.now()
      });

      return fallbackItems;
    } catch {
      return [];
    }
  }
}

function getRandomFallback(candidates: any[], count: number): any[] {
  const shuffled = [...candidates].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// --- Smart Pairing Learning from Real Order Data ---

export async function learnPairingsFromOrders(): Promise<{ pairsLearned: number; updatedAt: string }> {
  await connectToDatabase();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const paidOrders = await Order.find({
    status: "Paid",
    createdAt: { $gte: thirtyDaysAgo },
  }).lean();

  // Build co-occurrence count map: pairKey ("A|||B") -> count
  const coOccurrence = new Map<string, number>();

  for (const order of paidOrders) {
    const itemNames: string[] = (order.items || []).map((i: any) => i.name).filter(Boolean);
    // Count every unique pair in this order
    for (let i = 0; i < itemNames.length; i++) {
      for (let j = i + 1; j < itemNames.length; j++) {
        const key = [itemNames[i], itemNames[j]].sort().join("|||");
        coOccurrence.set(key, (coOccurrence.get(key) || 0) + 1);
      }
    }
  }

  // Build per-item top partners sorted by frequency
  const itemPartners = new Map<string, { name: string; count: number }[]>();
  for (const [key, count] of coOccurrence.entries()) {
    const [a, b] = key.split("|||");
    if (!itemPartners.has(a)) itemPartners.set(a, []);
    if (!itemPartners.has(b)) itemPartners.set(b, []);
    itemPartners.get(a)!.push({ name: b, count });
    itemPartners.get(b)!.push({ name: a, count });
  }

  // Populate learnedPairings with top-3 partners per item
  learnedPairings.clear();
  for (const [item, partners] of itemPartners.entries()) {
    const top3 = partners.sort((a, b) => b.count - a.count).slice(0, 3).map(p => p.name);
    learnedPairings.set(item, top3);
  }

  learnedPairingsLastUpdated = Date.now();

  // Clear old recommendation cache so next requests use fresh learned pairings
  recommendationCache.clear();

  return {
    pairsLearned: learnedPairings.size,
    updatedAt: new Date(learnedPairingsLastUpdated).toISOString(),
  };
}

export async function getLearnedPairingsStatus() {
  return {
    pairsLearned: learnedPairings.size,
    updatedAt: learnedPairingsLastUpdated ? new Date(learnedPairingsLastUpdated).toISOString() : null,
  };
}

export async function getCheckoutRecommendations(tableId: string) {
  try {
    await connectToDatabase();
    const table = await Table.findById(tableId).lean();
    if (!table) return [];

    const unpaidOrders = await Order.find({
      tableId: table.tableNumber,
      status: { $nin: ["Paid", "Cancelled"] }
    }).lean();

    if (unpaidOrders.length === 0) return [];

    // Extract all unique item names or IDs from the unpaid orders
    const itemNames = new Set<string>();
    for (const order of unpaidOrders) {
      for (const item of order.items || []) {
        itemNames.add(item.name);
      }
    }

    if (itemNames.size === 0) return [];

    const menuItems = await MenuItem.find({ name: { $in: Array.from(itemNames) } }).lean();
    const menuItemByName = new Map<string, any>();
    for (const m of menuItems) {
      menuItemByName.set(m.name, m);
    }

    const itemsForRecommendation: { id: string; name: string; category: string }[] = [];
    for (const name of itemNames) {
      const dbItem = menuItemByName.get(name);
      if (dbItem) {
        itemsForRecommendation.push({
          id: dbItem._id.toString(),
          name: dbItem.name,
          category: dbItem.category
        });
      }
    }

    // Call getAIRecommendations
    return await getAIRecommendations(itemsForRecommendation);
  } catch (error) {
    console.error("Error getting checkout recommendations:", error);
    return [];
  }
}
