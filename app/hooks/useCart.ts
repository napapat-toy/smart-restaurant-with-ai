import { useState } from "react";
import { MenuItem } from "@/data/mockDb";

export type CartItem = { item: MenuItem; quantity: number };

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) => (c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c));
      }
      
      const newNotes = { ...itemNotes };
      delete newNotes[itemId];
      setItemNotes(newNotes);
      return prev.filter((c) => c.item.id !== itemId);
    });
  };

  const updateNote = (itemId: string, note: string) => {
    setItemNotes((prev) => ({ ...prev, [itemId]: note }));
  };

  const clearCart = () => {
    setCart([]);
    setItemNotes({});
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const cartItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return {
    cart,
    itemNotes,
    addToCart,
    removeFromCart,
    updateNote,
    clearCart,
    cartTotal,
    cartItemCount,
  };
}
