"use client";

import { useEffect, useState } from "react";
import { getDiscounts, createDiscount, deleteDiscount } from "@/app/actions/discount";
import { Ticket, Plus, Trash2, Calendar, DollarSign, Percent, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export function DiscountsTab() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [value, setValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(100);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getDiscounts();
      setDiscounts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load discounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return alert("กรุณากรอกรหัสส่วนลด");
    try {
      const result = await createDiscount({
        code: code.trim().toUpperCase(),
        description: discountType === "percent" ? `ส่วนลด ${value}%` : `ส่วนลด ${value} บาท`,
        type: discountType === "percent" ? "percentage" : "fixed",
        value: Number(value),
        minOrderAmount: Number(minOrderAmount),
        maxUsage: Number(usageLimit),
        startsAt: startDate ? startDate : null,
        expiresAt: endDate ? endDate : null,
      });

      if (result.success) {
        setShowAddForm(false);
        setCode("");
        setValue(10);
        setMinOrderAmount(0);
        setMaxDiscountAmount(0);
        setUsageLimit(100);
        loadData();
      } else {
        alert(result.error || "เกิดข้อผิดพลาดในการสร้างคูปอง");
      }
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการสร้างคูปอง");
    }
  };

  const handleDelete = async (discountId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคูปองส่วนลดนี้?")) return;
    try {
      const result = await deleteDiscount(discountId);
      if (result.success) {
        loadData();
      } else {
        alert(result.error || "เกิดข้อผิดพลาดในการลบคูปอง");
      }
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Ticket className="text-blue-600" />
            จัดการคูปองส่วนลด
          </h2>
          <p className="text-xs text-slate-500 mt-1">สร้าง แก้ไข และลบคูปองสำหรับใช้งานหน้าคิดเงิน</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md active:scale-95 w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          {showAddForm ? "ปิดแบบฟอร์ม" : "สร้างคูปองใหม่"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-800 border-b pb-2">รายละเอียดคูปองใหม่</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">รหัสส่วนลด (Code)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น SAVE50, SUMMER20"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">ประเภทส่วนลด</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="percent">เปอร์เซ็นต์ (%)</option>
                <option value="amount">จำนวนเงินคงที่ (บาท)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">มูลค่าส่วนลด</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                min={0}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">ขั้นต่ำในการสั่งซื้อ (บาท)</label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                min={0}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {discountType === "percent" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">ลดได้สูงสุดไม่เกิน (บาท, 0 คือไม่จำกัด)</label>
                <input
                  type="number"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                  min={0}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">สิทธิ์การใช้งานสูงสุด (ครั้ง)</label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                min={1}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">วันที่เริ่มใช้งาน</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">วันที่สิ้นสุดใช้งาน</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all"
            >
              บันทึกคูปอง
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span>กำลังโหลดคูปอง...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-950/10 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle />
          <span>{error}</span>
        </div>
      ) : discounts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl text-slate-400">
          <Ticket size={48} className="mx-auto opacity-20 mb-3" />
          <p className="text-sm font-semibold">ยังไม่มีคูปองส่วนลดในระบบ</p>
          <p className="text-xs mt-1 text-slate-400">คลิก "สร้างคูปองใหม่" เพื่อเริ่มสร้างคูปองส่วนลดแคมเปญแรก</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => {
            const isExpired = discount.expiresAt ? new Date(discount.expiresAt) < new Date() : false;
            const isLimitReached = discount.maxUsage > 0 && discount.usageCount >= discount.maxUsage;
            
            return (
              <div 
                key={discount.id} 
                className={`bg-white border rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all hover:shadow-md ${
                  isExpired || isLimitReached ? "border-slate-100 opacity-60" : "border-slate-100"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 font-extrabold text-sm px-3 py-1 rounded-xl uppercase">
                      <Ticket size={14} />
                      {discount.code}
                    </span>
                    <span className="text-slate-400 block text-[10px] mt-1">ID: {discount.id}</span>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(discount.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="ลบคูปองส่วนลด"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-semibold">มูลค่าลด:</span>
                    <span className="text-slate-800 font-bold flex items-center gap-0.5">
                      {discount.type === "percentage" ? (
                        <>
                          <Percent size={14} className="text-blue-600" />
                          {discount.value}%
                        </>
                      ) : (
                        <>
                          <DollarSign size={14} className="text-emerald-600" />
                          {formatPrice(discount.value)}
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-semibold">ขั้นต่ำการสั่งซื้อ:</span>
                    <span className="text-slate-800 font-bold">{formatPrice(discount.minOrderAmount)}</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-semibold">สิทธิ์ที่ใช้ไปแล้ว:</span>
                    <span className={`font-bold ${isLimitReached ? "text-rose-600" : "text-slate-800"}`}>
                      {discount.usageCount} / {discount.maxUsage > 0 ? discount.maxUsage + " ครั้ง" : "ไม่จำกัด"}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs pt-2 border-t border-slate-50">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Calendar size={12} /> ช่วงเวลา:
                    </span>
                    <span className="text-slate-600 font-medium">
                      {discount.startsAt ? new Date(discount.startsAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : "เริ่มทันที"} - {discount.expiresAt ? new Date(discount.expiresAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }) : "ไม่มีวันหมดอายุ"}
                    </span>
                  </div>
                </div>

                {isExpired && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold text-center py-1.5 rounded-xl uppercase tracking-wider">
                    หมดอายุแล้ว
                  </div>
                )}
                {isLimitReached && !isExpired && (
                  <div className="bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold text-center py-1.5 rounded-xl uppercase tracking-wider">
                    สิทธิ์เต็มแล้ว
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
