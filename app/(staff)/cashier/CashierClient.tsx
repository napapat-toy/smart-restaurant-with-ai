"use client";

import { useState, useCallback, useRef } from "react";
import { getTablesWithBilling, processPayment, openTableSession, cancelTableSession, moveTable, TableWithBilling } from "@/app/actions/cashier";
import { Calculator, CheckCircle2, ChevronRight, ReceiptText, Users, X, Clock, Printer, QrCode, Ban, ArrowRightLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { usePolling } from "@/app/hooks/usePolling";

export default function CashierClient() {
  const [tables, setTables] = useState<TableWithBilling[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableWithBilling | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

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
      setIsMember(false);
      setShowSuccess(true);
      fetchTables();
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert("เกิดข้อผิดพลาดในการชำระเงิน");
    }
  };

  const handleOpenTable = async () => {
    if (!selectedTable) return;
    setIsProcessing(true);
    const result = await openTableSession(selectedTable.id);
    setIsProcessing(false);
    if (result.success) {
      setPrintModalOpen(true);
      fetchTables();
    } else {
      alert("ไม่สามารถเปิดโต๊ะได้");
    }
  };

  const handlePrint = () => {
    window.print();
    setPrintModalOpen(false);
  };

  const handleCancelTable = async () => {
    if (!selectedTable) return;
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะยกเลิกโต๊ะ ${selectedTable.tableNumber}? (ออเดอร์ทั้งหมดจะถูกยกเลิก)`)) return;
    setIsProcessing(true);
    const result = await cancelTableSession(selectedTable.id);
    setIsProcessing(false);
    if (result.success) {
      setSelectedTable(null);
      fetchTables();
    } else {
      alert("เกิดข้อผิดพลาด: " + result.error);
    }
  };

  const handleMoveTable = async () => {
    if (!selectedTable) return;
    const availableTables = tables.filter(t => t.status === 'Available');
    if (availableTables.length === 0) {
      alert("ไม่มีโต๊ะว่างให้ย้ายในขณะนี้");
      return;
    }
    
    // Create a simple prompt string showing available tables
    const availableNumbers = availableTables.map(t => t.tableNumber).join(", ");
    const destNumber = prompt(`ย้ายจากโต๊ะ ${selectedTable.tableNumber}\nโต๊ะที่ว่าง: ${availableNumbers}\n\nกรุณาพิมพ์หมายเลขโต๊ะปลายทาง:`);
    
    if (!destNumber) return;
    
    const targetTable = availableTables.find(t => t.tableNumber === destNumber);
    if (!targetTable) {
      alert("หมายเลขโต๊ะไม่ถูกต้อง หรือโต๊ะนั้นไม่ว่าง");
      return;
    }

    if (!confirm(`ยืนยันการย้ายโต๊ะ ${selectedTable.tableNumber} ไปยังโต๊ะ ${targetTable.tableNumber} หรือไม่?`)) return;

    setIsProcessing(true);
    const result = await moveTable(selectedTable.id, targetTable.id);
    setIsProcessing(false);
    
    if (result.success) {
      setSelectedTable(null);
      fetchTables();
      alert(`ย้ายโต๊ะสำเร็จ! โปรดพิมพ์ QR Code ใหม่ให้โต๊ะ ${targetTable.tableNumber}`);
    } else {
      alert("เกิดข้อผิดพลาด: " + result.error);
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
            <div className="flex items-center gap-2">
              {selectedTable.status === 'Occupied' && (
                <>
                  <button onClick={handleMoveTable} disabled={isProcessing} className="p-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-blue-600 rounded-full transition-colors" title="ย้ายโต๊ะ">
                    <ArrowRightLeft size={18} />
                  </button>
                  <button onClick={handleCancelTable} disabled={isProcessing} className="p-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 rounded-full transition-colors" title="ยกเลิกโต๊ะ">
                    <Ban size={18} />
                  </button>
                </>
              )}
              <button
                onClick={() => { setSelectedTable(null); setIsMember(false); }}
                className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-full transition-colors md:hidden ml-2"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {selectedTable.unpaidOrders.length === 0 ? (
              <div className="text-center mt-10 flex flex-col items-center max-w-sm mx-auto">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6 flex flex-col items-center">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl mb-4">
                    <QrCode size={32} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">เปิดโต๊ะและออก QR Code</h3>
                  <p className="text-sm text-slate-500 mb-6">ออก QR Code สำหรับสั่งอาหารให้ลูกค้านำไปที่โต๊ะ {selectedTable.tableNumber}</p>
                  
                  {selectedTable.status === 'Available' ? (
                    <button
                      onClick={handleOpenTable}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      {isProcessing ? "กำลังประมวลผล..." : <><Printer size={18} /> พิมพ์ QR Code ให้ลูกค้า</>}
                    </button>
                  ) : (
                    <div className="w-full">
                      <div className="bg-amber-50 text-amber-700 text-sm font-medium p-3 rounded-xl mb-4 border border-amber-200 flex items-center justify-center gap-2">
                        โต๊ะนี้เปิดใช้งานแล้ว (แต่ยังไม่ได้สั่งอาหาร)
                      </div>
                      <button
                        onClick={() => setPrintModalOpen(true)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <Printer size={18} /> พิมพ์ QR Code ซ้ำ
                      </button>
                    </div>
                  )}
                </div>
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
            {/* Warning for unserved orders */}
            {selectedTable.unpaidOrders.some(o => o.status === 'Pending' || o.status === 'Cooking') && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-700 items-start shadow-sm">
                <div className="bg-amber-100 p-1.5 rounded-full mt-0.5"><Clock size={16} /></div>
                <div>
                  <p className="font-bold text-sm">ระวัง: มีออเดอร์ที่ยังเสิร์ฟไม่ครบ</p>
                  <p className="text-xs mt-1">คุณกำลังจะคิดเงินโต๊ะนี้ แต่ยังมีออเดอร์ในครัวที่ยังทำไม่เสร็จ</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium select-none">
                <input 
                  type="checkbox" 
                  checked={isMember} 
                  onChange={(e) => setIsMember(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                ใช้สิทธิ์สมาชิก (ลด 10%)
              </label>
              {isMember && <span className="text-emerald-600 font-bold text-sm">-฿{(selectedTable.totalAmount * 0.1).toFixed(2)}</span>}
            </div>
            <div className="flex justify-between items-end mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">ยอดชำระสุทธิ (Grand Total)</span>
              <span className="text-4xl font-black text-blue-700">
                ฿{isMember ? (selectedTable.totalAmount * 0.9).toFixed(2) : selectedTable.totalAmount}
              </span>
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
      {/* Print Modal Overlay */}
      {printModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:bg-white print:p-0">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0">
            
            {/* The Slip to Print */}
            <div ref={printRef} className="flex flex-col items-center text-center pb-8 border-b-2 border-dashed border-slate-200 print:border-none print:pb-0">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Smart Restaurant</h2>
              <p className="text-sm text-slate-500 mb-6">สแกนเพื่อสั่งอาหาร (Scan to Order)</p>
              
              <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl mb-6">
                <QRCodeSVG
                  value={`${baseUrl}?table=${selectedTable.tableNumber}&token=${selectedTable.token}`}
                  size={200}
                  level="H"
                />
              </div>

              <div className="text-3xl font-black text-slate-900 flex items-center gap-2 mb-2">
                <span className="text-lg font-medium text-slate-500">TABLE</span>
                {selectedTable.tableNumber}
              </div>
              <p className="text-xs text-slate-400 font-mono break-all px-4">{selectedTable.token}</p>
            </div>

            {/* Print Controls (Hidden during actual print) */}
            <div className="flex gap-3 mt-8 print:hidden">
              <button 
                onClick={() => setPrintModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                ปิดหน้าต่าง
              </button>
              <button 
                onClick={handlePrint}
                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex justify-center items-center gap-2 transition-all shadow-md"
              >
                <Printer size={18} /> สั่งปรินต์
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
