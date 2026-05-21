"use client";

import { useState, useEffect } from "react";
import { searchOrders } from "@/app/actions/admin";
import { Search, Calendar, RefreshCw, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  note: string;
  selectedOptions: { groupName: string; choiceName: string; priceDelta: number }[];
}

interface OrderRecord {
  id: string;
  tableId: string;
  status: "Pending" | "Cooking" | "Served" | "Paid" | "Cancelled";
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export default function OrderHistoryTab() {
  const [tableNumber, setTableNumber] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const fetchOrders = async (targetPage = page) => {
    setIsLoading(true);
    try {
      const res = await searchOrders({
        tableNumber: tableNumber.trim() || undefined,
        status: status === "all" ? undefined : status,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: targetPage,
        limit: 10
      });
      setOrders(res.orders as any[]);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
      setPage(res.page);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [status, dateFrom, dateTo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleReset = () => {
    setTableNumber("");
    setStatus("all");
    setDateFrom("");
    setDateTo("");
    fetchOrders(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">รอรับออเดอร์</span>;
      case "Cooking":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">กำลังปรุง</span>;
      case "Served":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">เสิร์ฟแล้ว</span>;
      case "Paid":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">ชำระเงินแล้ว</span>;
      case "Cancelled":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">ยกเลิก</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Search size={20} className="text-blue-500" />
            ประวัติการสั่งซื้อและออเดอร์
          </h2>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={12} />
            ล้างตัวกรองทั้งหมด
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">หมายเลขโต๊ะ</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="ทั้งหมด หรือระบุเลขโต๊ะ"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">สถานะออเดอร์</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all font-medium"
            >
              <option value="all">ทั้งหมด</option>
              <option value="Pending">รอรับออเดอร์ (Pending)</option>
              <option value="Cooking">กำลังปรุง (Cooking)</option>
              <option value="Served">เสิร์ฟแล้ว (Served)</option>
              <option value="Paid">ชำระเงินแล้ว (Paid)</option>
              <option value="Cancelled">ยกเลิก (Cancelled)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">ตั้งแต่วันที่</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">ถึงวันที่</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-all shadow-md active:scale-95 text-sm flex items-center justify-center gap-1"
            >
              <Search size={16} />
              ค้นหาออเดอร์
            </button>
          </div>
        </div>
      </form>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">กำลังค้นหาและดึงข้อมูลออเดอร์...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-30 text-slate-500" />
            <p className="text-base font-bold">ไม่พบประวัติออเดอร์ที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนการตั้งค่าตัวกรองของคุณ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">โต๊ะ</th>
                  <th className="py-4 px-6">วันที่ / เวลา</th>
                  <th className="py-4 px-6">รายการอาหาร</th>
                  <th className="py-4 px-6 text-right">ยอดรวม</th>
                  <th className="py-4 px-6 text-center">สถานะ</th>
                  <th className="py-4 px-6 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map((order) => {
                  const itemsListText = order.items
                    .map((i) => `${i.quantity}x ${i.name}`)
                    .join(", ");
                  
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-slate-900 text-base">
                        โต๊ะ {order.tableId}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("th-TH")} {new Date(order.createdAt).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 text-slate-600 max-w-xs truncate font-medium">
                        {itemsListText}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                          title="ดูรายละเอียดออเดอร์"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500">
                <span>ทั้งหมด {totalCount} รายการ ออเดอร์</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => fetchOrders(page - 1)}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm animate-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-bold text-slate-800">หน้า {page} จาก {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => fetchOrders(page + 1)}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm animate-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <header className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">รายละเอียดออเดอร์ โต๊ะ {selectedOrder.tableId}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </header>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 border-b border-slate-100 pb-3">
                <span>วันที่: {new Date(selectedOrder.createdAt).toLocaleString("th-TH")}</span>
                <span>{getStatusBadge(selectedOrder.status)}</span>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">รายการที่สั่ง</span>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex justify-between items-start text-sm">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800">{item.quantity}x {item.name}</span>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="text-xs text-slate-400 pl-4 space-y-0.5">
                            {item.selectedOptions.map((opt, i) => (
                              <p key={i}>• {opt.groupName}: {opt.choiceName} {opt.priceDelta > 0 ? `(+฿${opt.priceDelta})` : ""}</p>
                            ))}
                          </div>
                        )}
                        {item.note && (
                          <p className="text-xs text-rose-500 font-medium pl-4">Note: "{item.note}"</p>
                        )}
                      </div>
                      <span className="font-bold text-slate-700">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <footer className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500">ยอดชำระรวม</span>
              <span className="text-2xl font-black text-blue-700">{formatPrice(selectedOrder.totalAmount)}</span>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
