"use client";

import React from "react";
import Image from "next/image";
import { X, Plus, Trash2 } from "lucide-react";

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMenuId: string | null;
  newMenu: any;
  setNewMenu: (val: any) => void;
  categories: any[];
  isLoading: boolean;
  onSaveMenu: (e: React.FormEvent) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddOptionGroup: () => void;
  onRemoveOptionGroup: (index: number) => void;
  onUpdateOptionGroup: (index: number, fields: any) => void;
  onAddChoice: (groupIndex: number) => void;
  onRemoveChoice: (groupIndex: number, choiceIndex: number) => void;
  onUpdateChoice: (groupIndex: number, choiceIndex: number, fields: any) => void;
}

export function MenuItemModal({
  isOpen,
  onClose,
  editingMenuId,
  newMenu,
  setNewMenu,
  categories,
  isLoading,
  onSaveMenu,
  onImageUpload,
  onAddOptionGroup,
  onRemoveOptionGroup,
  onUpdateOptionGroup,
  onAddChoice,
  onRemoveChoice,
  onUpdateChoice
}: MenuItemModalProps) {
  const [previewError, setPreviewError] = React.useState(false);

  React.useEffect(() => {
    setPreviewError(false);
  }, [newMenu.image, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative max-h-[95vh] overflow-y-auto no-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-6">{editingMenuId ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}</h2>
        
        <form onSubmit={onSaveMenu} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อเมนู</label>
            <input 
              type="text" 
              required
              value={newMenu.name}
              onChange={(e) => setNewMenu({...newMenu, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-sm"
              placeholder="เช่น ข้าวผัดกะเพราหมูสับ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่</label>
            <select 
              value={newMenu.category}
              onChange={(e) => setNewMenu({...newMenu, category: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-sm"
            >
              {categories && categories.length > 0 ? (
                categories.map((c: any) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))
              ) : (
                <>
                  <option value="อาหารคาว">อาหารคาว</option>
                  <option value="อาหารทานเล่น">อาหารทานเล่น</option>
                  <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                  <option value="ของหวาน">ของหวาน</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ราคา (บาท)</label>
            <input 
              type="number" 
              required
              min="0"
              value={newMenu.price}
              onChange={(e) => setNewMenu({...newMenu, price: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-sm"
              placeholder="เช่น 60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย (ถ้ามี)</label>
            <textarea 
              value={newMenu.description}
              onChange={(e) => setNewMenu({...newMenu, description: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none h-20 text-sm"
              placeholder="เช่น รสชาติจัดจ้าน เผ็ดกำลังดี"
            ></textarea>
          </div>
          {/* Options Customizer Section */}
          <div className="border-t border-slate-100 pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="block text-sm font-bold text-slate-800">ตัวเลือกเพิ่มเติม (Options)</span>
              <button
                type="button"
                onClick={onAddOptionGroup}
                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus size={14} /> เพิ่มกลุ่มตัวเลือก
              </button>
            </div>

            <div className="space-y-4">
              {newMenu.options && newMenu.options.map((group: any, groupIndex: number) => (
                <div key={groupIndex} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3">
                  <button
                    type="button"
                    onClick={() => onRemoveOptionGroup(groupIndex)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                    title="ลบกลุ่มตัวเลือก"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ชื่อกลุ่มตัวเลือก (เช่น ความเผ็ด, เครื่องเคียง)</label>
                    <input
                      type="text"
                      required
                      value={group.name}
                      onChange={(e) => onUpdateOptionGroup(groupIndex, { name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-sm"
                      placeholder="เช่น ความเผ็ด, เลือกเครื่องเคียง"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={group.required}
                        onChange={(e) => onUpdateOptionGroup(groupIndex, { required: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      ลูกค้าจำเป็นต้องเลือก
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={group.allowMultiple}
                        onChange={(e) => onUpdateOptionGroup(groupIndex, { allowMultiple: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      เลือกได้หลายชิ้น
                    </label>
                  </div>

                  {/* Option Choices */}
                  <div className="space-y-2 border-t border-slate-200/60 pt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-500">รายการย่อย (Choices)</span>
                      <button
                        type="button"
                        onClick={() => onAddChoice(groupIndex)}
                        className="text-[10px] bg-slate-200/80 text-slate-700 hover:bg-slate-300 px-2 py-1 rounded font-semibold transition-colors"
                      >
                        + เพิ่มรายการย่อย
                      </button>
                    </div>

                    {group.choices.map((choice: any, choiceIndex: number) => (
                      <div key={choiceIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={choice.name}
                          onChange={(e) => onUpdateChoice(groupIndex, choiceIndex, { name: e.target.value })}
                          placeholder="ชื่อ เช่น ไข่ดาว, เผ็ดมาก"
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-xs"
                        />
                        <input
                          type="number"
                          required
                          value={choice.priceDelta}
                          onChange={(e) => onUpdateChoice(groupIndex, choiceIndex, { priceDelta: parseFloat(e.target.value) || 0 })}
                          placeholder="+ ราคา (เช่น 10)"
                          className="w-24 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-xs text-right"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveChoice(groupIndex, choiceIndex)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                          title="ลบ"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Image Section */}
          <div className="border-t border-slate-100 pt-4 mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">รูปภาพเมนู</label>
            
            {/* Upload from Mobile / Computer */}
            <div className="mb-3 relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={onImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full bg-blue-50 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl px-4 py-4 text-center transition-colors">
                <p className="text-blue-600 font-medium text-sm flex items-center justify-center gap-2">
                  <Plus size={18} /> อัปโหลดรูปจากมือถือ/เครื่อง
                </p>
                <p className="text-xs text-slate-400 mt-1">ระบบจะบีบอัดรูปให้อัตโนมัติ</p>
              </div>
            </div>

            <div className="flex items-center gap-4 my-3">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-400 font-medium uppercase">หรือวางลิงก์รูปภาพ (URL)</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <input 
              type="url" 
              value={newMenu.image}
              onChange={(e) => setNewMenu({...newMenu, image: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-sm"
              placeholder="https://..."
            />
            
            {/* Image Preview */}
            {newMenu.image && !previewError ? (
              <div className="mt-4 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                <Image 
                  key={newMenu.image}
                  src={newMenu.image} 
                  alt="Preview" 
                  fill
                  unoptimized
                  className="object-cover" 
                  onError={() => setPreviewError(true)}
                />
              </div>
            ) : newMenu.image ? (
              <div className="mt-4 relative w-full h-32 rounded-xl overflow-hidden border border-rose-200 bg-rose-50/50 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-rose-600 font-bold text-xs">รูปภาพไม่สามารถโหลดได้</span>
                <span className="text-slate-400 text-[10px] mt-1">กรุณาตรวจสอบลิงก์รูปภาพของคุณ</span>
              </div>
            ) : null}
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-4 mt-6 transition-all"
          >
            {isLoading ? "กำลังบันทึก..." : editingMenuId ? "บันทึกการแก้ไข" : "บันทึกเมนูใหม่"}
          </button>
        </form>
      </div>
    </div>
  );
}
