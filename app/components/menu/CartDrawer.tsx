"use client";

import Image from "next/image";
import { X, Plus, Sparkles } from "lucide-react";
import { QuantityControl } from "../ui/QuantityControl";
import { formatPrice } from "@/lib/utils";


interface CartDrawerProps {
  isOpen: boolean;
  cart: any[];
  itemNotes: Record<string, string>;
  cartTotal: number;
  isSubmitting: boolean;
  recommendations?: any[];
  isLoading?: boolean;
  onClose: () => void;
  onRemoveFromCart: (cartItemId: string) => void;
  onAddToCart: (item: any, selectedOptions: any[]) => void;
  onUpdateNote: (cartItemId: string, note: string) => void;
  onSubmitOrder: () => void;
  onAddRecommendedItem: (item: any) => void;
}

export function CartDrawer({
  isOpen,
  cart,
  itemNotes,
  cartTotal,
  isSubmitting,
  recommendations = [],
  isLoading = false,
  onClose,
  onRemoveFromCart,
  onAddToCart,
  onUpdateNote,
  onSubmitOrder,
  onAddRecommendedItem
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
                            {opt.groupName}: {opt.choiceName} {opt.priceDelta > 0 ? `(+${formatPrice(opt.priceDelta)})` : ""}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-blue-600 font-semibold text-sm mt-2">{formatPrice(unitPrice)}</p>
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

          {/* AI Recommendations Section */}
          {recommendations && recommendations.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200/60">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-amber-500 fill-amber-100 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-800">สั่งคู่กันอร่อยยิ่งขึ้น (AI แนะนำ)</h4>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-400">กำลังคิดคำแนะนำ...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {item.image ? (
                        <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 text-[10px] font-semibold shrink-0">
                          ไม่มีรูป
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-semibold text-slate-800 truncate">{item.name}</h5>
                        <p className="text-[10px] text-slate-400 truncate mb-1">{item.description || item.category}</p>
                        <span className="text-xs font-bold text-blue-600">{formatPrice(item.price)}</span>
                      </div>

                      <button
                        onClick={() => onAddRecommendedItem(item)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 p-2 rounded-xl active:scale-95 transition-all shrink-0"
                        title="เพิ่มลงตะกร้า"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-medium">ยอดรวมทั้งสิ้น</span>
            <span className="text-2xl font-bold text-slate-900">{formatPrice(cartTotal)}</span>
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
