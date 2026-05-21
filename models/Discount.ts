import mongoose, { Schema, Document, models } from "mongoose";

export interface IDiscount extends Document {
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  isActive: boolean;
  usageCount: number;
  maxUsage: number; // 0 = unlimited
  startsAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    maxUsage: { type: Number, default: 0 }, // 0 = unlimited
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);



export const Discount = models.Discount || mongoose.model<IDiscount>("Discount", DiscountSchema);
