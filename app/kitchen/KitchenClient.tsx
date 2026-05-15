"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getActiveOrders, updateOrderStatus } from "@/app/actions/kitchen";
import { Order } from "@/data/mockDb";
import { Clock, ChefHat, CheckCircle, Bell } from "lucide-react";

import { usePolling } from "@/app/hooks/usePolling";
import { StatusBadge } from "@/app/components/ui/StatusBadge";

export default function KitchenClient() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    const data = await getActiveOrders();
    setOrders(data);
  }, []);

  usePolling(fetchOrders, 3000);

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    fetchOrders();
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const cookingOrders = orders.filter(o => o.status === 'Cooking');

  // Audio Alert Logic
  const prevPendingCount = useRef(0);
  useEffect(() => {
    if (pendingOrders.length > prevPendingCount.current) {
      // Play beep sound when new order arrives
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // Note A5
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // Slide up to A6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        console.warn("Audio play failed, requires user interaction first");
      }
    }
    prevPendingCount.current = pendingOrders.length;
  }, [pendingOrders.length]);

  // Simple relative time formatter
  const timeAgo = (date: Date) => {
    const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return "เมื่อกี้";
    return `${minutes} นาทีที่แล้ว`;
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <div className={`rounded-2xl p-5 border-l-4 shadow-lg flex flex-col h-full transition-all
      ${order.status === 'Pending' ? 'bg-slate-800 border-amber-500 text-slate-200' : 'bg-slate-800 border-blue-500 text-slate-200'}
    `}>
      <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-3">
        <div>
          <h3 className="text-2xl font-bold text-white">โต๊ะ {order.tableId}</h3>
          <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
            <Clock size={14} /> {timeAgo(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} theme="dark" />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto mb-4 pr-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="bg-slate-700/50 p-3 rounded-xl flex gap-3">
            <div className="w-8 h-8 shrink-0 bg-slate-600 text-white rounded-lg flex items-center justify-center font-bold">
              {item.quantity}x
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-lg leading-tight">{item.name}</p>
              {item.note && (
                <p className="text-amber-400 text-sm mt-1 bg-amber-400/10 inline-block px-2 py-0.5 rounded-md font-medium">
                  * {item.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto shrink-0 pt-3 border-t border-slate-700">
        {order.status === 'Pending' ? (
          <button
            onClick={() => handleUpdateStatus(order.id, 'Cooking')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/50"
          >
            <ChefHat size={20} />
            เริ่มปรุงอาหาร
          </button>
        ) : (
          <button
            onClick={() => handleUpdateStatus(order.id, 'Served')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/50"
          >
            <CheckCircle size={20} />
            เสร็จสิ้น / พร้อมเสิร์ฟ
          </button>
        )}
      </div>
    </div>
  );

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
        {pendingOrders.map(order => <OrderCard key={order.id} order={order} />)}
        {cookingOrders.map(order => <OrderCard key={order.id} order={order} />)}

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
