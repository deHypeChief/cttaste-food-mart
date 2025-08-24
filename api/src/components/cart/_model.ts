import mongoose from 'mongoose';

export interface ICartItem {
  vendorId: mongoose.Types.ObjectId;
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number; // snapshot price
  quantity: number;
  image?: string;
}

export interface ICart extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  // Persisted pack state (optional)
  packsByVendor?: Record<string, any>;
  assignments?: Record<string, any>;
  packItemQuantities?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new mongoose.Schema<ICartItem>({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
}, { _id: false });

const cartSchema = new mongoose.Schema<ICart>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  items: { type: [cartItemSchema], default: [] },
  packsByVendor: { type: mongoose.Schema.Types.Mixed, default: {} },
  assignments: { type: mongoose.Schema.Types.Mixed, default: {} },
  packItemQuantities: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
