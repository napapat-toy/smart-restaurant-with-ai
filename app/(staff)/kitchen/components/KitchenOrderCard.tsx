import { Clock, ChefHat, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/app/components/ui/StatusBadge";

interface KitchenOrderCardProps {
  order: any;
  timeAgo: (date: Date) => string;
  handleUpdateStatus: (orderId: string, status: string) => void | Promise<void>;
}

export function KitchenOrderCard({ order, timeAgo, handleUpdateStatus }: KitchenOrderCardProps) {
  return (
    <div className={`kitchen-order-card ${order.status === 'Pending' ? 'is-pending' : 'is-cooking'}`}>
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
          <div key={idx} className="kitchen-item-box">
            <div className="kitchen-item-qty">
              {item.quantity}x
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-lg leading-tight">{item.name}</p>
              {item.note && (
                <p className="kitchen-item-note">
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
            className="btn-kitchen-cooking"
          >
            <ChefHat size={20} />
            เริ่มปรุงอาหาร
          </button>
        ) : (
          <button
            onClick={() => handleUpdateStatus(order.id, 'Served')}
            className="btn-kitchen-served"
          >
            <CheckCircle size={20} />
            เสร็จสิ้น / พร้อมเสิร์ฟ
          </button>
        )}
      </div>
    </div>
  );
}
