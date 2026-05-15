import mongoose, { Schema, Document, models } from "mongoose";

export interface IRateLimit extends Document {
  ip: string;
  attempts: number;
  expireAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    ip: { type: String, required: true, unique: true },
    attempts: { type: Number, default: 1 },
    // MongoDB TTL Index: automatically deletes the document when the expireAt date is reached.
    expireAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true }
);

export const RateLimit = models.RateLimit || mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);
