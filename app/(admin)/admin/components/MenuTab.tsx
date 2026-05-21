"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Utensils } from "lucide-react";
import { formatPrice } from "@/lib/utils";


function AdminMenuImage({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
      {src && !imgError ? (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover" 
          onError={() => setImgError(true)}
        />
      ) : (
        <Utensils className="text-slate-400" size={18} />
      )}
    </div>
  );
}

interface MenuTabProps {
  menuItems: any[];
  onAddClick: () => void;
  onToggleMenu: (id: string, isAvailable: boolean) => void;
  onEditClick: (item: any) => void;
  onDeleteMenu: (id: string) => void;
}

export function MenuTab({
  menuItems,
  onAddClick,
  onToggleMenu,
  onEditClick,
  onDeleteMenu
}: MenuTabProps) {
  return (
    <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">จัดการเมนูอาหาร</h2>
          <p className="text-slate-500 mt-1">เปิด/ปิด เมนูที่หมด หรือลบเมนู</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} /> เพิ่มเมนูใหม่
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-medium text-slate-600">รูปภาพ</th>
              <th className="p-4 font-medium text-slate-600">ชื่อเมนู</th>
              <th className="p-4 font-medium text-slate-600">หมวดหมู่</th>
              <th className="p-4 font-medium text-slate-600">ราคา</th>
              <th className="p-4 font-medium text-slate-600">สถานะ</th>
              <th className="p-4 font-medium text-slate-600 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {menuItems.map((item: any) => (
              <tr key={item._id} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <AdminMenuImage src={item.image} alt={item.name} />
                </td>
                <td className="p-4 font-medium text-slate-900">{item.name}</td>
                <td className="p-4 text-slate-500">{item.category}</td>
                <td className="p-4 text-slate-900">{formatPrice(item.price)}</td>
                <td className="p-4">
                  <button 
                    onClick={() => onToggleMenu(item._id, item.isAvailable)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${item.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {item.isAvailable ? "มีขาย" : "หมดชั่วคราว"}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEditClick(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => onDeleteMenu(item._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
