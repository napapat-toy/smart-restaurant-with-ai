import { RefreshCw } from "lucide-react";

interface PinsTabProps {
  cashierPin: string | null;
  kitchenPin: string | null;
  isLoading: boolean;
  onGeneratePins: () => void;
}

export function PinsTab({ cashierPin, kitchenPin, isLoading, onGeneratePins }: PinsTabProps) {
  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">รหัส PIN พนักงานประจำวัน</h2>
        <p className="text-slate-500 mt-1">ใช้สำหรับให้พนักงานเข้าสู่ระบบแคชเชียร์และห้องครัว (ควรสุ่มใหม่ทุกวัน)</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 font-medium mb-2">รหัส Cashier (แคชเชียร์)</h3>
          <div className="text-4xl font-bold text-slate-900 tracking-widest bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
            {cashierPin || "----"}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 font-medium mb-2">รหัส Kitchen (ห้องครัว)</h3>
          <div className="text-4xl font-bold text-slate-900 tracking-widest bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
            {kitchenPin || "----"}
          </div>
        </div>
      </div>

      <button 
        onClick={onGeneratePins}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
      >
        <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        สุ่มรหัส PIN ใหม่ทันที
      </button>
    </div>
  );
}
