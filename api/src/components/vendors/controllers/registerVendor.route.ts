import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import { SessionClient } from "../../auth/_model";
import { Vendor } from "../_model";
import SuccessHandler from "../../../services/successHandler.service";
import { VendorValidator } from "../_setup";
import { NotifyUser } from "../../notification/_model";
import NotificationHandler from "../../../services/notificationHandler.service";
import { generateOTP } from '../../../services/otpHandler.service';
import { PendingRegistration } from '../../auth/_model';

// Portable UUID/token generator: prefer Bun.crypto.randomUUID -> globalThis.crypto.randomUUID -> fallback
const generateToken = () => {
    try {
        if (typeof Bun !== 'undefined' && (Bun as any).crypto && typeof (Bun as any).crypto.randomUUID === 'function') {
            return (Bun as any).crypto.randomUUID();
        }
    } catch (e) {}

    try {
        if (typeof (globalThis as any).crypto?.randomUUID === 'function') {
            return (globalThis as any).crypto.randomUUID();
        }
    } catch (e) {}

    return `uid-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

const registerVendor = new Elysia()
    .post("/register", async ({ set, body }) => {
        const { 
            email, 
            password, 
            fullName, 
            restaurantName, 
            phoneNumber, 
            location, 
            address, 
            vendorType,
            profile,
            description,
            cuisine
        } = body;
        
        try {
            const checkEmail = await SessionClient.findOne({ email })
            if (checkEmail) {
                return ErrorHandler.ValidationError(set, "The email provided is already in use.")
            }

            const token = Bun.env.NODE_ENV === 'test' ? `test-${Date.now()}` : generateToken();
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
            const pendingRegistration = await PendingRegistration.create({
                email,
                payload: { email, password, fullName, restaurantName, phoneNumber, location, address, vendorType, profile, description, cuisine },
                role: 'vendor',
                token,
                expiresAt
            });
            // Generate and send OTP immediately
            try { await generateOTP(pendingRegistration._id, 'email_verification'); } catch {}

            return SuccessHandler(
                set,
                "Registration initiated. Enter the OTP sent to your email to complete vendor account setup.",
                {
                    pendingRegistrationId: pendingRegistration._id,
                    email
                },
                true
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error registering vendor",
                error
            );
        }
    }, VendorValidator.create)

export default registerVendor;
