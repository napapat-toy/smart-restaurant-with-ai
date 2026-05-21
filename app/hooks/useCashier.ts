"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  getTablesWithBilling, 
  processPayment, 
  openTableSession, 
  cancelTableSession, 
  moveTable, 
  TableWithBilling 
} from "@/app/actions/cashier";
import { validateDiscount } from "@/app/actions/discount";
import { getCheckoutRecommendations } from "@/app/actions/recommendations";
import { usePolling } from "@/app/hooks/usePolling";

export function useCashier() {
  const [tables, setTables] = useState<TableWithBilling[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableWithBilling | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Promo code & recommendations state
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: "percentage" | "fixed"; value: number; description: string } | null>(null);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const fetchTables = useCallback(async () => {
    const data = await getTablesWithBilling();
    setTables(data);
    
    // Update selected table if it's currently open using functional state update
    setSelectedTable(prev => {
      if (!prev) return null;
      const updated = data.find(t => t.id === prev.id);
      return updated || null; 
    });
  }, []);

  // Poll for live billing updates every 3 seconds
  usePolling(fetchTables, 3000);

  // Fetch recommendations for the selected table
  useEffect(() => {
    if (!selectedTable || selectedTable.unpaidOrders.length === 0) {
      setRecommendations([]);
      return;
    }
    
    let isMounted = true;
    const fetchRecommendations = async () => {
      setIsRecsLoading(true);
      try {
        const data = await getCheckoutRecommendations(selectedTable.id);
        if (isMounted) {
          setRecommendations(data);
        }
      } catch (err) {
        console.error("Failed to load checkout recommendations", err);
      } finally {
        if (isMounted) {
          setIsRecsLoading(false);
        }
      }
    };

    fetchRecommendations();
    return () => {
      isMounted = false;
    };
  }, [selectedTable?.id]);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim() || !selectedTable) return;
    try {
      const res = await validateDiscount(promoCodeInput, selectedTable.totalAmount);
      if (res.valid) {
        setAppliedPromo(res.discount as any);
        setPromoDiscountAmount(res.discountAmount);
        setIsMember(false); // exclusive
      } else {
        alert(res.error || "รหัสส่วนลดไม่ถูกต้อง");
      }
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการตรวจสอบรหัส");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscountAmount(0);
    setPromoCodeInput("");
  };

  const handlePayment = async () => {
    if (!selectedTable) return;
    setIsProcessing(true);

    const discountCode = appliedPromo ? appliedPromo.code : (isMember ? "MEMBER_10" : undefined);
    const discountAmount = appliedPromo ? promoDiscountAmount : (isMember ? Math.round(selectedTable.totalAmount * 0.1) : 0);

    const result = await processPayment(selectedTable.id, discountCode, discountAmount);

    setIsProcessing(false);
    if (result.success) {
      setSelectedTable(null);
      setIsMember(false);
      setAppliedPromo(null);
      setPromoDiscountAmount(0);
      setPromoCodeInput("");
      setShowSuccess(true);
      fetchTables();
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert("เกิดข้อผิดพลาดในการชำระเงิน: " + result.error);
    }
  };

  const handleOpenTable = async () => {
    if (!selectedTable) return;
    setIsProcessing(true);
    const result = await openTableSession(selectedTable.id);
    setIsProcessing(false);
    if (result.success) {
      setPrintModalOpen(true);
      fetchTables();
    } else {
      alert("ไม่สามารถเปิดโต๊ะได้");
    }
  };

  const handlePrint = () => {
    window.print();
    setPrintModalOpen(false);
  };

  const handleCancelTable = async () => {
    if (!selectedTable) return;
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะยกเลิกโต๊ะ ${selectedTable.tableNumber}? (ออเดอร์ทั้งหมดจะถูกยกเลิก)`)) return;
    setIsProcessing(true);
    const result = await cancelTableSession(selectedTable.id);
    setIsProcessing(false);
    if (result.success) {
      setSelectedTable(null);
      fetchTables();
    } else {
      alert("เกิดข้อผิดพลาด: " + result.error);
    }
  };

  const handleMoveTable = async () => {
    if (!selectedTable) return;
    const availableTables = tables.filter(t => t.status === 'Available');
    if (availableTables.length === 0) {
      alert("ไม่มีโต๊ะว่างให้ย้ายในขณะนี้");
      return;
    }
    
    // Create a simple prompt string showing available tables
    const availableNumbers = availableTables.map(t => t.tableNumber).join(", ");
    const destNumber = prompt(`ย้ายจากโต๊ะ ${selectedTable.tableNumber}\nโต๊ะที่ว่าง: ${availableNumbers}\n\nกรุณาพิมพ์หมายเลขโต๊ะปลายทาง:`);
    
    if (!destNumber) return;
    
    const targetTable = availableTables.find(t => t.tableNumber === destNumber);
    if (!targetTable) {
      alert("หมายเลขโต๊ะไม่ถูกต้อง หรือโต๊ะนั้นไม่ว่าง");
      return;
    }

    if (!confirm(`ยืนยันการย้ายโต๊ะ ${selectedTable.tableNumber} ไปยังโต๊ะ ${targetTable.tableNumber} หรือไม่?`)) return;

    setIsProcessing(true);
    const result = await moveTable(selectedTable.id, targetTable.id);
    setIsProcessing(false);
    
    if (result.success) {
      setSelectedTable(null);
      fetchTables();
      alert(`ย้ายโต๊ะสำเร็จ! โปรดพิมพ์ QR Code ใหม่ให้โต๊ะ ${targetTable.tableNumber}`);
    } else {
      alert("เกิดข้อผิดพลาด: " + result.error);
    }
  };

  const occupiedCount = tables.filter(t => t.status === 'Occupied').length;

  return {
    tables,
    selectedTable,
    isProcessing,
    showSuccess,
    isMember,
    printModalOpen,
    printRef,
    promoCodeInput,
    appliedPromo,
    promoDiscountAmount,
    recommendations,
    isRecsLoading,
    baseUrl,
    occupiedCount,
    setSelectedTable,
    setIsMember,
    setPromoCodeInput,
    setPrintModalOpen,
    handleApplyPromo,
    handleRemovePromo,
    handlePayment,
    handleOpenTable,
    handlePrint,
    handleCancelTable,
    handleMoveTable,
  };
}
