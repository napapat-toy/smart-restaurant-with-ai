"use client";

import { useState } from "react";
import { 
  generateNewPins, 
  toggleMenuItemStatus, 
  deleteMenuItem, 
  generateTableToken, 
  addTable, 
  addMenuItem, 
  updateMenuItem,
  addCategory,
  deleteCategory,
  reorderCategories
} from "@/app/actions/admin";

interface UseAdminProps {
  initialData: any;
}

export function useAdmin({ initialData }: UseAdminProps) {
  const [activeTab, setActiveTab] = useState<"pins" | "menu" | "tables" | "categories" | "analytics">("pins");
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  
  // Custom states for category add
  const [newCategoryName, setNewCategoryName] = useState("");

  const [newMenu, setNewMenu] = useState({
    name: "",
    description: "",
    price: "",
    category: initialData.categories?.[0]?.name || "อาหารคาว",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    isAvailable: true,
    options: [] as any[] // [{ name, required, allowMultiple, choices: [{ name, priceDelta }] }]
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
    setNewMenu({ 
      name: "", 
      description: "", 
      price: "", 
      category: data.categories?.[0]?.name || "อาหารคาว", 
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", 
      isAvailable: true, 
      options: [] 
    });
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
      isAvailable: menu.isAvailable,
      options: menu.options || []
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

  // Option Customizations
  const handleAddOptionGroup = () => {
    setNewMenu(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { name: "", required: false, allowMultiple: false, choices: [] }
      ]
    }));
  };

  const handleUpdateOptionGroup = (groupIndex: number, fields: any) => {
    setNewMenu(prev => {
      const updatedOptions = [...prev.options];
      updatedOptions[groupIndex] = { ...updatedOptions[groupIndex], ...fields };
      return { ...prev, options: updatedOptions };
    });
  };

  const handleRemoveOptionGroup = (groupIndex: number) => {
    setNewMenu(prev => ({
      ...prev,
      options: prev.options.filter((_: any, idx: number) => idx !== groupIndex)
    }));
  };

  const handleAddChoice = (groupIndex: number) => {
    setNewMenu(prev => {
      const updatedOptions = prev.options.map((group, idx) => {
        if (idx !== groupIndex) return group;
        return {
          ...group,
          choices: [...group.choices, { name: "", priceDelta: 0 }]
        };
      });
      return { ...prev, options: updatedOptions };
    });
  };

  const handleUpdateChoice = (groupIndex: number, choiceIndex: number, fields: any) => {
    setNewMenu(prev => {
      const updatedOptions = prev.options.map((group, gIdx) => {
        if (gIdx !== groupIndex) return group;
        const updatedChoices = group.choices.map((choice: any, cIdx: number) => {
          if (cIdx !== choiceIndex) return choice;
          return { ...choice, ...fields };
        });
        return { ...group, choices: updatedChoices };
      });
      return { ...prev, options: updatedOptions };
    });
  };

  const handleRemoveChoice = (groupIndex: number, choiceIndex: number) => {
    setNewMenu(prev => {
      const updatedOptions = prev.options.map((group, idx) => {
        if (idx !== groupIndex) return group;
        return {
          ...group,
          choices: group.choices.filter((_: any, cIdx: number) => cIdx !== choiceIndex)
        };
      });
      return { ...prev, options: updatedOptions };
    });
  };

  // Category Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsLoading(true);
    const res = await addCategory(newCategoryName.trim());
    if (res?.error) {
      alert(res.error);
    } else {
      setNewCategoryName("");
      window.location.reload();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("ต้องการลบหมวดหมู่นี้ใช่หรือไม่? (เมนูอาหารที่เป็นหมวดหมู่นี้จะไม่แสดงหากไม่มีหมวดหมู่)")) return;
    setIsLoading(true);
    await deleteCategory(id);
    window.location.reload();
  };

  const handleMoveCategory = async (index: number, direction: "up" | "down") => {
    const list = [...data.categories];
    if (direction === "up" && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === "down" && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    } else {
      return;
    }
    setIsLoading(true);
    const orderedIds = list.map(c => c._id);
    await reorderCategories(orderedIds);
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
        setNewMenu(prev => ({ ...prev, image: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return {
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
  };
}
