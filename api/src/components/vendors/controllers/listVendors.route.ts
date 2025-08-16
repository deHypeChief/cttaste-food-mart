import Elysia, { t } from 'elysia';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { Vendor } from '../_model';
import { MenuItem } from '../../menu/_model';

const listVendors = new Elysia()
    // Public listing: available (active + approved) vendors, with optional filters
    .get('/', async ({ set, query }) => {
        try {
            const { location, vendorType, search, page = '1', limit = '20' } = query as Record<string, string>;

            const filter: any = { isActive: true, isApproved: true };
            if (location) filter.location = { $regex: new RegExp(location, 'i') };
            if (vendorType && vendorType !== 'All') filter.vendorType = vendorType;
            if (search) filter.restaurantName = { $regex: new RegExp(search, 'i') };

            const pageNum = Math.max(parseInt(page) || 1, 1);
            const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

            const [items, total] = await Promise.all([
                Vendor.find(filter)
                    .select('restaurantName vendorType description avatar banner location isActive isApproved')
                    .sort({ createdAt: -1 })
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum),
                Vendor.countDocuments(filter)
            ]);

            return SuccessHandler(set, 'Vendors fetched', {
                items,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum) || 1
            }, true);
        } catch (err) {
            throw ErrorHandler.ServerError(set, 'Error fetching vendors', err);
        }
    }, {
        query: t.Object({
            location: t.Optional(t.String()),
            vendorType: t.Optional(t.String()),
            search: t.Optional(t.String()),
            page: t.Optional(t.String()),
            limit: t.Optional(t.String())
        })
    });

    // Public vendor details by ID (only if approved and active)
    listVendors.get('/:id', async ({ set, params }) => {
        try {
            const { id } = params as { id: string };
            const vendor = await Vendor.findOne({ _id: id, isApproved: true, isActive: true })
                .select('restaurantName vendorType description avatar banner location isActive isApproved address cuisine');
            if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');
            return SuccessHandler(set, 'Vendor fetched', { vendor }, true);
        } catch (err) {
            throw ErrorHandler.ServerError(set, 'Error fetching vendor', err);
        }
    });

    // Public vendor menu by vendor ID (only active & Available items)
    listVendors.get('/:id/menu', async ({ set, params }) => {
        try {
            const { id } = params as { id: string };
            const items = await MenuItem.find({ vendorId: id, isActive: true, status: 'Available' })
                .sort({ createdAt: -1 });
            return SuccessHandler(set, 'Menu fetched', { items }, true);
        } catch (err) {
            throw ErrorHandler.ServerError(set, 'Error fetching menu', err);
        }
    });

export default listVendors;
