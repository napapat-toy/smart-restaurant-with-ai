"use client";

import { X } from "lucide-react";
import { QuantityControl } from "../ui/QuantityControl";

interface CartDrawerProps {
  isOpen: boolean;
  cart: any[];
  itemNotes: Record<string, string>;
  cartTotal: number;
  isSubmitting: boolean;
  onClose: () => void;
  onRemoveFromCart: (cartItemId: string) => void;
  onAddToCart: (item: any, selectedOptions: any[]) => void;
  onUpdateNote: (cartItemId: string, note: string) => void;
  onSubmitOrder: () => void;
}

export function CartDrawer({
  isOpen,
  cart,
  itemNotes,
  cartTotal,
  isSubmitting,
  onClose,
  onRemoveFromCart,
  onAddToCart,
  onUpdateNote,
  onSubmitOrder
}: CartDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2 className="text-xl font-bold text-slate-900">สรุปรายการอาหาร</h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.map((c) => {
            const optionsTotal = c.selectedOptions?.reduce((s: number, o: any) => s + o.priceDelta, 0) || 0;
            const unitPrice = c.item.price + optionsTotal;

            return (
              <div key={c.cartItemId} className="mb-6 card-base">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{c.item.name}</h3>
                    
                    {/* Selected Options List */}
                    {c.selectedOptions && c.selectedOptions.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.selectedOptions.map((opt: any, idx: number) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
                            {opt.groupName}: {opt.choiceName} {opt.priceDelta > 0 ? `(+฿${opt.priceDelta})` : ""}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-blue-600 font-semibold text-sm mt-2">฿{unitPrice}</p>
                  </div>
                  <QuantityControl 
                    quantity={c.quantity} 
                    onDecrease={() => onRemoveFromCart(c.cartItemId)} 
                    onIncrease={() => onAddToCart(c.item, c.selectedOptions)} 
                    variant="slate" 
                  />
                </div>

                {/* Note Input */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="ระบุความต้องการพิเศษ (เช่น ไม่เผ็ด, แยกน้ำ)"
                    value={itemNotes[c.cartItemId] || ""}
                    onChange={(e) => onUpdateNote(c.cartItemId, e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-medium">ยอดรวมทั้งสิ้น</span>
            <span className="text-2xl font-bold text-slate-900">฿{cartTotal}</span>
          </div>
          <button
            onClick={onSubmitOrder}
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-2xl py-4 flex justify-center items-center gap-2 active:scale-[0.98] transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                กำลังส่งออเดอร์...
              </>
            ) : (
              <>ยืนยันการสั่งอาหาร</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
