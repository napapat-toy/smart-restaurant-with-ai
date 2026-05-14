"use client";

import { useState, useCallback } from "react";
import { mockMenuItems, Order } from "@/data/mockDb";
import { ShoppingCart, Plus, Minus, X, CheckCircle2, ReceiptText, Clock, ChefHat } from "lucide-react";
import { submitOrder, getTableOrders, cancelOrder } from "@/app/actions/order";
import { useCart } from "@/app/hooks/useCart";
import { usePolling } from "@/app/hooks/usePolling";
import { QuantityControl } from "./ui/QuantityControl";
import { StatusBadge } from "./ui/StatusBadge";



export default function MenuClient({ tableNumber }: { tableNumber: string }) {
  const { cart, itemNotes, addToCart, removeFromCart, updateNote, clearCart, cartTotal, cartItemCount } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tableOrders, setTableOrders] = useState<Order[]>([]);

  const categories = ["All", ...Array.from(new Set(mockMenuItems.map((i) => i.category)))];

  const fetchHistory = useCallback(async () => {
    const orders = await getTableOrders(tableNumber);
    setTableOrders(orders);
  }, [tableNumber]);

  usePolling(fetchHistory, 3000, isHistoryOpen);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const cartItemsData = cart.map(c => ({
      itemId: c.item.id,
      name: c.item.name,
      price: c.item.price,
      quantity: c.quantity,
      note: itemNotes[c.item.id] || ""
    }));

    const result = await submitOrder(tableNumber, cartItemsData);

    setIsSubmitting(false);

    if (result.success) {
      clearCart();
      setIsModalOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setTimeout(() => setIsHistoryOpen(true), 1000);
    } else {
      alert("เกิดข้อผิดพลาดในการสั่งอาหาร กรุณาลองใหม่อีกครั้ง");
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

  const filteredItems = activeCategory === "All"
    ? mockMenuItems
    : mockMenuItems.filter((i) => i.category === activeCategory);

  return (
    <div className="pb-28 max-w-md mx-auto min-h-screen bg-slate-50 relative">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} />
          <span className="font-medium">ส่งรายการสั่งอาหารสำเร็จ!</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 text-white p-6 pb-8 rounded-b-3xl shadow-lg sticky top-0 z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-blue-900"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-wide">Smart Menu</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <p className="text-blue-100 text-lg font-medium">โต๊ะที่ {tableNumber}</p>
            </div>
          </div>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl backdrop-blur-sm transition-all active:scale-95 shadow-inner"
            title="ดูประวัติการสั่งอาหาร"
          >
            <ReceiptText size={24} className="text-white" />
          </button>
        </div>
      </header>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto p-5 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="px-5 space-y-4">
        {filteredItems.map((item) => {
          const cartItem = cart.find((c) => c.item.id === item.id);
          return (
            <div key={item.id} className="card-base flex gap-4 hover:shadow-md transition-shadow">
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-semibold text-blue-700">฿{item.price}</span>

                  {cartItem ? (
                    <QuantityControl 
                      quantity={cartItem.quantity} 
                      onDecrease={() => removeFromCart(item.id)} 
                      onIncrease={() => addToCart(item)} 
                      variant="blue" 
                    />
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium active:scale-95"
                    >
                      เพิ่ม
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && !isModalOpen && !isHistoryOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-transparent pb-8 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-blue-600 text-white rounded-2xl p-4 flex justify-between items-center shadow-xl shadow-blue-200 hover:bg-blue-700 transition-colors active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="relative bg-white/20 p-2 rounded-xl">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm border-2 border-blue-600">
                  {cartItemCount}
                </span>
              </div>
              <span className="font-medium text-sm">ดูรายการสั่งอาหาร</span>
            </div>
            <span className="font-bold text-lg">฿{cartTotal}</span>
          </button>
        </div>
      )}

      {/* Order Summary Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <header className="bg-white p-5 flex items-center justify-between border-b border-slate-100 shadow-sm shrink-0">
              <h2 className="text-xl font-bold text-slate-900">สรุปรายการอาหาร</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.map((c) => (
                <div key={c.item.id} className="mb-6 card-base">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{c.item.name}</h3>
                      <p className="text-blue-600 font-medium text-sm mt-1">฿{c.item.price}</p>
                    </div>
                    <QuantityControl 
                      quantity={c.quantity} 
                      onDecrease={() => removeFromCart(c.item.id)} 
                      onIncrease={() => addToCart(c.item)} 
                      variant="slate" 
                    />
                  </div>

                  {/* Note Input */}
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="ระบุความต้องการพิเศษ (เช่น ไม่เผ็ด, แยกน้ำ)"
                      value={itemNotes[c.item.id] || ""}
                      onChange={(e) => updateNote(c.item.id, e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-slate-700 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-5 border-t border-slate-100 shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-medium">ยอดรวมทั้งสิ้น</span>
                <span className="text-2xl font-bold text-slate-900">฿{cartTotal}</span>
              </div>
              <button
                onClick={handleSubmitOrder}
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
      )}

      {/* Order History Modal */}
      {isHistoryOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <header className="bg-white p-5 flex items-center justify-between border-b border-slate-100 shadow-sm shrink-0">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ReceiptText className="text-blue-600" size={24} />
                ประวัติการสั่งอาหาร
              </h2>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {tableOrders.length === 0 ? (
                <div className="text-center text-slate-400 mt-20">
                  <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ReceiptText size={40} className="text-slate-300" />
                  </div>
                  <p className="font-medium text-slate-500">ยังไม่มีประวัติการสั่งอาหาร</p>
                </div>
              ) : (
                tableOrders.map(order => (
                  <div key={order.id} className="mb-6 card-base transition-all hover:shadow-md">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex items-center gap-2">
                        {order.status === 'Pending' && (
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-[10px] text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-200 hover:bg-rose-100 transition-colors"
                          >
                            ยกเลิก
                          </button>
                        )}
                        <StatusBadge status={order.status} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4">
                          <div>
                            <span className="font-medium text-slate-900 text-sm">
                              <span className="text-blue-600 mr-2">{item.quantity}x</span>
                              {item.name}
                            </span>
                            {item.note && <p className="text-xs text-amber-600 mt-1 bg-amber-50 inline-block px-2 py-0.5 rounded">* {item.note}</p>}
                          </div>
                          <span className="text-slate-600 font-medium text-sm">฿{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center bg-slate-100/70 -mx-5 -mb-5 p-5 rounded-b-2xl">
                      <span className="text-sm text-slate-500 font-medium">ราคารวม</span>
                      <span className="text-lg font-bold text-blue-700">฿{order.totalAmount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
