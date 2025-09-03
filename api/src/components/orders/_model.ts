import mongoose from 'mongoose';

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrder extends mongoose.Document {
  orderNumber: string;
  vendorId: mongoose.Types.ObjectId;
  vendorPublicKey?: string;
  vendorName?: string;
  vendorAvatar?: string;
  userId?: mongoose.Types.ObjectId; // optional to support guest orders
  guestName?: string;
  guestPhone?: string;
  items: IOrderItem[];
  total: number;
  address: string;
  deliveryMode?: 'pickup' | 'doorstep';
  deliveryLocation?: string; // Named location selected from vendor deliveryLocations
  deliveryPrice?: number; // Price associated with selected delivery location
  deliveryInstructions?: string; // User-provided description of home/location
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  notes?: string;
  packCount?: number;
  packsPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new mongoose.Schema<IOrderItem>({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const orderSchema = new mongoose.Schema<IOrder>({
  orderNumber: { type: String, unique: true, index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  guestName: { type: String },
  guestPhone: { type: String },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true },
  address: { type: String, required: true },
  deliveryMode: { type: String, enum: ['pickup', 'doorstep'], default: 'pickup' },
  deliveryLocation: { type: String },
  deliveryPrice: { type: Number, default: 0 },
  deliveryInstructions: { type: String },
  vendorName: { type: String },
  vendorAvatar: { type: String },
  vendorPublicKey: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'], default: 'Pending', index: true },
  notes: { type: String },
  packCount: { type: Number, default: 0 },
  packsPrice: { type: Number, default: 0 },
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
