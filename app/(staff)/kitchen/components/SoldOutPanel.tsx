"use client";

import { useEffect, useState } from "react";
import { getMenuAvailability, toggleMenuSoldOut } from "@/app/actions/kitchen";
import { AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";

export function SoldOutPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMenuAvailability();
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load menu items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (itemId: string, currentSoldOut: boolean) => {
    // Optimistic update
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, soldOutToday: !currentSoldOut } : item));
    try {
      await toggleMenuSoldOut(itemId, !currentSoldOut);
    } catch (err) {
      console.error("Failed to toggle sold out:", err);
      // Revert if failed
      loadData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
        <span>กำลังโหลดรายการอาหาร...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/20 border border-rose-800 text-rose-300 p-4 rounded-xl flex items-center gap-3">
        <AlertCircle />
        <span>{error}</span>
      </div>
    );
  }

  // Group by category
  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <div className="space-y-8">
      {categories.map(cat => {
        const catItems = items.filter(item => item.category === cat);
        return (
          <div key={cat} className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-slate-800 pb-3">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catItems.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    item.soldOutToday 
                      ? "bg-rose-950/20 border-rose-900/50 text-rose-300/80" 
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <p className={`font-semibold ${item.soldOutToday ? "line-through opacity-60" : ""}`}>{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.soldOutToday ? "🔴 หมดชั่วคราววันนี้" : "🟢 พร้อมจำหน่าย"}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.id, item.soldOutToday)}
                    className="focus:outline-none transition transform active:scale-95"
                    title={item.soldOutToday ? "เปิดขายเมนูนี้" : "ตั้งค่าเป็นของหมดชั่วคราววันนี้"}
                  >
                    {item.soldOutToday ? (
                      <ToggleRight className="text-rose-500 w-10 h-10" />
                    ) : (
                      <ToggleLeft className="text-slate-600 w-10 h-10 hover:text-slate-500" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
