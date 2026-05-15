import mongoose, { Schema, Document, models } from "mongoose";

export interface IOrderItem {
  menuItemId: string; // Storing string ID for easier reference
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface IOrder extends Document {
  tableId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: "Pending" | "Cooking" | "Served" | "Paid" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
  },
  { _id: false } // Prevent creating independent ObjectIds for sub-documents to keep it clean
);

const OrderSchema = new Schema<IOrder>(
  {
    tableId: { type: String, required: true, index: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Cooking", "Served", "Paid", "Cancelled"],
      default: "Pending",
      index: true
    },
  },
  { timestamps: true }
);

// Compound index for frequent cashier/kitchen queries
OrderSchema.index({ tableId: 1, status: 1 });

export const Order = models.Order || mongoose.model<IOrder>("Order", OrderSchema);
