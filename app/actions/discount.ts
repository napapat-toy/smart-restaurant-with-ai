"use server";

import connectToDatabase from "@/lib/mongodb";
import { Discount } from "@/models/Discount";
import { verifyRole } from "./auth";

export type DiscountValidationResult =
  | { valid: true; discount: { code: string; type: "percentage" | "fixed"; value: number; description: string }; discountAmount: number; finalAmount: number }
  | { valid: false; error: string };

export async function validateDiscount(code: string, orderAmount: number): Promise<DiscountValidationResult> {
  await connectToDatabase();
  const discount = await Discount.findOne({ code: code.toUpperCase().trim() });

  if (!discount) return { valid: false, error: "ไม่พบโค้ดส่วนลดนี้ในระบบ" };
  if (!discount.isActive) return { valid: false, error: "โค้ดนี้ถูกปิดใช้งานแล้ว" };

  // Check time validity
  const now = new Date();
  if (discount.startsAt && now < discount.startsAt) {
    return { valid: false, error: "โค้ดนี้ยังไม่เริ่มใช้งาน" };
  }
  if (discount.expiresAt && now > discount.expiresAt) {
    return { valid: false, error: "โค้ดนี้หมดอายุแล้ว" };
  }

  // Check usage limit
  if (discount.maxUsage > 0 && discount.usageCount >= discount.maxUsage) {
    return { valid: false, error: "โค้ดนี้ถูกใช้งานครบจำนวนแล้ว" };
  }

  // Check minimum order amount
  if (orderAmount < discount.minOrderAmount) {
    return { valid: false, error: `ยอดสั่งซื้อขั้นต่ำ ${discount.minOrderAmount} บาท` };
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discount.type === "percentage") {
    discountAmount = Math.round(orderAmount * (discount.value / 100));
  } else {
    discountAmount = Math.min(discount.value, orderAmount); // Can't discount more than total
  }

  const finalAmount = orderAmount - discountAmount;

  return {
    valid: true,
    discount: {
      code: discount.code,
      type: discount.type,
      value: discount.value,
      description: discount.description,
    },
    discountAmount,
    finalAmount,
  };
}

export async function applyDiscountUsage(code: string) {
  await connectToDatabase();
  await Discount.findOneAndUpdate(
    { code: code.toUpperCase().trim() },
    { $inc: { usageCount: 1 } }
  );
}

export async function getDiscounts() {
  await verifyRole(["admin"]);
  await connectToDatabase();
  const discounts = await Discount.find().sort({ createdAt: -1 }).lean();
  return discounts.map((d: any) => ({
    id: d._id.toString(),
    code: d.code,
    description: d.description,
    type: d.type,
    value: d.value,
    minOrderAmount: d.minOrderAmount,
    isActive: d.isActive,
    usageCount: d.usageCount,
    maxUsage: d.maxUsage,
    startsAt: d.startsAt ? d.startsAt.toISOString() : null,
    expiresAt: d.expiresAt ? d.expiresAt.toISOString() : null,
    createdAt: d.createdAt.toISOString(),
  }));
}

export async function createDiscount(data: {
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUsage: number;
  startsAt: string | null;
  expiresAt: string | null;
}) {
  await verifyRole(["admin"]);
  await connectToDatabase();

  const existing = await Discount.findOne({ code: data.code.toUpperCase().trim() });
  if (existing) return { success: false, error: "โค้ดนี้มีอยู่แล้วในระบบ" };

  if (data.type === "percentage" && (data.value <= 0 || data.value > 100)) {
    return { success: false, error: "ส่วนลดแบบ % ต้องอยู่ระหว่าง 1-100" };
  }

  await Discount.create({
    code: data.code.toUpperCase().trim(),
    description: data.description,
    type: data.type,
    value: data.value,
    minOrderAmount: data.minOrderAmount || 0,
    maxUsage: data.maxUsage || 0,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    isActive: true,
    usageCount: 0,
  });

  return { success: true };
}

export async function toggleDiscountActive(id: string, isActive: boolean) {
  await verifyRole(["admin"]);
  await connectToDatabase();
  await Discount.findByIdAndUpdate(id, { isActive });
  return { success: true };
}

export async function deleteDiscount(id: string): Promise<{ success: boolean; error?: string }> {
  await verifyRole(["admin"]);
  await connectToDatabase();
  try {
    await Discount.findByIdAndDelete(id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการลบ" };
  }
}
