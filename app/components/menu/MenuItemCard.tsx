"use client";

import { useState } from "react";
import Image from "next/image";
import { Utensils, Trash2 } from "lucide-react";

interface MenuItemCardProps {
  item: any;
  totalQuantityInCart: number;
  onOpenOptions: (item: any) => void;
  onRemoveAllOfItem: (itemId: string) => void;
}

export function MenuItemCard({ item, totalQuantityInCart, onOpenOptions, onRemoveAllOfItem }: MenuItemCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="card-base flex gap-4 hover:shadow-md transition-shadow">
      <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-inner flex items-center justify-center">
        {item.image && !imgError ? (
          <Image 
            src={item.image} 
            alt={item.name} 
            fill
            sizes="96px"
            className="object-cover" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-150 to-slate-200 flex items-center justify-center">
            <Utensils className="text-slate-400" size={32} />
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-slate-900 line-clamp-1">{item.name}</h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="font-semibold text-blue-700">฿{item.price}</span>

          <div className="flex items-center gap-2">
            {totalQuantityInCart > 0 && (
              <button
                onClick={() => onRemoveAllOfItem(item.id || item._id)}
                className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-all p-2 rounded-full active:scale-90 flex items-center justify-center border border-rose-100"
                title="ล้างรายการนี้ออกจากตะกร้า"
              >
                <Trash2 size={15} />
              </button>
            )}
            {totalQuantityInCart > 0 && (
              <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs animate-pulse">
                {totalQuantityInCart}
              </span>
            )}
            <button
              onClick={() => onOpenOptions(item)}
              className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium active:scale-95"
            >
              เพิ่ม
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
