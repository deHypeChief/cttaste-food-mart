import Elysia, { t } from 'elysia';
import mongoose from 'mongoose';
import { isSessionAuth } from '../../../middleware/authSession.middleware';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { Cart } from '../_model';

const CartValidators = {
  addItem: {
    body: t.Object({
      vendorId: t.String({ minLength: 1 }),
      menuItemId: t.String({ minLength: 1 }),
      name: t.String({ minLength: 1 }),
      price: t.Number(),
      image: t.Optional(t.String()),
      quantity: t.Optional(t.Number({ minimum: 1 }))
    }),
    detail: { tags: ['Cart'] }
  },
  updateQty: {
    params: t.Object({ menuItemId: t.String() }),
    body: t.Object({ quantity: t.Number({ minimum: 0 }) }),
    detail: { tags: ['Cart'] }
  },
};

function computeCountAndTotal(items: any[]) {
  const count = items.reduce((acc, it) => acc + Number(it.quantity || 0), 0);
  const total = items.reduce((acc, it) => acc + Number(it.quantity || 0) * Number(it.price || 0), 0);
  return { count, total };
}

const cartRoutes = new Elysia({ prefix: '/cart' })
  .use(isSessionAuth('user'))
  .get('/', async ({ set, session }) => {
    try {
      const userId = new mongoose.Types.ObjectId(session._id);
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = await Cart.create({ userId, items: [] });
      }
      const { count, total } = computeCountAndTotal(cart.items);
      return SuccessHandler(set, 'Cart fetched', { cart, count, total });
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error fetching cart', error);
    }
  })
  .post('/items', async ({ set, session, body }) => {
    try {
      const { vendorId, menuItemId, name, price, image, quantity } = body as any;
      const userId = new mongoose.Types.ObjectId(session._id);
      const mVendorId = new mongoose.Types.ObjectId(vendorId);
      const mMenuItemId = new mongoose.Types.ObjectId(menuItemId);
      let cart = await Cart.findOne({ userId });
      if (!cart) cart = await Cart.create({ userId, items: [] });

      const idx = cart.items.findIndex(it => it.menuItemId.toString() === mMenuItemId.toString());
      if (idx >= 0) {
        cart.items[idx].quantity += Number(quantity || 1);
        // optionally refresh name/price/image snapshot on add
        cart.items[idx].name = name;
        cart.items[idx].price = Number(price);
        if (image) cart.items[idx].image = image;
      } else {
        cart.items.push({ vendorId: mVendorId, menuItemId: mMenuItemId, name, price: Number(price), quantity: Number(quantity || 1), image });
      }
      await cart.save();
      const { count, total } = computeCountAndTotal(cart.items);
      return SuccessHandler(set, 'Item added to cart', { cart, count, total }, true);
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error adding to cart', error);
    }
  }, CartValidators.addItem)
  .patch('/packs', async ({ set, session, body }) => {
    try {
      const userId = new mongoose.Types.ObjectId(session._id);
      const { packsByVendor, assignments, packItemQuantities } = body as any;
      let cart = await Cart.findOne({ userId });
      if (!cart) cart = await Cart.create({ userId, items: [] });
      if (typeof packsByVendor !== 'undefined') cart.packsByVendor = packsByVendor || {};
      if (typeof assignments !== 'undefined') cart.assignments = assignments || {};
      if (typeof packItemQuantities !== 'undefined') cart.packItemQuantities = packItemQuantities || {};
      await cart.save();
      const { count, total } = computeCountAndTotal(cart.items);
      return SuccessHandler(set, 'Cart packs updated', { cart, count, total });
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error updating cart packs', error);
    }
  })
  .patch('/items/:menuItemId', async ({ set, session, params, body }) => {
    try {
      const userId = new mongoose.Types.ObjectId(session._id);
      const menuItemId = new mongoose.Types.ObjectId((params as any).menuItemId);
      const quantity = Number((body as any).quantity);
      const cart = await Cart.findOne({ userId });
      if (!cart) return ErrorHandler.ValidationError(set, 'Cart not found');

      const idx = cart.items.findIndex(it => it.menuItemId.toString() === menuItemId.toString());
      if (idx < 0) return ErrorHandler.ValidationError(set, 'Item not in cart');

      if (quantity <= 0) {
        cart.items.splice(idx, 1);
      } else {
        cart.items[idx].quantity = quantity;
      }
      await cart.save();
      const { count, total } = computeCountAndTotal(cart.items);
      return SuccessHandler(set, 'Cart updated', { cart, count, total });
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error updating cart item', error);
    }
  }, CartValidators.updateQty)
  .delete('/items/:menuItemId', async ({ set, session, params }) => {
    try {
      const userId = new mongoose.Types.ObjectId(session._id);
      const menuItemId = new mongoose.Types.ObjectId((params as any).menuItemId);
      const cart = await Cart.findOne({ userId });
      if (!cart) return ErrorHandler.ValidationError(set, 'Cart not found');
      cart.items = cart.items.filter(it => it.menuItemId.toString() !== menuItemId.toString());
      await cart.save();
      const { count, total } = computeCountAndTotal(cart.items);
      return SuccessHandler(set, 'Item removed', { cart, count, total });
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error removing cart item', error);
    }
  })
  .delete('/', async ({ set, session }) => {
    try {
      const userId = new mongoose.Types.ObjectId(session._id);
      let cart = await Cart.findOne({ userId });
      if (!cart) cart = await Cart.create({ userId, items: [] });
      cart.items = [];
      await cart.save();
      const { count, total } = computeCountAndTotal(cart.items);
      return SuccessHandler(set, 'Cart cleared', { cart, count, total });
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error clearing cart', error);
    }
  });

export default cartRoutes;
