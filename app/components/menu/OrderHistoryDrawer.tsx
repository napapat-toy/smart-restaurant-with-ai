"use client";

import { X, ReceiptText, Clock } from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge";

interface OrderHistoryDrawerProps {
  isOpen: boolean;
  tableOrders: any[];
  onClose: () => void;
  onCancelOrder: (orderId: string) => void;
}

export function OrderHistoryDrawer({
  isOpen,
  tableOrders,
  onClose,
  onCancelOrder
}: OrderHistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ReceiptText className="text-blue-600" size={24} />
            ประวัติการสั่งอาหาร
          </h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
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
                        onClick={() => onCancelOrder(order.id)}
                        className="text-[10px] text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-200 hover:bg-rose-100 transition-colors"
                      >
                        ยกเลิก
                      </button>
                    )}
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item: any, idx: number) => (
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
  );
}
