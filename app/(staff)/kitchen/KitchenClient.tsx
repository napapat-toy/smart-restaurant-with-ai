"use client";

import { useState } from "react";
import { ChefHat, Bell } from "lucide-react";
import { useKitchen } from "./hooks/useKitchen";
import { KitchenOrderCard } from "./components/KitchenOrderCard";
import { SoldOutPanel } from "./components/SoldOutPanel";

export default function KitchenClient() {
  const {
    orders,
    pendingOrders,
    cookingOrders,
    handleUpdateStatus,
    timeAgo
  } = useKitchen();

  const [activeTab, setActiveTab] = useState<"orders" | "soldout">("orders");

  return (
    <div className="kitchen-container">
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

        {/* Tab Selector & Order Info */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Navigation Tabs */}
          <div className="kitchen-tab-bar">
            <button
              onClick={() => setActiveTab("orders")}
              className={`kitchen-tab-btn ${activeTab === "orders" ? "is-active" : ""}`}
            >
              ออเดอร์ทั้งหมด
            </button>
            <button
              onClick={() => setActiveTab("soldout")}
              className={`kitchen-tab-btn ${activeTab === "soldout" ? "is-active" : ""}`}
            >
              ของหมดวันนี้
            </button>
          </div>

          {activeTab === "orders" && (
            <>
              <div className="kitchen-stat-box">
                <p className="text-slate-400 text-sm font-medium">รอดำเนินการ</p>
                <p className="text-3xl font-bold text-amber-500 mt-1">{pendingOrders.length}</p>
              </div>
              <div className="kitchen-stat-box">
                <p className="text-slate-400 text-sm font-medium">กำลังปรุง</p>
                <p className="text-3xl font-bold text-blue-500 mt-1">{cookingOrders.length}</p>
              </div>
            </>
          )}
        </div>
      </header>

      {activeTab === "orders" ? (
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
            <div className="kitchen-empty-placeholder">
              <Bell size={64} className="mb-6 opacity-20" />
              <h2 className="text-2xl font-medium mb-2 text-slate-400">ยังไม่มีออเดอร์ในขณะนี้</h2>
              <p className="text-slate-500">ห้องครัวว่างแล้ว รอรับออเดอร์ใหม่...</p>
            </div>
          )}
        </div>
      ) : (
        <SoldOutPanel />
      )}
    </div>
  );
}
