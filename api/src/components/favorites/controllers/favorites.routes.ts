import Elysia, { t } from 'elysia';
import mongoose from 'mongoose';
import { isSessionAuth } from '../../../middleware/authSession.middleware';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { Favorite } from '../_model';

const validators = {
  toggle: {
    body: t.Object({ vendorId: t.String({ minLength: 1 }) }),
    detail: { tags: ['Favorites'] }
  }
};

const favoritesRoutes = new Elysia({ prefix: '/favorites' })
  .use(isSessionAuth('user'))
  .get('/', async ({ set, session }) => {
    try {
      const userId = new mongoose.Types.ObjectId(session._id);
      const items = await Favorite.find({ userId })
        .populate('vendorId', 'restaurantName vendorType description avatar banner location isApproved isActive')
        .sort({ createdAt: -1 });
      return SuccessHandler(set, 'Favorites fetched', { items });
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error fetching favorites', error);
    }
  })
  .post('/toggle', async ({ set, session, body }) => {
    try {
      const userId = new mongoose.Types.ObjectId(session._id);
      const vendorId = new mongoose.Types.ObjectId((body as any).vendorId);
      const found = await Favorite.findOne({ userId, vendorId });
      if (found) {
        await Favorite.deleteOne({ _id: found._id });
        return SuccessHandler(set, 'Removed from favorites', { favorited: false }, true);
      } else {
        await Favorite.create({ userId, vendorId });
        return SuccessHandler(set, 'Added to favorites', { favorited: true }, true);
      }
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error toggling favorite', error);
    }
  }, validators.toggle);

export default favoritesRoutes;
