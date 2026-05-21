"use client";

import { Calculator, CheckCircle2, ChevronRight, ReceiptText, Users, X, Clock, Printer, QrCode, Ban, ArrowRightLeft, Sparkles, Tag } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCashier } from "@/app/hooks/useCashier";
import { formatPrice } from "@/lib/utils";

export default function CashierClient() {
  const {
    tables,
    selectedTable,
    isProcessing,
    showSuccess,
    isMember,
    printModalOpen,
    printRef,
    promoCodeInput,
    appliedPromo,
    promoDiscountAmount,
    recommendations,
    baseUrl,
    occupiedCount,
    setSelectedTable,
    setIsMember,
    setPromoCodeInput,
    setPrintModalOpen,
    handleApplyPromo,
    handleRemovePromo,
    handlePayment,
    handleOpenTable,
    handlePrint,
    handleCancelTable,
    handleMoveTable,
  } = useCashier();

  return (
    <div className="cashier-container">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} />
          <span className="font-medium">ชำระเงินและเคลียร์โต๊ะเรียบร้อยแล้ว!</span>
        </div>
      )}

      {/* Left Sidebar - Table Grid */}
      <div className={`cashier-sidebar-left ${selectedTable ? 'hidden md:flex' : 'flex'}`}>
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

        <div className="cashier-table-grid">
          {tables.map(table => (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`cashier-table-card group ${table.status === 'Occupied' ? 'is-occupied' : ''} ${selectedTable?.id === table.id ? 'is-selected' : ''}`}
            >
              {/* Background Decoration */}
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <Users size={80} />
              </div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="card-title">
                  <span className="text-lg font-bold opacity-70">โต๊ะ</span>
                  {table.tableNumber}
                </span>
                {table.unpaidOrders.length > 0 && (
                  <span className="card-badge">
                    มีบิลค้าง
                  </span>
                )}
              </div>

              <div className="relative z-10">
                <p className="card-label">ยอดรวม (บาท)</p>
                <p className="card-amount">
                  {table.status === 'Occupied' ? formatPrice(table.totalAmount) : '-'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Sidebar - Billing Details */}
      {selectedTable && (
        <div className="cashier-sidebar-right">
          <header className="cashier-sidebar-header">
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
                  <button onClick={handleMoveTable} disabled={isProcessing} className="btn-action-blue" title="ย้ายโต๊ะ">
                    <ArrowRightLeft size={18} />
                  </button>
                  <button onClick={handleCancelTable} disabled={isProcessing} className="btn-action-rose" title="ยกเลิกโต๊ะ">
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

          <div className="cashier-sidebar-body">
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
                  <div key={order.id} className="cashier-order-card">
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
                          <span className="text-slate-600 font-medium text-sm">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 border-dashed flex justify-between">
                      <span className="text-sm text-slate-500">รวม</span>
                      <span className="font-bold text-slate-900">{formatPrice(order.totalAmount)}</span>
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

            {/* AI Recommendation Pairings */}
            {recommendations.length > 0 && (
              <div className="cashier-ai-recs">
                <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles size={14} className="text-indigo-600 animate-pulse" />
                  เมนูแนะนำคู่กัน (AI Recommendation)
                </h4>
                <p className="text-[11px] text-indigo-700">แนะนำเผื่อลูกค้าสั่งเพิ่ม/รับกลับบ้าน:</p>
                <div className="grid grid-cols-1 gap-2">
                  {recommendations.map((item: any) => (
                    <div key={item.id} className="cashier-ai-rec-item">
                      <div className="flex items-center gap-2">
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover shadow-sm shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800 block leading-tight">{item.name}</span>
                          <span className="text-[10px] text-slate-400 block">{item.category}</span>
                        </div>
                      </div>
                      <span className="font-bold text-indigo-600">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="cashier-footer">
            {/* Promo Code Input */}
            <div className="cashier-promo-container">
              <span className="text-xs font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">โค้ดส่วนลด (Promo Code)</span>
              
              {!appliedPromo ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="ใส่โค้ดส่วนลด เช่น SAVE50"
                    className="cashier-promo-input"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="btn-promo-apply"
                  >
                    <Tag size={12} />
                    ใช้โค้ด
                  </button>
                </div>
              ) : (
                <div className="cashier-promo-applied">
                  <div className="flex items-center gap-1.5">
                    <Tag size={14} className="text-emerald-600 animate-pulse" />
                    <span>ใช้โค้ด {appliedPromo.code} ({appliedPromo.description})</span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-slate-400 hover:text-rose-600 font-bold text-sm px-2 py-1 rounded"
                    title="ยกเลิกโค้ด"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-4 border-t border-slate-50 pt-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium select-none">
                <input 
                  type="checkbox" 
                  checked={isMember} 
                  onChange={(e) => {
                    setIsMember(e.target.checked);
                    if (e.target.checked) {
                      handleRemovePromo(); // exclusive
                    }
                  }}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                ใช้สิทธิ์สมาชิก (ลด 10%)
              </label>
              {isMember && <span className="text-emerald-600 font-bold text-sm">-{formatPrice(selectedTable.totalAmount * 0.1)}</span>}
              {appliedPromo && <span className="text-emerald-600 font-bold text-sm">-{formatPrice(promoDiscountAmount)}</span>}
            </div>

            <div className="cashier-total-box">
              <span className="text-slate-500 font-medium">ยอดชำระสุทธิ (Grand Total)</span>
              <span className="text-4xl font-black text-blue-700">
                {formatPrice(
                  Math.max(
                    0,
                    selectedTable.totalAmount - 
                    (isMember ? Math.round(selectedTable.totalAmount * 0.1) : 0) - 
                    (appliedPromo ? promoDiscountAmount : 0)
                  )
                )}
              </span>
            </div>
            <button
              onClick={handlePayment}
              disabled={selectedTable.unpaidOrders.length === 0 || isProcessing}
              className="btn-payment"
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
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0 print-area">
            
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
