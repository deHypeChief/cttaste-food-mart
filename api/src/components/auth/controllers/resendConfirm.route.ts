import Elysia from 'elysia';
import { PendingRegistration } from '../_model';
import ErrorHandler from '../../../services/errorHandler.service';
import EmailHandler from '../../../services/emailHandler.service';
import { renderConfirm } from '../../../emails/confirmRegistration.template';

const resendConfirm = new Elysia()
  .post('/resend-confirm', async ({ body, set }) => {
    try {
      const { email } = body as any;
      if (!email) return ErrorHandler.ValidationError(set, 'Missing email');

      const pending = await PendingRegistration.findOne({ email });
      if (!pending) return ErrorHandler.ValidationError(set, 'No pending registration for this email');

  const clientOrigin = Bun.env.ACTIVE_CLIENT_ORIGIN || Bun.env.ACTIVE_API_ORIGIN || 'http://localhost:5173';
  const confirmUrl = `${clientOrigin.replace(/\/$/, '')}/confirm?token=${encodeURIComponent(pending.token)}`;
  const html = await renderConfirm({ name: pending.payload?.fullName || pending.payload?.name || 'User', confirmUrl });
  await EmailHandler.send(email, `Confirm your email for ${Bun.env.PLATFORM_NAME}`, html);

  return { success: true };
    } catch (error) {
      return ErrorHandler.ServerError(set, 'Error resending confirmation', error);
    }
  });

export default resendConfirm;
