import mongoose, { Schema, Document, models } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Prevent re-compilation of models
export const MenuItem = models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
