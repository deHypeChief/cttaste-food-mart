import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import { SessionClient } from "../../auth/_model";
import { User } from "../_model";
import SuccessHandler from "../../../services/successHandler.service";
import { UserValidator } from "../_setup";
import { NotifyUser } from "../../notification/_model";
import NotificationHandler from "../../../services/notificationHandler.service";
import { rewardReferralChain } from "../../../services/referalToken.service";
// Link-based confirm removed in favor of OTP flow
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

    // Fallback: timestamp + random number (not cryptographically strong but fine for tokens where collision is unlikely)
    return `uid-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

const registerUser = new Elysia()
    .post("/register", async ({ set, body, query }) => {

        const validRoles = ["user"]
        const { email, password, fullName, phoneNumber, dateOfBirth, username, gender, profile, referalToken, school } = body;
        const { role } = query
        try {
            if (!role || !validRoles.includes(role)) {
                return ErrorHandler.ValidationError(set, "Invalid role provided. Only 'user' role is allowed for customer registration.")
            }

            const checkEmail = await SessionClient.findOne({ email })
            if (checkEmail) {
                return ErrorHandler.ValidationError(set, "The email provided is already in use.")
            }

            // Create a pending registration and immediately generate an OTP
            const token = Bun.env.NODE_ENV === 'test' ? `test-${Date.now()}` : generateToken();
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
            const pendingRegistration = await PendingRegistration.create({
                email,
                payload: { email, password, fullName, phoneNumber, dateOfBirth, username, gender, profile, referalToken, school },
                role: 'user',
                token,
                expiresAt
            });
            // Generate and send OTP (email is derived inside generateOTP)
            try {
                await generateOTP(pendingRegistration._id, 'email_verification');
            } catch (e) {
                // If OTP generation fails (rate limit or mail issue) we still return pending registration; client can retry generate OTP.
            }


            // Informational notification - will be sent after confirmation on account creation
            // (No session client exists yet to attach notification)



            return SuccessHandler(
                set,
                "Registration initiated. Enter the OTP sent to your email to complete account setup.",
                {
                    pendingRegistrationId: pendingRegistration._id,
                    email
                },
                true
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error registering user",
                error
            );
        }
    }, UserValidator.create)

export default registerUser;