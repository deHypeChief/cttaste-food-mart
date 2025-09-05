import Elysia from "elysia";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Vendor } from "../_model";
import { VendorValidator } from "../_setup";

const updateVendorProfile = new Elysia()
    .use(isSessionAuth("vendor"))
    .put("/profile", async ({ set, session, body }) => {
        try {
            // session is the SessionClient document injected by isSessionAuth
            const vendor = await Vendor.findOne({ sessionClientId: session._id });
            
            if (!vendor) {
                return ErrorHandler.ValidationError(set, "Vendor not found");
            }

            (Object.keys(body) as Array<keyof typeof body>).forEach((key) => {
                const value = body[key];
                if (value !== undefined) {
                    vendor.set(key as string, value as any);
                }
            });

            await vendor.save();

            return SuccessHandler(set, "Vendor profile updated successfully", {
                vendor
            }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, "Error updating vendor profile", error);
        }
    }, VendorValidator.updateProfile)
    .put("/business-settings", async ({ set, session, body }) => {
        try {
            // session is the SessionClient document injected by isSessionAuth
            const vendor = await Vendor.findOne({ sessionClientId: session._id });
            
            if (!vendor) {
                return ErrorHandler.ValidationError(set, "Vendor not found");
            }

            // Debug: log incoming business-settings body to help trace persistence issues
            try {
                // eslint-disable-next-line no-console
                console.info('[Vendor][business-settings] incoming payload:', JSON.stringify(body));
            } catch { /* ignore logging errors */ }

            // If deliveryLocations provided, set it explicitly to ensure proper array storage
            if ((body as any).deliveryLocations !== undefined) {
                try {
                    const dl = (body as any).deliveryLocations;
                    if (Array.isArray(dl)) {
                        vendor.deliveryLocations = dl.map((d: any) => ({ location: String(d.location || ''), price: Number(d.price || 0) }));
                    }
                } catch { /* ignore coercion errors */ }
            }

            Object.keys(body as any).forEach((key) => {
                const value = (body as any)[key];
                if (value !== undefined && key !== 'deliveryLocations') {
                    vendor.set(key as string, value);
                }
            });

            await vendor.save();

            return SuccessHandler(set, "Business settings updated successfully", {
                vendor
            }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, "Error updating business settings", error);
        }
    }, VendorValidator.updateBusinessSettings)
    .put("/operational-settings", async ({ set, session, body }) => {
        try {
            // session is the SessionClient document injected by isSessionAuth
            const vendor = await Vendor.findOne({ sessionClientId: session._id });
            
            if (!vendor) {
                return ErrorHandler.ValidationError(set, "Vendor not found");
            }

            Object.keys(body as any).forEach((key) => {
                const value = (body as any)[key];
                if (value !== undefined) {
                    vendor.set(key as string, value);
                }
            });

            await vendor.save();

            return SuccessHandler(set, "Operational settings updated successfully", {
                vendor
            }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, "Error updating operational settings", error);
        }
    }, VendorValidator.updateOperationalSettings)
    // Upload banner image (multipart/form-data)
    .post('/banner', async ({ set, session, request }) => {
        try {
            const vendor = await Vendor.findOne({ sessionClientId: session._id });
            if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

            const formData = await request.formData();
            const file = formData.get('image') as File;
            if (!file) return ErrorHandler.ValidationError(set, 'Image file is required');

            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            if (file.size > MAX_SIZE) {
                return ErrorHandler.ValidationError(set, 'Banner exceeds 5MB limit');
            }

            // Allow common image types and HEIC/HEIF (browsers may omit MIME for HEIC)
            const allowed = [
                'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif',
                'image/heic-sequence', 'image/heif-sequence', 'image/avif'
            ];
            if (file.type && !allowed.includes(file.type.toLowerCase())) {
                const name = (file.name || '').toLowerCase();
                if (!(name.endsWith('.heic') || name.endsWith('.heif') || name.endsWith('.avif'))) {
                    return ErrorHandler.ValidationError(set, 'Unsupported image format');
                }
            }

            // Lazy import cloudinary config to avoid top-level dependency here
            const cloudinary = (await import('../../../configs/cloudinary.config')).default;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const upload = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'cttaste/vendors/banner', transformation: [{ width: 1600, height: 600, crop: 'limit', fetch_format: 'auto', quality: 'auto' }], resource_type: 'auto' },
                    (error, result) => {
                        if (error) reject(error); else resolve(result);
                    }
                ).end(buffer);
            });

            vendor.banner = (upload as any).secure_url;
            await vendor.save();
            return SuccessHandler(set, 'Banner updated', { vendor }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, 'Error uploading banner', error);
        }
    })
    // Upload avatar/logo image (multipart/form-data)
    .post('/avatar', async ({ set, session, request }) => {
        try {
            const vendor = await Vendor.findOne({ sessionClientId: session._id });
            if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');

            const formData = await request.formData();
            const file = formData.get('image') as File;
            if (!file) return ErrorHandler.ValidationError(set, 'Image file is required');

            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            if (file.size > MAX_SIZE) {
                return ErrorHandler.ValidationError(set, 'Avatar exceeds 5MB limit');
            }

            const allowed2 = [
                'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif',
                'image/heic-sequence', 'image/heif-sequence', 'image/avif'
            ];
            if (file.type && !allowed2.includes(file.type.toLowerCase())) {
                const name2 = (file.name || '').toLowerCase();
                if (!(name2.endsWith('.heic') || name2.endsWith('.heif') || name2.endsWith('.avif'))) {
                    return ErrorHandler.ValidationError(set, 'Unsupported image format');
                }
            }

            const cloudinary = (await import('../../../configs/cloudinary.config')).default;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const upload = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'cttaste/vendors/avatar', transformation: [{ width: 300, height: 300, crop: 'limit', fetch_format: 'auto', quality: 'auto' }], resource_type: 'auto' },
                    (error, result) => { if (error) reject(error); else resolve(result); }
                ).end(buffer);
            });

            vendor.avatar = (upload as any).secure_url;
            await vendor.save();
            return SuccessHandler(set, 'Avatar updated', { vendor }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, 'Error uploading avatar', error);
        }
    })
    // Delete vendor account
    .delete('/delete', async ({ set, session }) => {
        try {
            const vendor = await Vendor.findOneAndDelete({ sessionClientId: session._id });
            if (!vendor) return ErrorHandler.ValidationError(set, 'Vendor not found');
            return SuccessHandler(set, 'Vendor account deleted', { vendorId: vendor._id }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, 'Error deleting vendor account', error);
        }
    })

export default updateVendorProfile;
