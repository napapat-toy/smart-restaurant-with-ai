import mongoose, { Schema, Document, models } from "mongoose";

export interface ISettings extends Document {
  cashierPin: string;
  kitchenPin: string;
  lastPinResetDate: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    cashierPin: { type: String, required: true },
    kitchenPin: { type: String, required: true },
    lastPinResetDate: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export const Settings = models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
