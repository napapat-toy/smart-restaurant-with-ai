"use client";

import { useState, useCallback, useEffect } from "react";
import { submitOrder, getTableOrders, cancelOrder, verifyTableSession } from "@/app/actions/order";
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
  } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  
  // Options Modal State
  const [optionsModalItem, setOptionsModalItem] = useState<any | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  const categories = initialCategories.length > 0 
    ? initialCategories.map(c => c.name) 
    : Array.from(new Set(initialMenuItems.map((i) => i.category)));

  const fetchHistory = useCallback(async () => {
    const orders = await getTableOrders(tableNumber, token);
    setTableOrders(orders);
  }, [tableNumber, token]);

  usePolling(fetchHistory, 3000, isHistoryOpen);

  // Load history immediately on mount to populate tableOrders for badge notifications & instant drawer loading
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
        return { ...prev, [groupName]: [choiceName] };
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
    setIsModalOpen,
    setIsHistoryOpen,
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
