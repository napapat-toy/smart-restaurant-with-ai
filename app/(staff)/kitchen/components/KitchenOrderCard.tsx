import { Clock, ChefHat, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/app/components/ui/StatusBadge";

interface KitchenOrderCardProps {
  order: any;
  timeAgo: (date: Date) => string;
  handleUpdateStatus: (orderId: string, status: string) => Promise<void>;
}

export function KitchenOrderCard({ order, timeAgo, handleUpdateStatus }: KitchenOrderCardProps) {
  return (
    <div className={`rounded-2xl p-5 border-l-4 shadow-lg flex flex-col h-full transition-all
      ${order.status === 'Pending' ? 'bg-slate-800 border-amber-500 text-slate-200' : 'bg-slate-800 border-blue-500 text-slate-200'}
    `}>
      <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-3">
        <div>
          <h3 className="text-2xl font-bold text-white">โต๊ะ {order.tableId}</h3>
          <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
            <Clock size={14} /> {timeAgo(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} theme="dark" />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto mb-4 pr-2">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="bg-slate-700/50 p-3 rounded-xl flex gap-3">
            <div className="w-8 h-8 shrink-0 bg-slate-600 text-white rounded-lg flex items-center justify-center font-bold">
              {item.quantity}x
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-lg leading-tight">{item.name}</p>
              {item.note && (
                <p className="text-amber-400 text-sm mt-1 bg-amber-400/10 inline-block px-2 py-0.5 rounded-md font-medium">
                  * {item.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto shrink-0 pt-3 border-t border-slate-700">
        {order.status === 'Pending' ? (
          <button
            onClick={() => handleUpdateStatus(order.id, 'Cooking')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/50"
          >
            <ChefHat size={20} />
            เริ่มปรุงอาหาร
          </button>
        ) : (
          <button
            onClick={() => handleUpdateStatus(order.id, 'Served')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/50"
          >
            <CheckCircle size={20} />
            เสร็จสิ้น / พร้อมเสิร์ฟ
          </button>
        )}
      </div>
    </div>
  );
}
