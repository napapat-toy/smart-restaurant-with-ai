import mongoose, { Schema, Document, models } from "mongoose";

export interface IOrderItemOption {
  groupName: string;
  choiceName: string;
  priceDelta: number;
}

export interface IOrderItem {
  menuItemId: string; // Storing string ID for easier reference
  name: string;
  price: number;
  quantity: number;
  note?: string;
  selectedOptions?: IOrderItemOption[];
}

export interface IOrder extends Document {
  tableId: string;
  token?: string;
  items: IOrderItem[];
  totalAmount: number;
  status: "Pending" | "Cooking" | "Served" | "Paid" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemOptionSchema = new Schema<IOrderItemOption>(
  {
    groupName: { type: String, required: true },
    choiceName: { type: String, required: true },
    priceDelta: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
    selectedOptions: [OrderItemOptionSchema],
  },
  { _id: false } // Prevent creating independent ObjectIds for sub-documents to keep it clean
);

const OrderSchema = new Schema<IOrder>(
  {
    tableId: { type: String, required: true, index: true },
    token: { type: String, index: true },
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

// Compound index for frequent cashier/kitchen/customer queries
OrderSchema.index({ tableId: 1, status: 1 });
OrderSchema.index({ tableId: 1, token: 1 });

export const Order = models.Order || mongoose.model<IOrder>("Order", OrderSchema);
