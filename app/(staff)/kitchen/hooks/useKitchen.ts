"use client";

import { useState, useCallback, useEffect, useRef, useOptimistic, useTransition } from "react";
import { getActiveOrders, updateOrderStatus } from "@/app/actions/kitchen";
import { usePolling } from "@/app/hooks/usePolling";

import { formatTimeAgo } from "@/lib/utils";

export function useKitchen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  const fetchOrders = useCallback(async () => {
    const data = await getActiveOrders();
    setOrders(data);
  }, []);

  const [useSse, setUseSse] = useState(true);

  useEffect(() => {
    if (!useSse) return;

    const eventSource = new EventSource("/api/sse/kitchen");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setOrders(data);
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("SSE connection error, falling back to polling:", err);
      setUseSse(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [useSse]);

  // Fallback to polling if SSE fails or is not supported/active
  usePolling(fetchOrders, 3000, !useSse);

  // Define optimistic state for orders to give chefs instant visual feedback
  const [optimisticOrders, setOptimisticOrders] = useOptimistic(
    orders,
    (state, update: { id: string; status: string }) => {
      // If the status is served or cancelled, it will disappear from active kitchen display
      if (update.status === "Served" || update.status === "Cancelled") {
        return state.filter((o) => o.id !== update.id);
      }
      // Otherwise, update the status in-place for columns rearrangement
      return state.map((o) => (o.id === update.id ? { ...o, status: update.status } : o));
    }
  );

  const handleUpdateStatus = (orderId: string, status: string) => {
    startTransition(async () => {
      // Apply optimistic update immediately
      setOptimisticOrders({ id: orderId, status });
      try {
        await updateOrderStatus(orderId, status);
        fetchOrders();
      } catch (error) {
        console.error("Failed to update order status:", error);
      }
    });
  };

  const pendingOrders = optimisticOrders.filter((o) => o.status === "Pending");
  const cookingOrders = optimisticOrders.filter((o) => o.status === "Cooking");

  // Audio Alert Logic (uses real server orders to prevent double play or false alarms)
  const prevPendingCount = useRef(0);
  const realPendingCount = orders.filter((o) => o.status === "Pending").length;

  useEffect(() => {
    if (realPendingCount > prevPendingCount.current) {
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
    prevPendingCount.current = realPendingCount;
  }, [realPendingCount]);

  return {
    orders: optimisticOrders,
    pendingOrders,
    cookingOrders,
    handleUpdateStatus,
    timeAgo: formatTimeAgo,
    isTransitionPending: isPending
  };
}
