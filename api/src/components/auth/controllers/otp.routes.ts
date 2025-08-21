import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { generateOTP, verifyOTP } from "../../../services/otpHandler.service";
import { SessionClient, PendingRegistration } from "../_model";
import { OTPValidator } from "../_setup";
import { ObjectId, Types } from "mongoose";

const manageOTP = new Elysia()
    .post("/otp/generate/email", async ({
        set,
        body: { sessionId }
    }) => {
        try {

            const client = await SessionClient.findOne({
                _id: sessionId,
                isEmailVerified: true
            })

            if(client){
                return ErrorHandler.ValidationError(
                    set,
                    `${client.email} is already verifyed`
                );
            }


            const otp = await generateOTP(
                new Types.ObjectId(sessionId),
                "email_verification"
            )

            if (!otp) {
                return ErrorHandler.ValidationError(
                    set,
                    "You have reached the limit of OTP requests. Please wait for 60 seconds"
                );
            }

            return SuccessHandler(
                set,
                `OTP has been sent to ${otp.email}`,
                {
                    exp: otp.expiresAt,
                    purpose: otp.purpose,
                    email: otp.email
                },
                true
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error generating an OTP",
                error
            );
        }
    }, OTPValidator.generateOTP_Email)
    .post("/otp/verify/email", async ({
        set,
        body: {
            sessionId,
            otp
        }
    }) => {
        try {
                // Try to find a live session client first; if not present, look for a pending registration
                const cleint = await SessionClient.findOne({ _id: sessionId });
                const pending = !cleint ? await PendingRegistration.findById(sessionId) : null;

                if (!cleint && !pending) {
                    return ErrorHandler.ValidationError(
                        set,
                        "Invalid OTP or client"
                    );
                }

                const isVerifyed = await verifyOTP(
                    new Types.ObjectId(sessionId),
                    "email_verification",
                    otp
                )

                if (!isVerifyed.valid) {
                    return ErrorHandler.ValidationError(
                        set,
                        isVerifyed.message as string
                    )
                }

                if (cleint) {
                    // existing session client - just mark verified
                    cleint.isEmailVerified = true;
                    await cleint.save();

                    const clientOrigin = Bun.env.ACTIVE_CLIENT_ORIGIN || Bun.env.ACTIVE_API_ORIGIN || 'http://localhost:5173';
                    const rawRole = (cleint.role || []).includes('vendor') ? 'vendor' : 'customer';
                    const redirectTo = `${clientOrigin.replace(/\/$/, '')}/auth/login?verified=1&type=${rawRole}`;

                    return SuccessHandler(
                        set,
                        "The given OTP is valid",
                        { ...isVerifyed, redirect: redirectTo },
                        true
                    )
                }

                // finalize pending registration
                if (pending) {
                    const payload = pending.payload || {};
                    // create the session client
                    const newClient = await SessionClient.create({
                        email: pending.email,
                        fullName: payload.fullName || payload.username || '',
                        password: payload.password || '',
                        role: [pending.role === 'vendor' ? 'vendor' : 'user'],
                        isEmailVerified: true
                    });

                    // create domain-specific record
                    if (pending.role === 'user') {
                        const { User } = await import('../../users/_model');
                        await User.create({
                            sessionClientId: newClient._id,
                            username: payload.username || (payload.fullName || '').replace(/\s+/g, '').toLowerCase(),
                            phoneNumber: payload.phoneNumber || '',
                            dateOfBirth: payload.dateOfBirth || null,
                            gender: payload.gender || 'notSpecified',
                            address: payload.address || '',
                            school: payload.school || ''
                        });
                    } else if (pending.role === 'vendor') {
                        const { Vendor } = await import('../../vendors/_model');
                        await Vendor.create({
                            sessionClientId: newClient._id,
                            restaurantName: payload.restaurantName || payload.fullName || 'Vendor',
                            ownerName: payload.fullName || '',
                            phoneNumber: payload.phoneNumber || '',
                            location: payload.location || '',
                            address: payload.address || '',
                            vendorType: payload.vendorType || 'Restaurant',
                            description: payload.description || '',
                            cuisine: payload.cuisine || ''
                        });
                    }

                    // remove this and ANY other pending registrations linked to the same email
                    try {
                        await PendingRegistration.deleteMany({ email: pending.email });
                    } catch (cleanErr) {
                        console.warn('PendingRegistration cleanup warning for email %s:', pending.email, cleanErr);
                    }

                    // Redirect to login page after activation for smoother UX
                    const clientOrigin = Bun.env.ACTIVE_CLIENT_ORIGIN || Bun.env.ACTIVE_API_ORIGIN || 'http://localhost:5173';
                    const typeParam = pending.role === 'vendor' ? 'vendor' : 'customer';
                    const redirectTo = `${clientOrigin.replace(/\/$/, '')}/auth/login?verified=1&type=${typeParam}`;
                    return SuccessHandler(
                        set,
                        "The given OTP is valid and your account has been activated",
                        { created: true, redirect: redirectTo },
                        true
                    )
                }
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error verifying the given OTP",
                error
            );
        }
    }, OTPValidator.verifyOTP_Email)

export default manageOTP