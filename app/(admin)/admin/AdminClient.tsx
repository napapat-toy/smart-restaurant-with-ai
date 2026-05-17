"use client";

import { Lock, Utensils, Grid, Power, ShieldCheck, BarChart3 } from "lucide-react";
import { logoutStaff } from "@/app/actions/auth";
import { useAdmin } from "./hooks/useAdmin";

// Extracted Presenter Components
import { PinsTab } from "./components/PinsTab";
import { MenuTab } from "./components/MenuTab";
import { TablesTab } from "./components/TablesTab";
import { CategoriesTab } from "./components/CategoriesTab";
import { MenuItemModal } from "./components/MenuItemModal";
import { AnalyticsTab } from "./components/AnalyticsTab";

export default function AdminClient({ initialData }: { initialData: any }) {
  const {
    activeTab,
    data,
    isLoading,
    isAddMenuModalOpen,
    editingMenuId,
    newCategoryName,
    newMenu,
    setActiveTab,
    setIsAddMenuModalOpen,
    setEditingMenuId,
    setNewCategoryName,
    setNewMenu,
    handleGeneratePins,
    handleToggleMenu,
    handleDeleteMenu,
    handleSaveMenu,
    handleOpenEditMenu,
    handleAddTable,
    handleResetToken,
    handleAddOptionGroup,
    handleUpdateOptionGroup,
    handleRemoveOptionGroup,
    handleAddChoice,
    handleUpdateChoice,
    handleRemoveChoice,
    handleAddCategory,
    handleDeleteCategory,
    handleMoveCategory,
    handleImageUpload
  } = useAdmin({ initialData });

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
          <button 
            onClick={() => setActiveTab("categories")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "categories" ? "bg-blue-600" : "hover:bg-slate-800 text-slate-300"}`}
          >
            <Grid size={20} className="shrink-0" /> <span className="whitespace-nowrap">หมวดหมู่เมนู</span>
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "analytics" ? "bg-blue-600" : "hover:bg-slate-800 text-slate-300"}`}
          >
            <BarChart3 size={20} className="shrink-0" /> <span className="whitespace-nowrap">ยอดขาย & สถิติ</span>
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
          <PinsTab
            cashierPin={data.settings?.cashierPin}
            kitchenPin={data.settings?.kitchenPin}
            isLoading={isLoading}
            onGeneratePins={handleGeneratePins}
          />
        )}

        {/* MENU TAB */}
        {activeTab === "menu" && (
          <MenuTab
            menuItems={data.menuItems}
            onAddClick={() => {
              setEditingMenuId(null);
              setNewMenu({ name: "", description: "", price: "", category: data.categories?.[0]?.name || "อาหารคาว", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", isAvailable: true, options: [] });
              setIsAddMenuModalOpen(true);
            }}
            onToggleMenu={handleToggleMenu}
            onEditClick={handleOpenEditMenu}
            onDeleteMenu={handleDeleteMenu}
          />
        )}

        {/* TABLES TAB */}
        {activeTab === "tables" && (
          <TablesTab
            tables={data.tables}
            onAddTable={handleAddTable}
            onResetToken={handleResetToken}
          />
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <CategoriesTab
            categories={data.categories}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            isLoading={isLoading}
            onAddCategory={handleAddCategory}
            onMoveCategory={handleMoveCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <AnalyticsTab />
        )}

      </main>

      {/* Add Menu Modal */}
      <MenuItemModal
        isOpen={isAddMenuModalOpen}
        onClose={() => setIsAddMenuModalOpen(false)}
        editingMenuId={editingMenuId}
        newMenu={newMenu}
        setNewMenu={setNewMenu}
        categories={data.categories}
        isLoading={isLoading}
        onSaveMenu={handleSaveMenu}
        onImageUpload={handleImageUpload}
        onAddOptionGroup={handleAddOptionGroup}
        onRemoveOptionGroup={handleRemoveOptionGroup}
        onUpdateOptionGroup={handleUpdateOptionGroup}
        onAddChoice={handleAddChoice}
        onRemoveChoice={handleRemoveChoice}
        onUpdateChoice={handleUpdateChoice}
      />
    </div>
  );
}
