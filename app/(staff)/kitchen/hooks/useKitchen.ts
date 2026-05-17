"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getActiveOrders, updateOrderStatus } from "@/app/actions/kitchen";
import { usePolling } from "@/app/hooks/usePolling";

export function useKitchen() {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = useCallback(async () => {
    const data = await getActiveOrders();
    setOrders(data);
  }, []);

  usePolling(fetchOrders, 3000);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status);
    fetchOrders();
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const cookingOrders = orders.filter(o => o.status === 'Cooking');

  // Audio Alert Logic
  const prevPendingCount = useRef(0);
  useEffect(() => {
    if (pendingOrders.length > prevPendingCount.current) {
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
      } catch {
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

  return {
    orders,
    pendingOrders,
    cookingOrders,
    handleUpdateStatus,
    timeAgo
  };
}
