"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  XOctagon, 
  Award, 
  UtensilsCrossed, 
  Grid,
  Calendar,
  RefreshCw
} from "lucide-react";
import { getAnnualAnalytics, AnnualAnalyticsResult } from "@/app/actions/analytics";

export function AnalyticsTab() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [data, setData] = useState<AnnualAnalyticsResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAnalytics = async (year: number) => {
    setIsLoading(true);
    try {
      const res = await getAnnualAnalytics(year);
      setData(res);
    } catch (error) {
      console.error("Failed to load annual analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedYear);
  }, [selectedYear]);

  // Find max monthly revenue to scale the custom CSS chart bar heights
  const maxMonthlyRevenue = data?.monthlyBreakdown 
    ? Math.max(...data.monthlyBreakdown.map(m => m.revenue), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-blue-600" />
            รายงานยอดขาย & สถิติประจำปี
          </h2>
          <p className="text-xs text-slate-500 mt-1">วิเคราะห์ยอดขาย แนวโน้มความนิยม และการทำงานรายปีของห้องอาหาร</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 w-full sm:w-auto">
            <Calendar size={16} className="text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent text-slate-700 text-sm font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value={2026}>ปี ค.ศ. 2026</option>
              <option value={2025}>ปี ค.ศ. 2025</option>
              <option value={2024}>ปี ค.ศ. 2024</option>
            </select>
          </div>
          
          <button 
            onClick={() => fetchAnalytics(selectedYear)}
            disabled={isLoading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-2xl transition-all disabled:opacity-50"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-4">กำลังประมวลผลรายงานขายประจำปี...</p>
        </div>
      ) : data ? (
        <>
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* CARD 1: TOTAL REVENUE */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-md shadow-blue-500/10 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 transform scale-150 transition-transform group-hover:scale-175 duration-500">
                <DollarSign size={100} />
              </div>
              <div className="flex justify-between items-start">
                <div className="bg-white/20 p-2 rounded-2xl">
                  <TrendingUp size={20} />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full">ยอดขายรวม</span>
              </div>
              <div className="mt-8">
                <span className="text-xs text-blue-100 block">รายได้ประจำปี {data.year}</span>
                <span className="text-3xl font-black tracking-tight mt-1 block">฿{data.totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* CARD 2: TOTAL ORDERS */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-slate-100 opacity-50 transform scale-150">
                <ShoppingBag size={100} />
              </div>
              <div className="flex justify-between items-start z-10">
                <div className="bg-emerald-50 text-emerald-600 p-2 rounded-2xl">
                  <ShoppingBag size={20} />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">จำนวนออเดอร์</span>
              </div>
              <div className="mt-8 z-10">
                <span className="text-xs text-slate-400 block">ออเดอร์ที่ชำระแล้ว: {data.paidOrdersCount} รายการ</span>
                <span className="text-3xl font-black text-slate-800 tracking-tight mt-1 block">{data.totalOrders.toLocaleString()} <span className="text-xs font-semibold text-slate-500">บิล</span></span>
              </div>
            </div>

            {/* CARD 3: AVERAGE ORDER VALUE */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 text-slate-100 opacity-50 transform scale-150">
                <DollarSign size={100} />
              </div>
              <div className="flex justify-between items-start z-10">
                <div className="bg-amber-50 text-amber-600 p-2 rounded-2xl">
                  <DollarSign size={20} />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">ค่าเฉลี่ยต่อบิล</span>
              </div>
              <div className="mt-8 z-10">
                <span className="text-xs text-slate-400 block">ยอดสั่งซื้อเฉลี่ย (AOV)</span>
                <span className="text-3xl font-black text-slate-800 tracking-tight mt-1 block">฿{data.averageOrderValue.toLocaleString()}</span>
              </div>
            </div>

            {/* CARD 4: CANCELLED ORDERS */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 text-slate-100 opacity-50 transform scale-150">
                <XOctagon size={100} />
              </div>
              <div className="flex justify-between items-start z-10">
                <div className="bg-rose-50 text-rose-600 p-2 rounded-2xl">
                  <XOctagon size={20} />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">ยกเลิกรายการ</span>
              </div>
              <div className="mt-8 z-10">
                <span className="text-xs text-slate-400 block">อัตราการยกเลิก: {data.totalOrders > 0 ? ((data.cancelledOrdersCount / data.totalOrders) * 100).toFixed(1) : 0}%</span>
                <span className="text-3xl font-black text-slate-800 tracking-tight mt-1 block">{data.cancelledOrdersCount.toLocaleString()} <span className="text-xs font-semibold text-slate-500">รายการ</span></span>
              </div>
            </div>

          </div>

          {/* Monthly Sales Performance Chart */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-6">
              <TrendingUp size={18} className="text-blue-500" />
              แนวโน้มรายได้รายเดือน ประจำปี ค.ศ. {data.year}
            </h3>

            {/* Custom Responsive CSS Bar Chart */}
            <div className="h-64 flex items-end gap-2 sm:gap-4 md:gap-6 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
              {data.monthlyBreakdown.map((m, index) => {
                const percentHeight = m.revenue > 0 ? (m.revenue / maxMonthlyRevenue) * 90 : 2; // Keep min 2% for visual
                return (
                  <div key={index} className="flex-1 flex flex-col items-center min-w-[32px] group cursor-pointer">
                    {/* Tooltip on Hover */}
                    <div className="absolute mb-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-md">
                      ฿{m.revenue.toLocaleString()} ({m.ordersCount} บิล)
                    </div>
                    {/* Bar */}
                    <div 
                      style={{ height: `${percentHeight}%` }}
                      className="w-full bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-xl transition-all duration-500 group-hover:from-blue-600 group-hover:to-indigo-700 shadow-inner"
                    ></div>
                    {/* Month Text Label */}
                    <span className="text-[10px] font-bold text-slate-500 mt-2 block tracking-tight">{m.month}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Chart Legend */}
            <div className="flex justify-between items-center mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>มกราคม (ม.ค.)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-600"></span> ยอดขายรายเดือน (บาท)</span>
              <span>ธันวาคม (ธ.ค.)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Top Selling Items (Left Columns) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm lg:col-span-8">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
                <Award size={18} className="text-amber-500" />
                อันดับเมนูขายดีประจำปี (Top Items)
              </h3>
              
              {data.topItems.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  ไม่มีประวัติการจำหน่ายสินค้าในปีนี้
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 text-center w-12">อันดับ</th>
                        <th className="pb-3">รายการอาหาร</th>
                        <th className="pb-3 text-center">หมวดหมู่</th>
                        <th className="pb-3 text-center">จำนวนที่ขาย</th>
                        <th className="pb-3 text-right">ยอดรวม (บาท)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.topItems.slice(0, 5).map((item, idx) => {
                        const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
                        return (
                          <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 text-center font-black text-slate-700">
                              {medal || `${idx + 1}`}
                            </td>
                            <td className="py-3 font-semibold text-slate-800 text-sm">{item.name}</td>
                            <td className="py-3 text-center">
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{item.category}</span>
                            </td>
                            <td className="py-3 text-center font-bold text-slate-600 text-sm">{item.quantity.toLocaleString()}</td>
                            <td className="py-3 text-right font-black text-slate-800 text-sm">฿{item.revenue.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Category & Tables Breakdown (Right Columns) */}
            <div className="space-y-6 lg:col-span-4">
              
              {/* Category Share */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <UtensilsCrossed size={18} className="text-indigo-500" />
                  สัดส่วนยอดขายตามหมวดหมู่
                </h3>
                
                {data.categoriesBreakdown.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    ไม่มีสถิติหมวดหมู่ในปีนี้
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {data.categoriesBreakdown.map((cat, idx) => {
                      const sharePercentage = data.totalRevenue > 0 ? (cat.revenue / data.totalRevenue) * 100 : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{cat.name}</span>
                            <span>{sharePercentage.toFixed(0)}% (฿{cat.revenue.toLocaleString()})</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${sharePercentage}%` }} 
                              className={`h-full rounded-full bg-gradient-to-r ${
                                idx === 0 ? "from-blue-500 to-indigo-500" :
                                idx === 1 ? "from-emerald-500 to-teal-500" :
                                "from-purple-500 to-pink-500"
                              }`}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Table Performance */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Grid size={18} className="text-emerald-500" />
                  ยอดการเรียกเก็บเงินของโต๊ะ
                </h3>
                
                {data.tablesBreakdown.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    ไม่มีสถิติยอดบิลตามโต๊ะ
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto no-scrollbar space-y-2.5 pr-1">
                    {data.tablesBreakdown.map((table, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50/60 p-2.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-black text-xs">
                            {table.tableNumber}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">โต๊ะที่ {table.tableNumber}</span>
                            <span className="text-[10px] text-slate-400 block">{table.ordersCount} บิลเสร็จสิ้น</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-800">฿{table.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </>
      ) : (
        <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-400 text-sm">
          ไม่สามารถดึงข้อมูลรายงานประจำปีได้
        </div>
      )}
    </div>
  );
}
