"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { submitOrder, getTableOrders, cancelOrder, verifyTableSession } from "@/app/actions/order";
import { getAIRecommendations } from "@/app/actions/recommendations";
import { useCart } from "@/app/hooks/useCart";
import { usePolling } from "@/app/hooks/usePolling";
import type { CartItemOption } from "@/app/hooks/useCart";

interface UseMenuProps {
  tableNumber: string;
  token: string;
  initialMenuItems: any[];
  initialCategories?: any[];
}

export function useMenu({ tableNumber, token, initialMenuItems, initialCategories = [] }: UseMenuProps) {
  const { 
    cart, 
    itemNotes, 
    addToCart, 
    removeFromCart, 
    removeAllOfItemFromCart,
    updateNote, 
    clearCart, 
    cartTotal, 
    cartItemCount 
  } = useCart(tableNumber, token);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  
  // Options Modal State
  const [optionsModalItem, setOptionsModalItem] = useState<any | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  
  // AI Recommendations State
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);

  // Generate a key of unique item IDs in the cart to avoid triggering API calls on quantity or note edits
  const uniqueCartItemsKey = cart
    .map(c => c.item.id || c.item._id)
    .sort()
    .join(",");

  // Load AI Recommendations when cart changes or cart drawer is opened
  useEffect(() => {
    if (!isModalOpen || cart.length === 0) {
      return;
    }
    
    let isMounted = true;
    const loadRecommendations = async () => {
      setIsLoadingRecs(true);
      try {
        const cartItemsData = cart.map(c => ({
          id: c.item.id || c.item._id,
          name: c.item.name,
          category: c.item.category
        }));
        const recs = await getAIRecommendations(cartItemsData);
        if (isMounted) {
          setRecommendations(recs);
        }
      } catch (err) {
        console.error("Failed to load recommendations", err);
      } finally {
        if (isMounted) {
          setIsLoadingRecs(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [isModalOpen, uniqueCartItemsKey]);

  const [servedNotification, setServedNotification] = useState<string | null>(null);
  
  const categories = initialCategories.length > 0 
    ? initialCategories.map(c => c.name) 
    : Array.from(new Set(initialMenuItems.map((i) => i.category)));

  const fetchHistory = useCallback(async () => {
    const orders = await getTableOrders(tableNumber, token);
    setTableOrders(orders);
  }, [tableNumber, token]);

  // Poll if history is open OR if there are any active orders that we are waiting for (Pending/Cooking)
  const hasActiveOrders = tableOrders.some(o => o.status === "Pending" || o.status === "Cooking");
  usePolling(fetchHistory, 4000, isHistoryOpen || hasActiveOrders);

  // Load history immediately on mount to populate tableOrders for badge notifications & instant drawer loading
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Detect when an order transitioned to "Served"
  const prevOrdersRef = useRef<any[]>([]);
  useEffect(() => {
    if (prevOrdersRef.current.length > 0 && tableOrders.length > 0) {
      tableOrders.forEach(order => {
        const prevOrder = prevOrdersRef.current.find((o: any) => o._id === order._id || o.id === order.id);
        if (prevOrder && (prevOrder.status === "Pending" || prevOrder.status === "Cooking") && order.status === "Served") {
          setServedNotification(`ออเดอร์ของโต๊ะ ${tableNumber} พร้อมเสิร์ฟแล้ว!`);
          
          // Double-pitch notification sound (660Hz -> 880Hz)
          try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(660, ctx.currentTime);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
            
            // Trigger vibration on mobile devices
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
          } catch (e) {
            console.warn("Audio/vibe alert failed (user interaction required):", e);
          }
        }
      });
    }
    prevOrdersRef.current = tableOrders;
  }, [tableOrders, tableNumber]);

  // Poll to verify table session validity. If the session has been terminated/rotated (payment completed),
  // clear localStorage and force refresh to trigger the "Link Expired" state.
  useEffect(() => {
    const checkSession = async () => {
      const isValid = await verifyTableSession(tableNumber, token);
      if (!isValid) {
        localStorage.removeItem("cart");
        localStorage.removeItem("itemNotes");
        window.location.reload();
      }
    };
    
    // Check immediately on mount and then poll every 6 seconds for outstanding security
    checkSession();
    const intervalId = setInterval(checkSession, 6000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [tableNumber, token]);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const cartItemsData = cart.map(c => ({
      itemId: c.item.id,
      quantity: c.quantity,
      note: itemNotes[c.cartItemId] || "",
      selectedOptions: c.selectedOptions
    }));

    const result = await submitOrder(tableNumber, token, cartItemsData);

    setIsSubmitting(false);

    if (result.success) {
      clearCart();
      setIsModalOpen(false);
      setShowSuccess(true);
      fetchHistory(); // Fetch history immediately after order is submitted!
      setTimeout(() => setShowSuccess(false), 3000);
      setTimeout(() => setIsHistoryOpen(true), 1000);
    } else {
      alert(result.error || "เกิดข้อผิดพลาดในการสั่งอาหาร กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกออเดอร์นี้?")) return;
    const res = await cancelOrder(orderId);
    if (res.success) {
      fetchHistory();
    } else {
      alert("ไม่สามารถยกเลิกออเดอร์ได้ (อาจกำลังปรุงอยู่)");
    }
  };

  const handleScrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    const element = document.getElementById(`category-${cat}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 180;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleOpenOptions = (item: any) => {
    if (!item.options || item.options.length === 0) {
      addToCart(item, []);
      return;
    }
    setOptionsModalItem(item);
    setSelectedOptions({}); // Reset options
  };

  const handleConfirmOptions = () => {
    if (!optionsModalItem) return;
    
    // Check required options
    for (const group of optionsModalItem.options) {
      if (group.required && (!selectedOptions[group.name] || selectedOptions[group.name].length === 0)) {
        alert(`กรุณาเลือก ${group.name}`);
        return;
      }
    }

    const cartOptions: CartItemOption[] = [];
    Object.keys(selectedOptions).forEach(groupName => {
      const group = optionsModalItem.options.find((g: any) => g.name === groupName);
      if (group) {
        selectedOptions[groupName].forEach(choiceName => {
          const choice = group.choices.find((c: any) => c.name === choiceName);
          if (choice) {
            cartOptions.push({
              groupName,
              choiceName,
              priceDelta: choice.priceDelta
            });
          }
        });
      }
    });

    addToCart(optionsModalItem, cartOptions);
    setOptionsModalItem(null);
  };

  const handleToggleOption = (groupName: string, choiceName: string, allowMultiple: boolean) => {
    setSelectedOptions(prev => {
      const groupSelections = prev[groupName] || [];
      if (allowMultiple) {
        if (groupSelections.includes(choiceName)) {
          return { ...prev, [groupName]: groupSelections.filter(c => c !== choiceName) };
        } else {
          return { ...prev, [groupName]: [...groupSelections, choiceName] };
        }
      } else {
        if (groupSelections.includes(choiceName)) {
          return { ...prev, [groupName]: [] };
        } else {
          return { ...prev, [groupName]: [choiceName] };
        }
      }
    });
  };

  return {
    cart,
    itemNotes,
    cartTotal,
    cartItemCount,
    activeCategory,
    isModalOpen,
    isHistoryOpen,
    isSubmitting,
    showSuccess,
    tableOrders,
    optionsModalItem,
    selectedOptions,
    categories,
    recommendations,
    isLoadingRecs,
    setIsModalOpen,
    setIsHistoryOpen,
    servedNotification,
    setServedNotification,
    addToCart,
    removeFromCart,
    removeAllOfItemFromCart,
    updateNote,
    setOptionsModalItem,
    handleSubmitOrder,
    handleCancelOrder,
    handleScrollToCategory,
    handleOpenOptions,
    handleConfirmOptions,
    handleToggleOption
  };
}
