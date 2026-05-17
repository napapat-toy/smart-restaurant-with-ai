import { Clock, ChefHat, CheckCircle2 } from "lucide-react";
import { translateOrderStatus } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Pending" | "Cooking" | "Served" | "Paid" | "Cancelled" | "Ready";
  theme?: "light" | "dark";
}

export function StatusBadge({ status, theme = "light" }: StatusBadgeProps) {
  const isDark = theme === "dark";
  const info = translateOrderStatus(status);
  
  const darkClasses = {
    Pending: "bg-amber-500/20 text-amber-400",
    Cooking: "bg-blue-500/20 text-blue-400",
    Ready: "bg-purple-500/20 text-purple-400",
    Served: "bg-emerald-500/20 text-emerald-400",
    Paid: "bg-slate-500/20 text-slate-400",
    Cancelled: "bg-rose-500/20 text-rose-400",
  };

  const customClass = isDark 
    ? darkClasses[status] || "bg-slate-500/20 text-slate-400"
    : `${info.bgClass} ${info.colorClass} border ${info.borderClass}`;

  return (
    <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${customClass}`}>
      {status === 'Pending' && <Clock size={12} />}
      {status === 'Cooking' && <ChefHat size={12} />}
      {status === 'Served' && <CheckCircle2 size={12} />}
      {info.text}
    </div>
  );
}
