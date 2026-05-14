import { Minus, Plus } from "lucide-react";

interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  variant?: "blue" | "slate";
}

export function QuantityControl({ quantity, onDecrease, onIncrease, variant = "blue" }: QuantityControlProps) {
  const isSlate = variant === "slate";
  return (
    <div className={`flex items-center gap-3 rounded-full px-1.5 py-1.5 border ${isSlate ? "bg-slate-50 border-slate-200" : "bg-blue-50 border-blue-100"}`}>
      <button onClick={onDecrease} className={`w-7 h-7 flex items-center justify-center rounded-full shadow-sm active:scale-95 transition-transform bg-white ${isSlate ? "text-slate-600" : "text-blue-600"}`}>
        <Minus size={14} strokeWidth={3} />
      </button>
      <span className="w-4 text-center font-medium text-slate-700 text-sm">{quantity}</span>
      <button onClick={onIncrease} className={`w-7 h-7 flex items-center justify-center rounded-full shadow-sm active:scale-95 transition-transform ${isSlate ? "bg-slate-900 text-white" : "bg-blue-600 text-white"}`}>
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
  );
}
