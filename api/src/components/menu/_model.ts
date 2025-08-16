import mongoose from 'mongoose';

export interface IMenuItem {
  vendorId: mongoose.Types.ObjectId;
  name: string;
  type?: string;
  price: number;
  status?: 'Available' | 'Unavailable';
  image?: string;
  isActive: boolean;
}

const menuItemSchema = new mongoose.Schema<IMenuItem>({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  type: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Available', 'Unavailable'], default: 'Available' },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
