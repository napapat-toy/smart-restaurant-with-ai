import { Clock, ChefHat, CheckCircle2 } from "lucide-react";
import { Order } from "@/data/mockDb";

interface StatusBadgeProps {
  status: Order['status'];
  theme?: "light" | "dark";
}

export function StatusBadge({ status, theme = "light" }: StatusBadgeProps) {
  const isDark = theme === "dark";
  
  const styles = {
    Pending: isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700 border border-amber-200",
    Cooking: isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700 border border-blue-200",
    Served: isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Paid: isDark ? "bg-slate-500/20 text-slate-400" : "bg-slate-100 text-slate-600 border border-slate-200",
    Cancelled: isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-700 border border-rose-200",
  };

  const labels = {
    Pending: "รอรับออเดอร์",
    Cooking: "กำลังปรุง",
    Served: "เสิร์ฟแล้ว",
    Paid: "ชำระเงินแล้ว",
    Cancelled: "ยกเลิก",
  };

  return (
    <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${styles[status]}`}>
      {status === 'Pending' && <Clock size={12} />}
      {status === 'Cooking' && <ChefHat size={12} />}
      {status === 'Served' && <CheckCircle2 size={12} />}
      {labels[status]}
    </div>
  );
}
