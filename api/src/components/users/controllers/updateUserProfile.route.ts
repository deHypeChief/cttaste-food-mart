import Elysia, { t } from 'elysia';
import mongoose from 'mongoose';
import { isSessionAuth } from '../../../middleware/authSession.middleware';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { User } from '../_model';
import { SessionClient } from '../../auth/_model';

const updateUserProfile = new Elysia()
  .use(isSessionAuth('user'))
  .patch('/profile', async ({ set, body, session }) => {
    try {
      const sessionId = new mongoose.Types.ObjectId(session._id);
      const { fullName, username, phoneNumber, address, school } = body as any;

      // Update session client's full name if provided
      if (fullName) {
        await SessionClient.findByIdAndUpdate(sessionId, { fullName });
      }

      const userDoc = await User.findOne({ sessionClientId: sessionId });
      if (!userDoc) return ErrorHandler.ValidationError(set, 'User profile not found');

      if (username) userDoc.username = username;
      if (phoneNumber) userDoc.phoneNumber = phoneNumber;
      if (address !== undefined) userDoc.address = address;
      if (school !== undefined) userDoc.school = school;
      await userDoc.save();

      const updatedSession = await SessionClient.findById(sessionId);

      return SuccessHandler(set, 'Profile updated', {
        session: updatedSession,
        user: userDoc,
      });
    } catch (err) {
      throw ErrorHandler.ServerError(set, 'Failed to update profile', err);
    }
  }, {
    body: t.Object({
      fullName: t.Optional(t.String()),
      username: t.Optional(t.String()),
      phoneNumber: t.Optional(t.String()),
      address: t.Optional(t.String()),
      school: t.Optional(t.String()),
    })
  });

export default updateUserProfile;