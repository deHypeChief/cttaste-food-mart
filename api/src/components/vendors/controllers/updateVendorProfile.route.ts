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

            Object.keys(body as any).forEach((key) => {
                const value = (body as any)[key];
                if (value !== undefined) {
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

            // Lazy import cloudinary config to avoid top-level dependency here
            const cloudinary = (await import('../../../configs/cloudinary.config')).default;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const upload = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'cttaste/vendors/banner', transformation: [{ width: 1600, height: 600, crop: 'limit' }], resource_type: 'image' },
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

            const cloudinary = (await import('../../../configs/cloudinary.config')).default;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const upload = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'cttaste/vendors/avatar', transformation: [{ width: 300, height: 300, crop: 'limit' }], resource_type: 'image' },
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
