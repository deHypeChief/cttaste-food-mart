import Elysia, { t } from 'elysia';
import { isSessionAuth } from '../../../middleware/authSession.middleware';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { Vendor } from '../../vendors/_model';

const vendorsModeration = new Elysia()
  .use(isSessionAuth('admin'))
  // List vendors for moderation
  .get('/vendors', async ({ set, query }) => {
    try {
      const { status } = query as { status?: 'pending' | 'approved' | 'all' };
      const filter: any = {};
      if (status === 'pending') filter.isApproved = false;
      else if (status === 'approved') filter.isApproved = true;
      // status 'all' or undefined => no isApproved filter

      const items = await Vendor.find(filter).sort({ createdAt: -1 });
      return SuccessHandler(set, 'Vendors fetched', { items }, true);
    } catch (err) {
      throw ErrorHandler.ServerError(set, 'Error fetching vendors', err);
    }
  }, {
    query: t.Object({ status: t.Optional(t.Union([t.Literal('pending'), t.Literal('approved'), t.Literal('all')])) })
  })
  // Approve/Unapprove a vendor
  .patch('/vendors/:id/approve', async ({ set, params, body }) => {
    try {
      const { id } = params as { id: string };
      const { isApproved = true } = body as { isApproved?: boolean };
      const vendor = await Vendor.findByIdAndUpdate(id, { isApproved }, { new: true });
      if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');
      return SuccessHandler(set, `Vendor ${isApproved ? 'approved' : 'unapproved'}`, { vendor }, true);
    } catch (err) {
      throw ErrorHandler.ServerError(set, 'Error updating vendor approval', err);
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({ isApproved: t.Optional(t.Boolean()) })
  });

export default vendorsModeration;
