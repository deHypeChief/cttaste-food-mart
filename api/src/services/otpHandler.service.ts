import mongoose from "mongoose";
import { OTP, SessionClient, PendingRegistration } from "../components/auth/_model";
import EmailHandler from "./emailHandler.service";
import { verifyOtpEmail } from "../emails/verifyEmailOtp.template";

export async function canSendOTP(sessionId: mongoose.Types.ObjectId, purpose: "email_verification" | "2fa" | "password_reset") {
    const oneMinsAgo = new Date(Date.now() - 60 * 1000);
    const count = await OTP.countDocuments({
        sessionId,
        purpose,
        createdAt: { $gte: oneMinsAgo }
    });
    return count < 1
}

export async function generateOTP(
    sessionId: mongoose.Types.ObjectId,
    purpose: "email_verification" | "2fa" | "password_reset"
) {
    const canSend = await canSendOTP(sessionId, purpose)
    if (!canSend) {
        console.warn('[OTP] Rate limited: sessionId/pendingId=%s purpose=%s (wait 60s)', sessionId.toString(), purpose);
        return false
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10mins

    // Invalidate other OTPs before creating new ones
    await OTP.updateMany(
        { sessionId, purpose, used: false },
        { $set: { used: true } }
    );

    // Try to find a live session client first; if not found, try pending registration
    const client = await SessionClient.findById(sessionId)
    let emailToSend = null;
    let nameToUse = '';

    if (client) {
        emailToSend = client.email;
        nameToUse = client.fullName;
    } else {
        const pending = await PendingRegistration.findById(sessionId);
        if (pending) {
            emailToSend = pending.email;
            nameToUse = pending.payload?.fullName || '';
        }
    }

    if (!emailToSend) {
        console.error('[OTP] Could not resolve email for id=%s (neither SessionClient nor PendingRegistration)', sessionId.toString());
        throw new Error("Email not found")
    }

    console.log('[OTP] Sending OTP email to %s (purpose=%s, pending=%s)', emailToSend, purpose, !client);
    await EmailHandler.send(
        emailToSend,
        "Verify Your Email",
        await verifyOtpEmail({
            name: nameToUse,
            otp: token
        })
    )

    await OTP.create({
        sessionId,
        purpose,
        token,
        expiresAt
    })

    console.log('[OTP] Created OTP record (maskedToken=******, expiresAt=%s) for id=%s', expiresAt.toISOString(), sessionId.toString());

    return {
        token,
        purpose,
        expiresAt,
        email: client.email
    }
}

export async function verifyOTP(
    sessionId: mongoose.Types.ObjectId,
    purpose: "email_verification" | "2fa" | "password_reset",
    inputOtp: string
) {
    const record = await OTP.findOne({
        sessionId,
        token: inputOtp,
        purpose,
        used: false
    });

    if (!record) return { valid: false, message: 'Invalid or used OTP' };
    if (new Date() > record.expiresAt) return { valid: false, message: 'OTP expired' };

    record.used = true;
    await record.save();

    return { valid: true };
}