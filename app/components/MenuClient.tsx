"use client";

import { useState, useRef } from "react";
import { ShoppingCart, CheckCircle2, ReceiptText } from "lucide-react";
import { useMenu } from "@/app/hooks/useMenu";

// Extracted Subcomponents
import { MenuItemCard } from "./menu/MenuItemCard";
import { OptionsSelectionModal } from "./menu/OptionsSelectionModal";
import { CartDrawer } from "./menu/CartDrawer";
import { OrderHistoryDrawer } from "./menu/OrderHistoryDrawer";

export default function MenuClient({ tableNumber, token, initialMenuItems, initialCategories = [] }: { tableNumber: string, token: string, initialMenuItems: any[], initialCategories?: any[] }) {
  const {
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
  } = useMenu({ tableNumber, token, initialMenuItems, initialCategories });
  // Desktop Drag-to-Scroll State & Handlers
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setDragMoved(false);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    if (Math.abs(x - startX) > 5) {
      setDragMoved(true);
    }
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="pb-28 max-w-md mx-auto min-h-screen bg-slate-50 relative">
      {/* Sticky Top Wrapper to hold both elements perfectly in place together */}
      <div className="sticky-top-wrapper">
        {/* Success Toast */}
        {showSuccess && (
          <div className="toast-success">
            <CheckCircle2 size={20} />
            <span className="font-medium">ส่งรายการสั่งอาหารสำเร็จ!</span>
          </div>
        )}
        {/* Flat Header Card */}
        <header className="flat-header">
          {/* Subtle Background Gradient */}
          <div className="absolute inset-0 bg-gradient-header opacity-95"></div>
          
          <div className="relative z-20 flex justify-between items-center">
            <div>
              <span className="restaurant-badge">Smart Restaurant</span>
              <h1 className="text-2xl font-black mt-1 tracking-tight text-shadow-subtle">Smart Menu</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Active Table Status Badge */}
              <div className="badge-table-status">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-white text-base font-extrabold tracking-wide text-shadow-subtle">โต๊ะที่ {tableNumber}</span>
              </div>
              
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="btn-header-action relative"
                title="ดูประวัติการสั่งอาหาร"
              >
                <ReceiptText size={20} className="text-white" />
                {tableOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Distinct, Beautiful Light-Glass Floating Category Bar */}
        <div className="relative glass-panel transition-all duration-300">
          {/* Fade Left Indicator */}
          <div className="fade-edge-left"></div>
          {/* Fade Right Indicator */}
          <div className="fade-edge-right"></div>

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="relative z-10 flex gap-2.5 overflow-x-auto px-6 py-3.5 no-scrollbar scroll-smooth select-none cursor-grab active:cursor-grabbing"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={(e) => {
                  if (dragMoved) {
                    e.preventDefault();
                    return;
                  }
                  handleScrollToCategory(cat);
                }}
                className={`category-pill ${
                  activeCategory === cat ? "category-pill-active" : "category-pill-inactive"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-5 py-4 space-y-8">
        {categories.map((cat) => {
          const itemsInCategory = initialMenuItems.filter((i) => i.category === cat);
          if (itemsInCategory.length === 0) return null;

          return (
            <div key={cat} id={`category-${cat}`} className="scroll-mt-[150px]">
              <h2 className="text-xl font-bold text-slate-800 mb-4">{cat}</h2>
              <div className="space-y-4">
                {itemsInCategory.map((item) => {
                  const totalQuantityInCart = cart
                    .filter((c) => c.item.id === item.id)
                    .reduce((sum, c) => sum + c.quantity, 0);

                  return (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      totalQuantityInCart={totalQuantityInCart}
                      onOpenOptions={handleOpenOptions}
                      onRemoveAllOfItem={removeAllOfItemFromCart}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && !isModalOpen && !isHistoryOpen && (
        <div className="floating-cart-container">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-floating-cart"
          >
            <div className="flex items-center gap-3">
              <div className="cart-icon-wrapper">
                <ShoppingCart size={20} />
                <span className="cart-badge">
                  {cartItemCount}
                </span>
              </div>
              <span className="font-medium text-sm">ดูรายการสั่งอาหาร</span>
            </div>
            <span className="font-bold text-lg">฿{cartTotal}</span>
          </button>
        </div>
      )}

      {/* Order Summary Drawer */}
      <CartDrawer
        isOpen={isModalOpen}
        cart={cart}
        itemNotes={itemNotes}
        cartTotal={cartTotal}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onRemoveFromCart={removeFromCart}
        onAddToCart={addToCart}
        onUpdateNote={updateNote}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Order History Drawer */}
      <OrderHistoryDrawer
        isOpen={isHistoryOpen}
        tableOrders={tableOrders}
        onClose={() => setIsHistoryOpen(false)}
        onCancelOrder={handleCancelOrder}
      />

      {/* Options Selection Modal */}
      <OptionsSelectionModal
        item={optionsModalItem}
        selectedOptions={selectedOptions}
        onClose={() => setOptionsModalItem(null)}
        onToggleOption={handleToggleOption}
        onConfirm={handleConfirmOptions}
      />
    </div>
  );
}
