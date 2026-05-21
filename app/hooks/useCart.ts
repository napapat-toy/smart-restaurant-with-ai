import { useState, useEffect } from "react";

export type CartItemOption = { groupName: string; choiceName: string; priceDelta: number };

export type CartItem = { 
  cartItemId: string; // Unique ID for cart management
  item: any; 
  quantity: number;
  selectedOptions: CartItemOption[];
};

export function useCart(tableNumber?: string, token?: string) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const cartKey = tableNumber && token ? `cart_${tableNumber}_${token}` : "cart";
  const notesKey = tableNumber && token ? `notes_${tableNumber}_${token}` : "itemNotes";

  // Load from LocalStorage
  useEffect(() => {
    if (tableNumber && token) {
      // Clean up old session carts/notes to save space
      try {
        const currentCartKey = `cart_${tableNumber}_${token}`;
        const currentNotesKey = `notes_${tableNumber}_${token}`;
        
        // Collect keys to remove first to avoid modifying local storage while iterating
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key === "cart" || key === "itemNotes" || key.startsWith("cart_") || key.startsWith("notes_"))) {
            if (key !== currentCartKey && key !== currentNotesKey) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (e) {
        console.error("Local storage cleanup failed", e);
      }
    }

    try {
      const savedCart = localStorage.getItem(cartKey);
      const savedNotes = localStorage.getItem(notesKey);
      setCart(savedCart ? JSON.parse(savedCart) : []);
      setItemNotes(savedNotes ? JSON.parse(savedNotes) : {});
    } catch {
      console.error("Failed to load cart from local storage");
    }
    setIsLoaded(true);
  }, [cartKey, notesKey, tableNumber, token]);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(cartKey, JSON.stringify(cart));
    localStorage.setItem(notesKey, JSON.stringify(itemNotes));
  }, [cart, itemNotes, isLoaded, cartKey, notesKey]);

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
