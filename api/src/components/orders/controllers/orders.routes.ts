import Elysia, { t } from 'elysia';
import { isSessionAuth } from '../../../middleware/authSession.middleware';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { Order } from '../_model';
import { Vendor } from '../../vendors/_model';
import EmailHandler from '../../../services/emailHandler.service';
import { orderNotification } from '../../../emails/orderNotification.template';
import { signIn } from '../../../emails/signIn.template';
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
  deliveryMode: t.Optional(t.Union([t.Literal('pickup'), t.Literal('doorstep')])),
  deliveryLocation: t.Optional(t.String()),
  deliveryPrice: t.Optional(t.Number()),
  deliveryInstructions: t.Optional(t.String()),
  guestName: t.Optional(t.String()),
  guestPhone: t.Optional(t.String()),
      notes: t.Optional(t.String())
    }),
    detail: { tags: ['Orders'] }
  }
}

const ordersRoutes = new Elysia({ prefix: '/orders' })
  // Place an order (user) - scoped auth to this route only
  .group('', (app) => app
    .use(isSessionAuth('user'))
    // User: list own orders
    .get('/', async ({ set, session, query }) => {
      try {
        const userId = session._id;
        const status = (query as any)?.status as string | undefined;
        const filter: any = { userId: userId };
        if (status) filter.status = status;

        const orders = await Order.find(filter)
          .sort({ createdAt: -1 })
          .populate({ path: 'vendorId', select: 'restaurantName avatar' });

        // Map vendor name into response for frontend convenience (prefer stored values)
        const mapped = orders.map((o: any) => ({
          id: o._id,
          orderNumber: o.orderNumber,
          vendorId: o.vendorId?._id,
          vendorName: o.vendorName || o.vendorId?.restaurantName,
          vendorAvatar: o.vendorAvatar || o.vendorId?.avatar,
          items: o.items,
          total: o.total,
          address: o.address,
          status: o.status,
          createdAt: o.createdAt,
        }));

        return SuccessHandler(set, 'User orders fetched', { orders: mapped }, true);
      } catch (error) {
        throw ErrorHandler.ServerError(set, 'Error fetching user orders', error);
      }
    })
    .post('/', async ({ set, body, session }) => {
    try {
  const { vendorId, items, address, notes, deliveryMode, deliveryLocation, deliveryPrice, deliveryInstructions } = body as any;

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

      const total = items.reduce((sum: number, it: any) => sum + (Number(it.price) * Number(it.quantity)), 0);

      const order = await Order.create({
        orderNumber: generateOrderNumber(),
  vendorId: new mongoose.Types.ObjectId(vendorId),
  vendorName: vendor.restaurantName,
  vendorAvatar: vendor.avatar,
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
        deliveryMode: deliveryMode || 'pickup',
        deliveryLocation,
        deliveryPrice: typeof deliveryPrice === 'number' ? deliveryPrice : undefined,
        deliveryInstructions,
        status: 'Pending',
        notes,
      });

      // Send vendor email if vendor allows order notifications and email notifications
      try {
  if (vendor.orderNotifications && vendor.emailNotifications) {
          const sessionClient = await (await import('../../auth/_model')).SessionClient.findById(vendor.sessionClientId);
          const vendorEmail = sessionClient?.email || null;
          if (vendorEmail) {
            const template = await orderNotification({
              orderNumber: order.orderNumber,
              vendorName: vendor.restaurantName,
              customerName: (session && session.fullName) || 'Customer',
              total: order.total,
                items: order.items.map((it: any) => ({ name: it.name, quantity: it.quantity, price: it.price })),
                orderId: String(order._id)
            });
            EmailHandler.send(vendorEmail, `New order ${order.orderNumber}`, template).catch(() => { /* swallow email errors */ });
          }
        }

  // NOTE: we intentionally send order notification to the vendor only.
  // Customer-facing emails are omitted here per requirement.
      } catch (e) {
        // ignore notification errors to avoid breaking order creation
      }

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

  // Public endpoint to place guest orders (no user session required)
  ordersRoutes.post('/guest', async ({ set, body }) => {
    try {
      const { vendorId, items, address, notes, deliveryMode, deliveryLocation, deliveryPrice, deliveryInstructions, guestName, guestPhone } = body as any;

      if (!vendorId) return ErrorHandler.ValidationError(set, 'vendorId is required');
      if (!Array.isArray(items) || !items.length) return ErrorHandler.ValidationError(set, 'items are required');
      if (!address || !String(address).trim()) return ErrorHandler.ValidationError(set, 'address is required');
      if (!guestName || !String(guestName).trim() || !guestPhone || !String(guestPhone).trim()) return ErrorHandler.ValidationError(set, 'guestName and guestPhone are required');

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

      const total = items.reduce((sum: number, it: any) => sum + (Number(it.price) * Number(it.quantity)), 0);

      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        vendorId: new mongoose.Types.ObjectId(vendorId),
        vendorName: vendor.restaurantName,
        vendorAvatar: vendor.avatar,
        // guest fields
        guestName: guestName,
        guestPhone: guestPhone,
        items: items.map((i: any) => ({
          menuItemId: new mongoose.Types.ObjectId(i.menuItemId),
          name: i.name,
          price: Number(i.price),
          quantity: Number(i.quantity),
          image: i.image,
        })),
        total,
        address,
        deliveryMode: deliveryMode || 'pickup',
        deliveryLocation,
        deliveryPrice: typeof deliveryPrice === 'number' ? deliveryPrice : undefined,
        deliveryInstructions,
        status: 'Pending',
        notes,
      });

      // Send vendor email notification if configured (use guestName)
      try {
        if (vendor.orderNotifications && vendor.emailNotifications) {
          const sessionClient = await (await import('../../auth/_model')).SessionClient.findById(vendor.sessionClientId);
          const vendorEmail = sessionClient?.email || null;
          if (vendorEmail) {
            const template = await orderNotification({
              orderNumber: order.orderNumber,
              vendorName: vendor.restaurantName,
              customerName: guestName || 'Guest',
              total: order.total,
              items: order.items.map((it: any) => ({ name: it.name, quantity: it.quantity, price: it.price })),
              orderId: String(order._id)
            });
            EmailHandler.send(vendorEmail, `New order ${order.orderNumber}`, template).catch(() => { /* swallow email errors */ });
          }
        }
      } catch (e) {
        // ignore notification errors
      }

      return SuccessHandler(set, 'Order placed successfully', { order }, true);
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error placing guest order', error);
    }
  }, OrdersValidator.place);

// Public order endpoints (quick preview links used in WhatsApp messages)
const publicOrders = new Elysia({ prefix: '/orders/public' })
  .get('/:id', async ({ set, params }) => {
    try {
      const { id } = params as any;
      const order = await Order.findById(id).populate({ path: 'vendorId', select: 'restaurantName avatar phoneNumber' });
      if (!order) return ErrorHandler.ValidationError(set, 'Order not found');
      return SuccessHandler(set, 'Order preview', { order }, true);
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error fetching public order', error);
    }
  })
  .put('/:id/status', async ({ set, params, body }) => {
    // Legacy public status endpoint left intentionally open for read-only preview.
    // For security, we now require vendor session and ownership on status updates — see /orders/vendor/:id/status.
    return ErrorHandler.UnauthorizedError(set, 'Use vendor-scoped status update endpoint');
  });

// Protect public status update by requiring vendor session and ownership.
const publicStatusProtected = new Elysia()
  .use(isSessionAuth('vendor'))
  .put('/orders/public/:id/status', async ({ set, params, body, session, sessionClient }) => {
    try {
      const vendor = await (await import('../../vendors/_model')).Vendor.findOne({ sessionClientId: session._id });
      if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

      const { id } = params as any;
      const { status } = body as any;
      const allowed = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
      if (!allowed.includes(status)) return ErrorHandler.ValidationError(set, 'Invalid status');

      const order = await Order.findOneAndUpdate({ _id: id, vendorId: vendor._id }, { status }, { new: true });
      if (!order) return ErrorHandler.ValidationError(set, 'Order not found');

      return SuccessHandler(set, 'Order status updated', { order }, true);
    } catch (error) {
      throw ErrorHandler.ServerError(set, 'Error updating public order status', error);
    }
  });

export { publicOrders, publicStatusProtected };

export default ordersRoutes;
