"use client";

import { useState } from "react";
import { generateNewPins, toggleMenuItemStatus, deleteMenuItem, generateTableToken, addTable, addMenuItem, updateMenuItem } from "@/app/actions/admin";
import { Lock, Utensils, Grid, RefreshCw, Power, Plus, Trash2, ShieldCheck, FileKey2, X, Pencil } from "lucide-react";
import { logoutStaff } from "@/app/actions/auth";
import Image from "next/image";

export default function AdminClient({ initialData }: { initialData: any }) {
  const [activeTab, setActiveTab] = useState<"pins" | "menu" | "tables">("pins");
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [newMenu, setNewMenu] = useState({
    name: "",
    description: "",
    price: "",
    category: "อาหารคาว",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    isAvailable: true
  });

  const handleGeneratePins = async () => {
    if (!confirm("ต้องการสร้างรหัส PIN ใหม่ใช่หรือไม่? (พนักงานเดิมจะต้องใช้รหัสใหม่)")) return;
    setIsLoading(true);
    await generateNewPins();
    window.location.reload();
  };

  const handleToggleMenu = async (id: string, currentStatus: boolean) => {
    await toggleMenuItemStatus(id, !currentStatus);
    setData((prev: any) => ({
      ...prev,
      menuItems: prev.menuItems.map((m: any) => m._id === id ? { ...m, isAvailable: !currentStatus } : m)
    }));
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm("ยืนยันการลบเมนูนี้?")) return;
    await deleteMenuItem(id);
    setData((prev: any) => ({
      ...prev,
      menuItems: prev.menuItems.filter((m: any) => m._id !== id)
    }));
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const menuData = {
      ...newMenu,
      price: parseFloat(newMenu.price)
    };
    
    if (editingMenuId) {
      await updateMenuItem(editingMenuId, menuData);
    } else {
      await addMenuItem(menuData);
    }
    
    setIsAddMenuModalOpen(false);
    setEditingMenuId(null);
    setNewMenu({ name: "", description: "", price: "", category: "อาหารคาว", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", isAvailable: true });
    window.location.reload();
  };

  const handleOpenEditMenu = (menu: any) => {
    setEditingMenuId(menu._id);
    setNewMenu({
      name: menu.name,
      description: menu.description || "",
      price: menu.price.toString(),
      category: menu.category,
      image: menu.image,
      isAvailable: menu.isAvailable
    });
    setIsAddMenuModalOpen(true);
  };

  const handleAddTable = async () => {
    const num = prompt("ระบุหมายเลขโต๊ะใหม่ (เช่น 11):");
    if (!num) return;
    setIsLoading(true);
    const res = await addTable(num);
    if (res?.error) alert(res.error);
    window.location.reload();
  };

  const handleResetToken = async (id: string) => {
    if (!confirm("การรีเซ็ต Token จะทำให้ QR Code เดิมของโต๊ะนี้ใช้งานไม่ได้ ต้องพิมพ์ QR Code ใหม่ ยืนยันหรือไม่?")) return;
    setIsLoading(true);
    await generateTableToken(id);
    window.location.reload();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side compression to prevent MongoDB from bloating
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to Base64 JPEG (Quality 0.8) - Usually ~100-200KB
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setNewMenu({ ...newMenu, image: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-blue-400" />
            <span className="hidden md:inline">Admin Panel</span>
            <span className="md:hidden">Admin</span>
          </h1>
          <button onClick={() => logoutStaff()} className="md:hidden p-2 bg-slate-800 hover:bg-rose-600 text-white rounded-lg transition-colors">
            <Power size={20} />
          </button>
        </div>
        <nav className="flex-row md:flex-col overflow-x-auto md:overflow-visible flex-1 p-2 md:p-4 gap-2 flex md:space-y-2 no-scrollbar">
          <button 
            onClick={() => setActiveTab("pins")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "pins" ? "bg-blue-600" : "hover:bg-slate-800 text-slate-300"}`}
          >
            <Lock size={20} /> รหัสพนักงาน (PIN)
          </button>
          <button 
            onClick={() => setActiveTab("menu")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "menu" ? "bg-blue-600" : "hover:bg-slate-800 text-slate-300"}`}
          >
            <Utensils size={20} /> จัดการเมนูอาหาร
          </button>
          <button 
            onClick={() => setActiveTab("tables")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "tables" ? "bg-blue-600" : "hover:bg-slate-800 text-slate-300"}`}
          >
            <Grid size={20} className="shrink-0" /> <span className="whitespace-nowrap">โต๊ะ & QR</span>
          </button>
        </nav>
        <div className="hidden md:block p-4 border-t border-slate-800">
          <button onClick={() => logoutStaff()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-rose-600 text-white rounded-xl transition-colors">
            <Power size={20} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* PINS TAB */}
        {activeTab === "pins" && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">รหัส PIN พนักงานประจำวัน</h2>
              <p className="text-slate-500 mt-1">ใช้สำหรับให้พนักงานเข้าสู่ระบบแคชเชียร์และห้องครัว (ควรสุ่มใหม่ทุกวัน)</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 font-medium mb-2">รหัส Cashier (แคชเชียร์)</h3>
                <div className="text-4xl font-bold text-slate-900 tracking-widest bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  {data.settings?.cashierPin || "----"}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 font-medium mb-2">รหัส Kitchen (ห้องครัว)</h3>
                <div className="text-4xl font-bold text-slate-900 tracking-widest bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  {data.settings?.kitchenPin || "----"}
                </div>
              </div>
            </div>

            <button 
              onClick={handleGeneratePins}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
              สุ่มรหัส PIN ใหม่ทันที
            </button>
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === "menu" && (
          <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">จัดการเมนูอาหาร</h2>
                <p className="text-slate-500 mt-1">เปิด/ปิด เมนูที่หมด หรือลบเมนู</p>
              </div>
              <button 
                onClick={() => {
                  setEditingMenuId(null);
                  setNewMenu({ name: "", description: "", price: "", category: "อาหารคาว", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", isAvailable: true });
                  setIsAddMenuModalOpen(true);
                }}
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
                  {data.menuItems.map((item: any) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-slate-200">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-900">{item.name}</td>
                      <td className="p-4 text-slate-500">{item.category}</td>
                      <td className="p-4 text-slate-900">฿{item.price}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleToggleMenu(item._id, item.isAvailable)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${item.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {item.isAvailable ? "มีขาย" : "หมดชั่วคราว"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenEditMenu(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDeleteMenu(item._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
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
        )}

        {/* TABLES TAB */}
        {activeTab === "tables" && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">จัดการโต๊ะและลิงก์ QR</h2>
                <p className="text-slate-500 mt-1">รีเซ็ต Token เพื่อป้องกันคนนำลิงก์เก่ามาสั่งอาหารแกล้ง</p>
              </div>
              <button onClick={handleAddTable} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
                <Plus size={20} /> เพิ่มโต๊ะใหม่
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.tables.map((table: any) => (
                <div key={table._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl text-xl font-bold">
                      {table.tableNumber}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${table.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {table.status}
                    </span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-2 font-mono break-all">{table.token}</p>
                    <button 
                      onClick={() => handleResetToken(table._id)}
                      className="w-full flex justify-center items-center gap-2 text-sm text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 py-2 rounded-lg transition-colors"
                    >
                      <FileKey2 size={16} /> รีเซ็ต Token (ลิงก์ QR)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Add Menu Modal */}
      {isAddMenuModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative max-h-[95vh] overflow-y-auto no-scrollbar">
            <button 
              onClick={() => setIsAddMenuModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{editingMenuId ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}</h2>
            
            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อเมนู</label>
                <input 
                  type="text" 
                  required
                  value={newMenu.name}
                  onChange={(e) => setNewMenu({...newMenu, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  placeholder="เช่น ข้าวผัดกะเพราหมูสับ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่</label>
                <select 
                  value={newMenu.category}
                  onChange={(e) => setNewMenu({...newMenu, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                >
                  <option value="อาหารคาว">อาหารคาว</option>
                  <option value="อาหารทานเล่น">อาหารทานเล่น</option>
                  <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                  <option value="ของหวาน">ของหวาน</option>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  placeholder="เช่น 60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย (ถ้ามี)</label>
                <textarea 
                  value={newMenu.description}
                  onChange={(e) => setNewMenu({...newMenu, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none h-20"
                  placeholder="เช่น รสชาติจัดจ้าน เผ็ดกำลังดี"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รูปภาพเมนู</label>
                
                {/* Upload from Mobile / Computer */}
                <div className="mb-3 relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
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
                {newMenu.image && (
                  <div className="mt-4 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={newMenu.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
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
      )}
    </div>
  );
}
