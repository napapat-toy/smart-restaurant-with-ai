"use client";

import { Bell, ChefHat } from "lucide-react";
import { useKitchen } from "./hooks/useKitchen";
import { KitchenOrderCard } from "./components/KitchenOrderCard";

export default function KitchenClient() {
  const {
    orders,
    pendingOrders,
    cookingOrders,
    handleUpdateStatus,
    timeAgo
  } = useKitchen();

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-xl">
              <ChefHat className="text-blue-500" size={32} />
            </div>
            Kitchen Display
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <p className="text-slate-400 text-sm">อัปเดตอัตโนมัติ (Live Simulation)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl text-center flex-1 md:flex-none shadow-inner">
            <p className="text-slate-400 text-sm font-medium">รอดำเนินการ</p>
            <p className="text-3xl font-bold text-amber-500 mt-1">{pendingOrders.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl text-center flex-1 md:flex-none shadow-inner">
            <p className="text-slate-400 text-sm font-medium">กำลังปรุง</p>
            <p className="text-3xl font-bold text-blue-500 mt-1">{cookingOrders.length}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
        {/* Render Pending first, then Cooking */}
        {pendingOrders.map(order => (
          <KitchenOrderCard 
            key={order.id} 
            order={order} 
            timeAgo={timeAgo} 
            handleUpdateStatus={handleUpdateStatus} 
          />
        ))}
        {cookingOrders.map(order => (
          <KitchenOrderCard 
            key={order.id} 
            order={order} 
            timeAgo={timeAgo} 
            handleUpdateStatus={handleUpdateStatus} 
          />
        ))}

        {orders.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
            <Bell size={64} className="mb-6 opacity-20" />
            <h2 className="text-2xl font-medium mb-2 text-slate-400">ยังไม่มีออเดอร์ในขณะนี้</h2>
            <p className="text-slate-500">ห้องครัวว่างแล้ว รอรับออเดอร์ใหม่...</p>
          </div>
        )}
      </div>
    </div>
  );
}
