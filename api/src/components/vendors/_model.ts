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
    deliveryLocations?: Array<{ location: string; price: number }>;
    deliveryRadius?: number;
    preparationTime?: number;
    currency?: string;
    taxRate?: number;
    // Pricing for pack-based ordering (optional)
    pricePerPack?: number;
    
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

    // Reviews / Comments
    reviews?: Array<{
        userName: string;
        rating: number; // 1-5
        comment: string;
        createdAt: Date;
    }>;
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
    deliveryLocations: {
        type: [new mongoose.Schema({
            location: { type: String, required: true },
            price: { type: Number, default: 0 }
        }, { _id: false })],
        default: []
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
    pricePerPack: {
        type: Number,
        default: 0,
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

    // Reviews / Comments
    reviews: {
        type: [new mongoose.Schema({
            userName: { type: String, required: true },
            rating: { type: Number, min: 1, max: 5, required: true },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }, { _id: false })],
        default: [],
    },
}, { timestamps: true });

export const Vendor = mongoose.model<IVendor>('Vendor', vendorSchema);
