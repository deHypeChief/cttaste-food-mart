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
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  total: number;
  address: string;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  notes?: string;
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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true },
  address: { type: String, required: true },
  vendorName: { type: String },
  vendorAvatar: { type: String },
  vendorPublicKey: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'], default: 'Pending', index: true },
  notes: { type: String },
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
