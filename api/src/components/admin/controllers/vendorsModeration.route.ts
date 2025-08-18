import Elysia, { t } from 'elysia';
import { isSessionAuth } from '../../../middleware/authSession.middleware';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { Vendor } from '../../vendors/_model';

const vendorsModeration = new Elysia()
  .use(isSessionAuth('admin'))
  // List vendors for moderation with search + pagination
  .get('/vendors', async ({ set, query }) => {
    try {
      const { status, search, page = '1', limit = '20' } = query as {
        status?: 'pending' | 'approved' | 'all';
        search?: string;
        page?: string;
        limit?: string;
      };

      const filter: any = {};
      if (status === 'pending') filter.isApproved = false;
      else if (status === 'approved') filter.isApproved = true;

      if (search && search.trim()) {
        const rx = new RegExp(search.trim(), 'i');
        filter.$or = [
          { restaurantName: { $regex: rx } },
          { ownerName: { $regex: rx } },
          { location: { $regex: rx } },
        ];
      }

      const pageNum = Math.max(parseInt(page) || 1, 1);
      const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

      const [items, total] = await Promise.all([
        Vendor.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
        Vendor.countDocuments(filter),
      ]);

      return SuccessHandler(
        set,
        'Vendors fetched',
        {
          items,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
        true
      );
    } catch (err) {
      throw ErrorHandler.ServerError(set, 'Error fetching vendors', err);
    }
  }, {
    query: t.Object({
      status: t.Optional(t.Union([t.Literal('pending'), t.Literal('approved'), t.Literal('all')])),
      search: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    })
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
