import Elysia, { t } from 'elysia';
import { isSessionAuth } from '../../../middleware/authSession.middleware';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { Order } from '../_model';
import { Vendor } from '../../vendors/_model';
import mongoose from 'mongoose';

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OID-${ts}-${rand}`;
}

const OrdersValidator = {
  place: {
    body: t.Object({
      vendorId: t.String({ minLength: 1 }),
      items: t.Array(t.Object({
        menuItemId: t.String(),
        name: t.String(),
        price: t.Number(),
        quantity: t.Number(),
        image: t.Optional(t.String()),
      }), { minItems: 1 }),
      address: t.String({ minLength: 1 }),
      notes: t.Optional(t.String())
    }),
    detail: { tags: ['Orders'] }
  }
}

const ordersRoutes = new Elysia({ prefix: '/orders' })
  // Place an order (user) - scoped auth to this route only
  .group('', (app) => app
    .use(isSessionAuth('user'))
    .post('/', async ({ set, body, session }) => {
    try {
      const { vendorId, items, address, notes } = body as any;

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

      const total = items.reduce((sum: number, it: any) => sum + (Number(it.price) * Number(it.quantity)), 0);

      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        vendorId: new mongoose.Types.ObjectId(vendorId),
        userId: new mongoose.Types.ObjectId(session._id),
        items: items.map((i: any) => ({
          menuItemId: new mongoose.Types.ObjectId(i.menuItemId),
          name: i.name,
          price: Number(i.price),
          quantity: Number(i.quantity),
          image: i.image,
        })),
        total,
        address,
        status: 'Pending',
        notes,
      });

      return SuccessHandler(set, 'Order placed successfully', { order }, true);
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error placing order', error);
    }
  }, OrdersValidator.place))

  // Get vendor orders (vendor)
  .group('/vendor', (app) => app
    .use(isSessionAuth('vendor'))
    .get('/', async ({ set, session, query }) => {
      try {
        const vendor = await Vendor.findOne({ sessionClientId: session._id });
        if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

        const status = (query as any)?.status as string | undefined;
        const filter: any = { vendorId: vendor._id };
        if (status) filter.status = status;

        const orders = await Order.find(filter)
          .sort({ createdAt: -1 });

        return SuccessHandler(set, 'Vendor orders fetched', { orders }, true);
      } catch (error) {
        throw ErrorHandler.ServerError(set, 'Error fetching vendor orders', error);
      }
    })
    .get('/:id', async ({ set, params, session }) => {
      try {
        const vendor = await Vendor.findOne({ sessionClientId: session._id });
        if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

        const { id } = params as any;
        const order = await Order.findOne({ _id: id, vendorId: vendor._id });
        if (!order) return ErrorHandler.ValidationError(set, 'Order not found');

        return SuccessHandler(set, 'Order details fetched', { order }, true);
      } catch (error) {
        throw ErrorHandler.ServerError(set, 'Error fetching order details', error);
      }
    })
    .put('/:id/status', async ({ set, params, body, session }) => {
      try {
        const vendor = await Vendor.findOne({ sessionClientId: session._id });
        if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

        const { id } = params as any;
        const { status } = body as any;
        const allowed = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
        if (!allowed.includes(status)) return ErrorHandler.ValidationError(set, 'Invalid status');

        const order = await Order.findOneAndUpdate({ _id: id, vendorId: vendor._id }, { status }, { new: true });
        if (!order) return ErrorHandler.ValidationError(set, 'Order not found');

        return SuccessHandler(set, 'Order status updated', { order }, true);
      } catch (error) {
        throw ErrorHandler.ServerError(set, 'Error updating order status', error);
      }
    })
  );

export default ordersRoutes;
