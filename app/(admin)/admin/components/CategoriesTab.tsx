import React from "react";
import { Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

interface CategoriesTabProps {
  categories: any[];
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  isLoading: boolean;
  onAddCategory: (e: React.FormEvent) => void;
  onMoveCategory: (index: number, direction: "up" | "down") => void;
  onDeleteCategory: (id: string) => void;
}

export function CategoriesTab({
  categories,
  newCategoryName,
  setNewCategoryName,
  isLoading,
  onAddCategory,
  onMoveCategory,
  onDeleteCategory
}: CategoriesTabProps) {
  return (
    <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">จัดการหมวดหมู่เมนูอาหาร</h2>
        <p className="text-slate-500 mt-1">เพิ่ม ลบ หรือจัดเรียงหมวดหมู่ที่จะแสดงในหน้าต่างลูกค้า</p>
      </div>

      {/* Add Category Form */}
      <form onSubmit={onAddCategory} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 flex gap-3">
        <input
          type="text"
          required
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="ชื่อหมวดหมู่ใหม่ เช่น ของหวาน"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-sm"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 text-sm"
        >
          <Plus size={18} />
          เพิ่ม
        </button>
      </form>

      {/* Categories List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {categories && categories.length === 0 ? (
          <div className="p-8 text-center text-slate-400">ยังไม่มีหมวดหมู่ กรุณาเพิ่มหมวดหมู่ใหม่</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories?.map((cat: any, index: number) => (
              <div key={cat._id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                <div>
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Sort Up */}
                  <button
                    type="button"
                    onClick={() => onMoveCategory(index, "up")}
                    disabled={index === 0}
                    className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30 hover:bg-blue-50 rounded-lg transition-colors"
                    title="เลื่อนขึ้น"
                  >
                    <ArrowUp size={16} />
                  </button>
                  {/* Sort Down */}
                  <button
                    type="button"
                    onClick={() => onMoveCategory(index, "down")}
                    disabled={index === categories.length - 1}
                    className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30 hover:bg-blue-50 rounded-lg transition-colors"
                    title="เลื่อนลง"
                  >
                    <ArrowDown size={16} />
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat._id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
