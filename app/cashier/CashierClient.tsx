"use client";

import { useState, useCallback } from "react";
import { getTablesWithBilling, processPayment, TableWithBilling } from "@/app/actions/cashier";
import { Calculator, CheckCircle2, ChevronRight, ReceiptText, Users, X } from "lucide-react";

import { usePolling } from "@/app/hooks/usePolling";

export default function CashierClient() {
  const [tables, setTables] = useState<TableWithBilling[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableWithBilling | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchTables = useCallback(async () => {
    const data = await getTablesWithBilling();
    setTables(data);
    
    // Update selected table if it's currently open using functional state update
    setSelectedTable(prev => {
      if (!prev) return null;
      const updated = data.find(t => t.id === prev.id);
      // To avoid unnecessary re-renders, only update if unpaidOrders length or totalAmount changed, 
      // but returning updated directly is fine since it happens in batch with setTables.
      return updated || null; 
    });
  }, []);

  usePolling(fetchTables, 3000);

  const handlePayment = async () => {
    if (!selectedTable) return;
    setIsProcessing(true);

    const result = await processPayment(selectedTable.id);

    setIsProcessing(false);
    if (result.success) {
      setSelectedTable(null);
      setShowSuccess(true);
      fetchTables();
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert("เกิดข้อผิดพลาดในการชำระเงิน");
    }
  };

  const occupiedCount = tables.filter(t => t.status === 'Occupied').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} />
          <span className="font-medium">ชำระเงินและเคลียร์โต๊ะเรียบร้อยแล้ว!</span>
        </div>
      )}

      {/* Left Sidebar - Table Grid */}
      <div className={`flex-1 p-6 md:p-8 flex flex-col h-screen overflow-y-auto ${selectedTable ? 'hidden md:flex' : 'flex'}`}>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
              <Calculator size={28} />
            </div>
            Cashier System
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              โต๊ะว่าง: {tables.length - occupiedCount}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              ไม่ว่าง: {occupiedCount}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {tables.map(table => (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`text-left rounded-3xl p-5 border-2 transition-all duration-200 relative overflow-hidden group
                ${table.status === 'Occupied'
                  ? selectedTable?.id === table.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 ring-4 ring-blue-100'
                    : 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-lg shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                }
              `}
            >
              {/* Background Decoration */}
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <Users size={80} />
              </div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className={`text-3xl font-black flex items-center gap-2 ${table.status === 'Occupied'
                    ? selectedTable?.id === table.id ? 'text-white' : 'text-blue-900'
                    : 'text-slate-400'
                  }`}>
                  <span className="text-lg font-bold opacity-70">โต๊ะ</span>
                  {table.tableNumber}
                </span>
                {table.unpaidOrders.length > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${selectedTable?.id === table.id ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                    }`}>
                    มีบิลค้าง
                  </span>
                )}
              </div>

              <div className="relative z-10">
                <p className={`text-sm font-medium mb-1 ${table.status === 'Occupied'
                    ? selectedTable?.id === table.id ? 'text-blue-100' : 'text-slate-500'
                    : 'text-slate-400'
                  }`}>ยอดรวม (บาท)</p>
                <p className={`text-2xl font-bold ${table.status === 'Occupied'
                    ? selectedTable?.id === table.id ? 'text-white' : 'text-slate-900'
                    : 'text-slate-400'
                  }`}>
                  {table.status === 'Occupied' ? `฿${table.totalAmount}` : '-'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Sidebar - Billing Details */}
      {selectedTable && (
        <div className="w-full md:w-[400px] lg:w-[480px] bg-white border-l border-slate-200 h-screen flex flex-col shadow-2xl relative z-20 animate-in slide-in-from-right duration-300">
          <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ReceiptText size={20} className="text-blue-400" />
                บิลสำหรับโต๊ะ {selectedTable.tableNumber}
              </h2>
              <p className="text-slate-400 text-sm mt-1">{selectedTable.unpaidOrders.length} ออเดอร์ที่ยังไม่ชำระเงิน</p>
            </div>
            <button
              onClick={() => setSelectedTable(null)}
              className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-full transition-colors md:hidden"
            >
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {selectedTable.unpaidOrders.length === 0 ? (
              <div className="text-center text-slate-400 mt-20 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-slate-300" />
                </div>
                <p className="font-medium text-slate-500">ไม่มีบิลค้างชำระ</p>
                <p className="text-sm mt-1">โต๊ะนี้สามารถรับลูกค้าใหม่ได้เลย</p>
              </div>
            ) : (
              <div className="space-y-6">
                {selectedTable.unpaidOrders.map((order, idx) => (
                  <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between text-xs text-slate-500 mb-3 border-b border-slate-50 pb-2">
                      <span>ออเดอร์ #{idx + 1}</span>
                      <span>{new Date(order.createdAt).toLocaleTimeString('th-TH')}</span>
                    </div>
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-slate-900 text-sm">{item.quantity}x {item.name}</span>
                          </div>
                          <span className="text-slate-600 font-medium text-sm">฿{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 border-dashed flex justify-between">
                      <span className="text-sm text-slate-500">รวม</span>
                      <span className="font-bold text-slate-900">฿{order.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-100 shrink-0">
            <div className="flex justify-between items-end mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">ยอดชำระสุทธิ (Grand Total)</span>
              <span className="text-4xl font-black text-blue-700">฿{selectedTable.totalAmount}</span>
            </div>
            <button
              onClick={handlePayment}
              disabled={selectedTable.unpaidOrders.length === 0 || isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl py-5 text-lg flex justify-center items-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20 disabled:shadow-none"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>ชำระเงินและเคลียร์โต๊ะ <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
