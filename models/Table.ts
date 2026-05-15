import mongoose, { Schema, Document, models } from "mongoose";

export interface ITable extends Document {
  tableNumber: string;
  status: "Available" | "Occupied";
  token: string;
}

const TableSchema = new Schema<ITable>(
  {
    tableNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Available", "Occupied"], default: "Available" },
    token: { type: String, required: true },
  },
  { timestamps: true }
);

export const Table = models.Table || mongoose.model<ITable>("Table", TableSchema);
