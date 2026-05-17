import { useState, useEffect } from "react";

export type CartItemOption = { groupName: string; choiceName: string; priceDelta: number };

export type CartItem = { 
  cartItemId: string; // Unique ID for cart management
  item: any; 
  quantity: number;
  selectedOptions: CartItemOption[];
};

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      const savedNotes = localStorage.getItem("itemNotes");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedNotes) setItemNotes(JSON.parse(savedNotes));
    } catch {
      console.error("Failed to load cart from local storage");
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("itemNotes", JSON.stringify(itemNotes));
  }, [cart, itemNotes, isLoaded]);

  const addToCart = (item: any, selectedOptions: CartItemOption[] = []) => {
    // Generate a unique ID based on item ID and selected options
    const optionsHash = selectedOptions.map(o => `${o.groupName}:${o.choiceName}`).sort().join('|');
    const cartItemId = `${item.id}-${optionsHash}`;

    setCart((prev) => {
      const existing = prev.find((c) => c.cartItemId === cartItemId);
      if (existing) {
        return prev.map((c) => (c.cartItemId === cartItemId ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { cartItemId, item, quantity: 1, selectedOptions }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.cartItemId === cartItemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) => (c.cartItemId === cartItemId ? { ...c, quantity: c.quantity - 1 } : c));
      }
      
      const newNotes = { ...itemNotes };
      delete newNotes[cartItemId];
      setItemNotes(newNotes);
      return prev.filter((c) => c.cartItemId !== cartItemId);
    });
  };

  const removeAllOfItemFromCart = (itemId: string) => {
    setCart((prev) => {
      const itemsToRemove = prev.filter((c) => c.item.id === itemId);
      const newNotes = { ...itemNotes };
      itemsToRemove.forEach((c) => {
        delete newNotes[c.cartItemId];
      });
      setItemNotes(newNotes);
      return prev.filter((c) => c.item.id !== itemId);
    });
  };

  const updateNote = (cartItemId: string, note: string) => {
    setItemNotes((prev) => ({ ...prev, [cartItemId]: note }));
  };

  const clearCart = () => {
    setCart([]);
    setItemNotes({});
  };

  const cartTotal = cart.reduce((sum, c) => {
    const optionsTotal = c.selectedOptions?.reduce((s, o) => s + o.priceDelta, 0) || 0;
    return sum + (c.item.price + optionsTotal) * c.quantity;
  }, 0);
  const cartItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return {
    cart,
    itemNotes,
    addToCart,
    removeFromCart,
    removeAllOfItemFromCart,
    updateNote,
    clearCart,
    cartTotal,
    cartItemCount,
  };
}
