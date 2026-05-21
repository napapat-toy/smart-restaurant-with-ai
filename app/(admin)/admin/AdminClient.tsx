"use client";

import { Lock, Utensils, Grid, Power, ShieldCheck, BarChart3, Ticket, History } from "lucide-react";
import { logoutStaff } from "@/app/actions/auth";
import { useAdmin } from "./hooks/useAdmin";

// Extracted Presenter Components
import { PinsTab } from "./components/PinsTab";
import { MenuTab } from "./components/MenuTab";
import { TablesTab } from "./components/TablesTab";
import { CategoriesTab } from "./components/CategoriesTab";
import { MenuItemModal } from "./components/MenuItemModal";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { DiscountsTab } from "./components/DiscountsTab";
import OrderHistoryTab from "./components/OrderHistoryTab";

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
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
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
        <nav className="admin-nav no-scrollbar">
          <button 
            onClick={() => setActiveTab("pins")}
            className={`admin-nav-item ${activeTab === "pins" ? "is-active" : ""}`}
          >
            <Lock size={20} /> รหัสพนักงาน (PIN)
          </button>
          <button 
            onClick={() => setActiveTab("menu")}
            className={`admin-nav-item ${activeTab === "menu" ? "is-active" : ""}`}
          >
            <Utensils size={20} /> จัดการเมนูอาหาร
          </button>
          <button 
            onClick={() => setActiveTab("tables")}
            className={`admin-nav-item ${activeTab === "tables" ? "is-active" : ""}`}
          >
            <Grid size={20} className="shrink-0" /> <span className="whitespace-nowrap">โต๊ะ & QR</span>
          </button>
          <button 
            onClick={() => setActiveTab("categories")}
            className={`admin-nav-item ${activeTab === "categories" ? "is-active" : ""}`}
          >
            <Grid size={20} className="shrink-0" /> <span className="whitespace-nowrap">หมวดหมู่เมนู</span>
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`admin-nav-item ${activeTab === "analytics" ? "is-active" : ""}`}
          >
            <BarChart3 size={20} className="shrink-0" /> <span className="whitespace-nowrap">ยอดขาย & สถิติ</span>
          </button>
          <button 
            onClick={() => setActiveTab("discounts")}
            className={`admin-nav-item ${activeTab === "discounts" ? "is-active" : ""}`}
          >
            <Ticket size={20} className="shrink-0" /> <span className="whitespace-nowrap">คูปองส่วนลด</span>
          </button>
          <button 
            onClick={() => setActiveTab("orders")}
            className={`admin-nav-item ${activeTab === "orders" ? "is-active" : ""}`}
          >
            <History size={20} className="shrink-0" /> <span className="whitespace-nowrap">ประวัติออเดอร์</span>
          </button>
        </nav>
        <div className="hidden md:block p-4 border-t border-slate-800">
          <button onClick={() => logoutStaff()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-rose-600 text-white rounded-xl transition-colors">
            <Power size={20} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        
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

        {/* DISCOUNTS TAB */}
        {activeTab === "discounts" && (
          <DiscountsTab />
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <OrderHistoryTab />
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
