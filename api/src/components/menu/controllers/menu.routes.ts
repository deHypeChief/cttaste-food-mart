import Elysia from 'elysia';
import { isSessionAuth } from '../../../middleware/authSession.middleware';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { MenuItem } from '../_model';
import { Vendor } from '../../vendors/_model';
import cloudinary from '../../../configs/cloudinary.config';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

const menuRoutes = new Elysia({ prefix: '/menu' })
    .use(isSessionAuth('vendor'))
    // List items for this vendor
    .get('/', async ({ set, session }) => {
        try {
            const vendor = await Vendor.findOne({ sessionClientId: session._id });
            if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');
            const items = await MenuItem.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
            return SuccessHandler(set, 'Menu items fetched', { items }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, 'Error fetching menu items', error);
        }
    })
    // Create item (JSON body without image)
    .post('/', async ({ set, session, body }) => {
        try {
            const vendor = await Vendor.findOne({ sessionClientId: session._id });
            if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

            const { name, type, price, status } = body as any;
            if (!name || price === undefined) return ErrorHandler.ValidationError(set, 'Name and price are required');

            const item = await MenuItem.create({
                vendorId: vendor._id,
                name,
                type: type || '',
                price: Number(price),
                status: status || 'Available',
            });

            return SuccessHandler(set, 'Menu item created', { item }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, 'Error creating menu item', error);
        }
    })
    // Update item (JSON)
    .put('/:id', async ({ set, params, session, body }) => {
        try {
            const vendor = await Vendor.findOne({ sessionClientId: session._id });
            if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

            const { id } = params as any;
            const updates = body as any;

            const item = await MenuItem.findOneAndUpdate({ _id: id, vendorId: vendor._id }, updates, { new: true });
            if (!item) return ErrorHandler.ValidationError(set, 'Item not found');

            return SuccessHandler(set, 'Menu item updated', { item }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, 'Error updating menu item', error);
        }
    })
    // Delete item
    .delete('/:id', async ({ set, params, session }) => {
        try {
            const vendor = await Vendor.findOne({ sessionClientId: session._id });
            if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

            const { id } = params as any;
            await MenuItem.findOneAndDelete({ _id: id, vendorId: vendor._id });
            return SuccessHandler(set, 'Menu item deleted', {}, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, 'Error deleting menu item', error);
        }
    })
    // Upload or replace image for an item (multipart/form-data)
    .post('/:id/image', async ({ set, params, request, session }) => {
        try {
            const vendor = await Vendor.findOne({ sessionClientId: session._id });
            if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

            const { id } = params as any;

            console.log('Processing image upload for menu item:', id);
            
            // Get the formData from request
            const formData = await request.formData();
            const file = formData.get('image') as File;
            
            if (!file) {
                console.error('No image file found in request');
                return ErrorHandler.ValidationError(set, 'Image file is required');
            }
            
            console.log('File details:', { name: file.name, size: file.size, type: file.type });
            
            if (file.size > MAX_FILE_SIZE) {
                return ErrorHandler.ValidationError(set, 'Image exceeds 1MB limit');
            }

            // Basic MIME allowance: accept typical image types and HEIC/HEIF
            const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif'];
            if (file.type && !allowed.includes(file.type.toLowerCase())) {
                // Some browsers set empty type for HEIC/HEIF; we allow if extension present in filename
                const name = (file.name || '').toLowerCase();
                if (!(name.endsWith('.heic') || name.endsWith('.heif'))) {
                    return ErrorHandler.ValidationError(set, 'Unsupported image format');
                }
            }

            // Convert File to buffer for Cloudinary
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            console.log('Uploading to Cloudinary...');
            const upload = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                            folder: 'cttaste/menu',
                            transformation: [{ width: 800, height: 800, crop: 'limit' }],
                            // allow Cloudinary to detect/convert HEIC/HEIF by using 'auto'
                            resource_type: 'auto'
                        },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                ).end(buffer);
            });
            
            console.log('Cloudinary upload success:', (upload as any).secure_url);

            const item = await MenuItem.findOneAndUpdate(
                { _id: id, vendorId: vendor._id },
                { image: (upload as any).secure_url },
                { new: true }
            );

            if (!item) return ErrorHandler.ValidationError(set, 'Item not found');

            return SuccessHandler(set, 'Image uploaded', { item }, true);
        } catch (error) {
            console.error('Image upload error:', error);
            throw ErrorHandler.ServerError(set, 'Error uploading image', error);
        }
    });

export default menuRoutes;
