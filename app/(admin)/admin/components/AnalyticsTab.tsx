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
  RefreshCw,
  Zap,
  Download,
  Activity,
  Users
} from "lucide-react";
import { getAnnualAnalytics, getTodayAnalytics, AnnualAnalyticsResult, TodayAnalyticsResult } from "@/app/actions/analytics";
import { learnPairingsFromOrders, getLearnedPairingsStatus } from "@/app/actions/recommendations";
import { formatPrice } from "@/lib/utils";


export function AnalyticsTab() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [data, setData] = useState<AnnualAnalyticsResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Today's Live Dashboard State
  const [todayData, setTodayData] = useState<TodayAnalyticsResult | null>(null);
  const [isTodayLoading, setIsTodayLoading] = useState(true);
  const [recsStatus, setRecsStatus] = useState<{ pairsLearned: number; updatedAt: string | null } | null>(null);
  const [isLearning, setIsLearning] = useState(false);

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

  const fetchTodayAnalytics = async () => {
    try {
      const res = await getTodayAnalytics();
      setTodayData(res);
      const status = await getLearnedPairingsStatus();
      setRecsStatus(status);
    } catch (error) {
      console.error("Failed to load today analytics:", error);
    } finally {
      setIsTodayLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    fetchTodayAnalytics();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchTodayAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLearnPairings = async () => {
    setIsLearning(true);
    try {
      const res = await learnPairingsFromOrders();
      setRecsStatus(res);
      alert(`อัปเดตกฎการแนะนำอาหารเสร็จสิ้น! เรียนรู้คู่เมนูใหม่ได้ทั้งหมด ${res.pairsLearned} รายการ`);
    } catch (error) {
      console.error("Failed to learn pairings:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตกฎการแนะนำอาหาร");
    } finally {
      setIsLearning(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    
    // Generate CSV for annual sales monthly breakdown
    let csvContent = "\ufeff"; // BOM for UTF-8 Excel support
    csvContent += "เดือน,ยอดขายทั้งหมด (บาท),จำนวนบิล,ยอดเฉลี่ยต่อบิล (บาท)\n";
    
    data.monthlyBreakdown.forEach(m => {
      csvContent += `"${m.month}",${m.revenue},${m.ordersCount},${m.ordersCount > 0 ? (m.revenue / m.ordersCount).toFixed(2) : 0}\n`;
    });
    
    csvContent += "\nรายการยอดนิยม,จำนวนที่ขายได้ (จาน)\n";
    data.topItems.forEach(item => {
      csvContent += `"${item.name}",${item.quantity}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find max monthly revenue to scale the custom CSS chart bar heights
  const maxMonthlyRevenue = data?.monthlyBreakdown 
    ? Math.max(...data.monthlyBreakdown.map(m => m.revenue), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Live Today's Dashboard Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Live Today</span>
        </div>

        <h3 className="text-lg font-extrabold flex items-center gap-2 mb-6">
          <Activity className="text-emerald-400" size={20} />
          ภาพรวมของร้านวันนี้
        </h3>

        {isTodayLoading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mr-2"></div>
            <span className="text-xs">กำลังคำนวณข้อมูลวันนี้...</span>
          </div>
        ) : todayData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
              <span className="text-slate-500 text-[10px] font-bold block uppercase">ยอดขายวันนี้</span>
              <span className="text-2xl font-black text-emerald-400 block mt-1">{formatPrice(todayData.totalRevenue)}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
              <span className="text-slate-500 text-[10px] font-bold block uppercase">จำนวนออเดอร์</span>
              <span className="text-2xl font-black text-white block mt-1">{todayData.totalOrders} ออเดอร์</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
              <span className="text-slate-500 text-[10px] font-bold block uppercase">โต๊ะที่สั่งอาหารอยู่</span>
              <span className="text-2xl font-black text-amber-400 block mt-1">{todayData.activeTables} โต๊ะ</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
              <span className="text-slate-500 text-[10px] font-bold block uppercase">ออเดอร์กำลังปรุง</span>
              <span className="text-2xl font-black text-blue-400 block mt-1">{todayData.activeOrders} รายการ</span>
            </div>
          </div>
        ) : null}

        {todayData && todayData.topItems.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/60 flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">เมนูฮิตวันนี้:</span>
            <div className="flex flex-wrap gap-2">
              {todayData.topItems.map((item, idx) => (
                <span key={idx} className="bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full text-slate-300 font-medium">
                  🔥 {item.name} ({item.quantity})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-blue-600" />
            รายงานยอดขาย & สถิติประจำปี
          </h2>
          <p className="text-xs text-slate-500 mt-1">วิเคราะห์ยอดขาย แนวโน้มความนิยม และการทำงานรายปีของห้องอาหาร</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Export and Learn buttons */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95 text-xs font-bold rounded-2xl transition-all shadow-sm border border-blue-100/50"
            title="ส่งออกรายงานยอดขายเป็น CSV สำหรับเปิดใน Excel"
          >
            <Download size={14} />
            Export CSV
          </button>

          <button 
            onClick={handleLearnPairings}
            disabled={isLearning}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 active:scale-95 text-xs font-bold rounded-2xl transition-all disabled:opacity-50 border border-amber-100/50"
            title="วิเคราะห์ข้อมูลออเดอร์ในระบบเพื่อปรับปรุงการแนะนำคู่เมนูแบบเรียลไทม์"
          >
            <Zap size={14} className={isLearning ? "animate-pulse text-amber-500" : ""} />
            {isLearning ? "กำลังวิเคราะห์..." : "อัปเดตกฎการแนะนำ"}
          </button>

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
            onClick={() => {
              fetchAnalytics(selectedYear);
              fetchTodayAnalytics();
            }}
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
                <span className="text-3xl font-black tracking-tight mt-1 block">{formatPrice(data.totalRevenue)}</span>
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
                <span className="text-3xl font-black text-slate-800 tracking-tight mt-1 block">{formatPrice(data.averageOrderValue)}</span>
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
                      {formatPrice(m.revenue)} ({m.ordersCount} บิล)
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
                            <td className="py-3 text-right font-black text-slate-800 text-sm">{formatPrice(item.revenue)}</td>
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
                             <span>{sharePercentage.toFixed(0)}% ({formatPrice(cat.revenue)})</span>
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
                         <span className="text-xs font-black text-slate-800">{formatPrice(table.revenue)}</span>
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
