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

            const now = new Date();
            const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., 'Monday'

            const pageNum = Math.max(parseInt(page) || 1, 1);
            const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

            const [items, total] = await Promise.all([
                Vendor.find(filter)
                    .select('restaurantName vendorType description avatar banner location isActive isApproved workingHours deliveryLocations')
                    .sort({ createdAt: -1 })
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum),
                Vendor.countDocuments(filter)
            ]);
            // Compute isCurrentlyOpen for each vendor and return full list (don't remove closed vendors)
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const parseMinutes = (timeStr = '00:00') => {
                const [hh, mm] = (timeStr || '00:00').split(':').map(s => parseInt(s, 10) || 0);
                return hh * 60 + mm;
            };

            const itemsWithStatus = items.map(v => {
                const wh = v.workingHours?.get ? v.workingHours.get(dayName) : v.workingHours?.[dayName];
                let isCurrentlyOpen = false;
                if (wh && wh.isOpen) {
                    const start = parseMinutes(wh.startTime);
                    const end = parseMinutes(wh.closingTime);
                    if (start <= end) {
                        isCurrentlyOpen = currentMinutes >= start && currentMinutes <= end;
                    } else {
                        // Overnight
                        isCurrentlyOpen = currentMinutes >= start || currentMinutes <= end;
                    }
                }
                // Attach computed flag but don't expose workingHours by default (frontend can use other fields)
                return {
                    _id: v._id,
                    restaurantName: v.restaurantName,
                    vendorType: v.vendorType,
                    description: v.description,
                    avatar: v.avatar,
                    banner: v.banner,
                    location: v.location,
                    isActive: v.isActive,
                    isApproved: v.isApproved,
                    isCurrentlyOpen,
                };
            });

            return SuccessHandler(set, 'Vendors fetched', {
                items: itemsWithStatus,
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
            // include workingHours so we can compute current open status
            const vendor = await Vendor.findOne({ _id: id, isApproved: true, isActive: true })
                .select('restaurantName vendorType description avatar banner location isActive isApproved address cuisine workingHours phoneNumber deliveryLocations');
            if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

            // compute isCurrentlyOpen same as list logic
            const now = new Date();
            const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const parseMinutes = (timeStr = '00:00') => {
                const [hh, mm] = (timeStr || '00:00').split(':').map(s => parseInt(s, 10) || 0);
                return hh * 60 + mm;
            };
            const wh = vendor.workingHours?.get ? vendor.workingHours.get(dayName) : vendor.workingHours?.[dayName];
            let isCurrentlyOpen = false;
            if (wh && wh.isOpen) {
                const start = parseMinutes(wh.startTime);
                const end = parseMinutes(wh.closingTime);
                if (start <= end) isCurrentlyOpen = currentMinutes >= start && currentMinutes <= end;
                else isCurrentlyOpen = currentMinutes >= start || currentMinutes <= end;
            }

            const out = {
                _id: vendor._id,
                restaurantName: vendor.restaurantName,
                vendorType: vendor.vendorType,
                description: vendor.description,
                avatar: vendor.avatar,
                banner: vendor.banner,
                location: vendor.location,
                isActive: vendor.isActive,
                isApproved: vendor.isApproved,
                address: vendor.address,
                cuisine: vendor.cuisine,
                phoneNumber: (vendor as any).phoneNumber,
                deliveryLocations: (vendor as any).deliveryLocations || [],
                isCurrentlyOpen,
            };

            return SuccessHandler(set, 'Vendor fetched', { vendor: out }, true);
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
