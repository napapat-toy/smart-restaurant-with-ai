"use server";

import { mockOrders, mockTables, Order, Table } from "@/data/mockDb";

export type TableWithBilling = Table & {
  unpaidOrders: Order[];
  totalAmount: number;
};

export async function getTablesWithBilling(): Promise<TableWithBilling[]> {
  return mockTables.map(table => {
    // Orders that belong to this table and are not Paid or Cancelled
    const unpaidOrders = mockOrders.filter(
      o => (o.tableId === table.id || o.tableId === table.tableNumber) && 
      !['Paid', 'Cancelled'].includes(o.status)
    );
    
    const totalAmount = unpaidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // If a table was marked occupied but has no orders (maybe just started ordering but didn't submit)
    // we just use the real mockTables status, but typically if they have unpaid orders, they are Occupied.
    if (unpaidOrders.length > 0 && table.status !== 'Occupied') {
      table.status = 'Occupied'; // Auto-correct status if there are unpaid orders
    } else if (unpaidOrders.length === 0 && table.status === 'Occupied') {
      // If they somehow have no unpaid orders but are occupied, we might leave them Occupied
      // because they might be looking at the menu.
    }

    return {
      ...table,
      unpaidOrders,
      totalAmount
    };
  });
}

export async function processPayment(tableId: string) {
  // Mark all unpaid orders for this table as 'Paid'
  const unpaidOrders = mockOrders.filter(
    o => (o.tableId === tableId || o.tableId === mockTables.find(t => t.id === tableId)?.tableNumber) && 
    !['Paid', 'Cancelled'].includes(o.status)
  );

  unpaidOrders.forEach(order => {
    order.status = 'Paid';
  });

  // Free up the table
  const table = mockTables.find(t => t.id === tableId || t.tableNumber === tableId);
  if (table) {
    table.status = 'Available';
  }

  return { success: true, paidCount: unpaidOrders.length };
}
