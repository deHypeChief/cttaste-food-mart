import Elysia from 'elysia';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { PendingRegistration, SessionClient as SessionClientModel } from '../_model';
import { User } from '../../users/_model';
import { Vendor } from '../../vendors/_model';

const confirmRegistration = new Elysia()
  .get('/confirm', async ({ query, set }) => {
    try {
      const { token } = query as any;
      if (!token) return ErrorHandler.ValidationError(set, 'Missing token');

      const pending = await PendingRegistration.findOne({ token });
      if (!pending) return ErrorHandler.ValidationError(set, 'Invalid or expired token');

      // consume pending registration
      await PendingRegistration.deleteOne({ _id: pending._id });

      const { email } = pending;
      const payload = pending.payload || {};

      const existing = await SessionClientModel.findOne({ email });
      if (existing) return ErrorHandler.ValidationError(set, 'Account already exists for this email');

      const newClient = await SessionClientModel.create({
        email,
        password: payload.password || undefined,
        fullName: payload.fullName || payload.fullname || payload.name || 'User',
        role: pending.role === 'vendor' ? ['vendor'] : ['user'],
        profile: payload.profile || ''
      });

      if (pending.role === 'user') {
        // Ensure required fields are present. Derive username from email if missing and default gender to 'notSpecified'.
        const derivedUsername = payload.username || (email ? String(email).split('@')[0] : `user${Date.now()}`);
        const gender = payload.gender || 'notSpecified';
        await User.create({
          sessionClientId: newClient._id,
          phoneNumber: payload.phoneNumber || '',
          username: derivedUsername,
          gender,
          dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : undefined,
          address: payload.address || '',
          school: payload.school || ''
        });
      } else if (pending.role === 'vendor') {
        await Vendor.create({
          sessionClientId: newClient._id,
          restaurantName: payload.restaurantName || payload.restaurant || 'Vendor',
          phoneNumber: payload.phoneNumber || '',
          location: payload.location || '',
          address: payload.address || '',
          vendorType: payload.vendorType || '',
          description: payload.description || '',
          cuisine: payload.cuisine || '',
          isApproved: false,
          isActive: true
        });
      }

  // Mark session client as email-verified and redirect to frontend confirmation success page
  try {
    await SessionClientModel.updateOne({ _id: newClient._id }, { $set: { isEmailVerified: true } });
  } catch (e) {
    // ignore update failure, account still created
  }

  const clientOrigin = Bun.env.ACTIVE_CLIENT_ORIGIN || Bun.env.ACTIVE_API_ORIGIN || 'http://localhost:5173';
  const redirectTo = `${clientOrigin.replace(/\/$/, '')}/auth/confirmed?email=${encodeURIComponent(email)}`;
  set.status = 302;
  set.headers = { Location: redirectTo };
  return { success: true, redirect: redirectTo };
    } catch (error) {
      return ErrorHandler.ServerError(set, 'Error confirming registration', error);
    }
  });

export default confirmRegistration;
