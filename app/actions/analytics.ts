"use server";

import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { MenuItem } from "@/models/MenuItem";
import { verifyRole } from "./auth";

export interface MonthlyData {
  month: string;
  revenue: number;
  ordersCount: number;
}

export interface ItemSales {
  name: string;
  category: string;
  quantity: number;
  revenue: number;
}

export interface CategorySales {
  name: string;
  revenue: number;
  ordersCount: number;
}

export interface TableSales {
  tableNumber: string;
  revenue: number;
  ordersCount: number;
}

export interface AnnualAnalyticsResult {
  year: number;
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  cancelledOrdersCount: number;
  averageOrderValue: number;
  monthlyBreakdown: MonthlyData[];
  topItems: ItemSales[];
  categoriesBreakdown: CategorySales[];
  tablesBreakdown: TableSales[];
}

const MONTHS_TH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

export async function getAnnualAnalytics(year: number): Promise<AnnualAnalyticsResult> {
  await verifyRole(["admin"]);
  await connectToDatabase();

  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  // Query all orders within the requested year
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).lean();

  let totalRevenue = 0;
  let paidOrdersCount = 0;
  let cancelledOrdersCount = 0;

  // Initialize monthly buckets
  const monthlyData: MonthlyData[] = MONTHS_TH.map((month) => ({
    month,
    revenue: 0,
    ordersCount: 0
  }));

  // Hash maps for item, category, and table sales aggregations
  const itemMap = new Map<string, { quantity: number; revenue: number; category: string }>();
  const categoryMap = new Map<string, { revenue: number; ordersCount: number }>();
  const tableMap = new Map<string, { revenue: number; ordersCount: number }>();

  // Process all orders
  for (const order of orders) {
    const createdDate = new Date(order.createdAt);
    const monthIndex = createdDate.getMonth(); // 0 - 11

    if (order.status === "Cancelled") {
      cancelledOrdersCount++;
      continue;
    }

    // Include Paid, Served, Cooking, Pending in sales calculations (excluding only Cancelled)
    // For pure traditional accounts, only Paid orders can be considered revenue,
    // but in a live restaurant dashboard, we summarize all completed/active bills.
    const isPaid = order.status === "Paid";
    if (isPaid) {
      paidOrdersCount++;
    }

    const orderAmount = order.totalAmount || 0;
    totalRevenue += orderAmount;

    // Track monthly statistics
    monthlyData[monthIndex].revenue += orderAmount;
    monthlyData[monthIndex].ordersCount += 1;

    // Track table statistics
    const tableId = order.tableId || "Unknown";
    const currentTable = tableMap.get(tableId) || { revenue: 0, ordersCount: 0 };
    currentTable.revenue += orderAmount;
    currentTable.ordersCount += 1;
    tableMap.set(tableId, currentTable);

    // Track items and categories statistics
    for (const item of order.items || []) {
      const itemQty = item.quantity || 0;
      const itemCost = (item.price || 0) * itemQty;
      
      // Calculate options pricing extra delta
      let optionsDelta = 0;
      for (const opt of item.selectedOptions || []) {
        optionsDelta += (opt.priceDelta || 0) * itemQty;
      }
      const itemTotalCost = itemCost + optionsDelta;

      // Aggregating by Item Name
      const itemName = item.name || "Unknown Item";
      const currentItem = itemMap.get(itemName) || { quantity: 0, revenue: 0, category: "ทั่วไป" };
      currentItem.quantity += itemQty;
      currentItem.revenue += itemTotalCost;
      itemMap.set(itemName, currentItem);
    }
  }

  // Map aggregated structures back to arrays
  const topItems: ItemSales[] = Array.from(itemMap.entries()).map(([name, val]) => ({
    name,
    category: val.category,
    quantity: val.quantity,
    revenue: val.revenue
  })).sort((a, b) => b.revenue - a.revenue); // Sort by highest revenue

  const tablesBreakdown: TableSales[] = Array.from(tableMap.entries()).map(([tableNumber, val]) => ({
    tableNumber,
    revenue: val.revenue,
    ordersCount: val.ordersCount
  })).sort((a, b) => parseInt(a.tableNumber) - parseInt(b.tableNumber) || a.tableNumber.localeCompare(b.tableNumber));

  // Determine categories dynamically from MenuItems if possible, to group item revenues
  const menuItems = await MenuItem.find({}).lean();
  const itemToCategoryMap = new Map<string, string>();
  for (const menu of menuItems) {
    itemToCategoryMap.set(menu.name, menu.category);
  }

  // Re-assign categories on top items & group by category
  for (const item of topItems) {
    const dbCategory = itemToCategoryMap.get(item.name);
    if (dbCategory) {
      item.category = dbCategory;
    }
    
    const currentCat = categoryMap.get(item.category) || { revenue: 0, ordersCount: 0 };
    currentCat.revenue += item.revenue;
    currentCat.ordersCount += item.quantity;
    categoryMap.set(item.category, currentCat);
  }

  const categoriesBreakdown: CategorySales[] = Array.from(categoryMap.entries()).map(([name, val]) => ({
    name,
    revenue: val.revenue,
    ordersCount: val.ordersCount
  })).sort((a, b) => b.revenue - a.revenue);

  const activeOrdersCount = orders.length - cancelledOrdersCount;
  const averageOrderValue = activeOrdersCount > 0 ? Math.round(totalRevenue / activeOrdersCount) : 0;

  return {
    year,
    totalRevenue,
    totalOrders: orders.length,
    paidOrdersCount,
    cancelledOrdersCount,
    averageOrderValue,
    monthlyBreakdown: monthlyData,
    topItems,
    categoriesBreakdown,
    tablesBreakdown
  };
}
