import Elysia, { t } from 'elysia';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { Vendor } from '../_model';

const commentsRoute = new Elysia()
  // List comments for a vendor (public)
  .get('/:id/comments', async ({ set, params }) => {
    try {
      const { id } = params as { id: string };
      const vendor = await Vendor.findOne({ _id: id, isApproved: true, isActive: true })
        .select('reviews restaurantName');
      if (!vendor) return ErrorHandler.NotFoundError(set, 'Vendor not found');

      // Sort newest first
      const items = (vendor.reviews || []).slice().sort((a: any, b: any) => {
        return new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime();
      });
      return SuccessHandler(set, 'Comments fetched', { items, total: items.length }, true);
    } catch (err) {
      throw ErrorHandler.ServerError(set, 'Error fetching comments', err);
    }
  })
  // Add a comment to a vendor (public for now)
  .post('/:id/comments', async ({ set, params, body }) => {
    try {
      const { id } = params as { id: string };
      const { userName, rating, comment } = body as { userName: string; rating: number; comment: string };

      if (!userName || !comment) return ErrorHandler.ValidationError(set, 'Name and comment are required');
      const rate = Number(rating);
      if (!Number.isFinite(rate) || rate < 1 || rate > 5) return ErrorHandler.ValidationError(set, 'Rating must be between 1 and 5');

      const vendor = await Vendor.findOne({ _id: id, isApproved: true, isActive: true });
      if (!vendor) return ErrorHandler.NotFoundError(set, 'Vendor not found');

      vendor.reviews = vendor.reviews || [];
      vendor.reviews.push({ userName, rating: rate, comment, createdAt: new Date() } as any);
      await vendor.save();

      return SuccessHandler(set, 'Comment added', { ok: true }, true);
    } catch (err) {
      throw ErrorHandler.ServerError(set, 'Error adding comment', err);
    }
  }, {
    body: t.Object({
      userName: t.String({ minLength: 1 }),
      rating: t.Number(),
      comment: t.String({ minLength: 1 })
    })
  });

export default commentsRoute;
