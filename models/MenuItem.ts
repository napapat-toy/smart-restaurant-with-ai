import mongoose, { Schema, Document, models } from "mongoose";

export interface IMenuOptionChoice {
  name: string;
  priceDelta: number; // additional cost, e.g. +10
}

export interface IMenuOptionGroup {
  name: string;
  required: boolean;
  allowMultiple: boolean;
  choices: IMenuOptionChoice[];
}

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  options?: IMenuOptionGroup[];
}

const MenuOptionChoiceSchema = new Schema<IMenuOptionChoice>({
  name: { type: String, required: true },
  priceDelta: { type: Number, required: true, default: 0 }
}, { _id: false });

const MenuOptionGroupSchema = new Schema<IMenuOptionGroup>({
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  allowMultiple: { type: Boolean, default: false },
  choices: [MenuOptionChoiceSchema]
}, { _id: false });

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    category: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    options: [MenuOptionGroupSchema],
  },
  { timestamps: true }
);

// Prevent re-compilation of models
export const MenuItem = models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
