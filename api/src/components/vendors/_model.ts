import mongoose from 'mongoose';

export interface IVendor {
    sessionClientId: mongoose.Types.ObjectId;
    restaurantName: string;
    ownerName?: string;
    phoneNumber: string;
    location: string;
    address: string;
    vendorType: string; // Restaurant, Cafe, Lounge
    description?: string;
    cuisine?: string;
    avatar?: string;
    banner?: string;
    
    // Business settings
    minimumOrder?: number;
    deliveryFee?: number;
    deliveryRadius?: number;
    preparationTime?: number;
    currency?: string;
    taxRate?: number;
    
    // Operational settings
    autoAcceptOrders?: boolean;
    holidayMode?: boolean;
    temporaryClosure?: boolean;
    onlinePayments?: boolean;
    cashOnDelivery?: boolean;

    // Notifications & preferences
    orderNotifications?: boolean;
    emailNotifications?: boolean;
    loginAlerts?: boolean;

    // Working hours (per day)
    workingHours?: Map<string, {
        isOpen: boolean;
        startTime: string; // 24h HH:mm
        closingTime: string; // 24h HH:mm
    }>;
    
    // Status
    isApproved?: boolean;
    isActive?: boolean;
}

const vendorSchema = new mongoose.Schema<IVendor>({
    sessionClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SessionClient',
        required: true,
    },
    restaurantName: {
        type: String,
        required: true,
    },
    ownerName: {
        type: String,
        default: "",
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    vendorType: {
        type: String,
        required: true,
        enum: ["Restaurant", "Cafe", "Lounge", "Fast Food", "Bar", "Other"],
    },
    description: {
        type: String,
        default: "",
    },
    cuisine: {
        type: String,
        default: "",
    },
    avatar: {
        type: String,
        default: "",
    },
    banner: {
        type: String,
        default: "",
    },
    
    // Business settings
    minimumOrder: {
        type: Number,
        default: 0,
    },
    deliveryFee: {
        type: Number,
        default: 0,
    },
    deliveryRadius: {
        type: Number,
        default: 10, // km
    },
    preparationTime: {
        type: Number,
        default: 30, // minutes
    },
    currency: {
        type: String,
        default: "NGN",
    },
    taxRate: {
        type: Number,
        default: 7.5, // percentage
    },
    
    // Operational settings
    autoAcceptOrders: {
        type: Boolean,
        default: false,
    },
    holidayMode: {
        type: Boolean,
        default: false,
    },
    temporaryClosure: {
        type: Boolean,
        default: false,
    },
    onlinePayments: {
        type: Boolean,
        default: true,
    },
    cashOnDelivery: {
        type: Boolean,
        default: true,
    },

    // Notifications
    orderNotifications: {
        type: Boolean,
        default: true,
    },
    emailNotifications: {
        type: Boolean,
        default: true,
    },
    loginAlerts: {
        type: Boolean,
        default: true,
    },
    
    // Working hours
    workingHours: {
        type: Map,
        of: new mongoose.Schema({
            isOpen: { type: Boolean, default: true },
            startTime: { type: String, default: "09:00" },
            closingTime: { type: String, default: "18:00" },
        }, { _id: false }),
        default: () => ({
            Monday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
            Tuesday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
            Wednesday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
            Thursday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
            Friday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
            Saturday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
            Sunday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
        })
    },
    
    // Status
    isApproved: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export const Vendor = mongoose.model<IVendor>('Vendor', vendorSchema);
