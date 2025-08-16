import Elysia from "elysia";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Vendor } from "../_model";
import { VendorValidator } from "../_setup";

const vendorAuthStatus = new Elysia()
    .use(isSessionAuth("vendor"))
    .get("/status/vendor", async ({ set, session }) => {
        try {
            // session here is the SessionClient document injected by isSessionAuth
            const vendorSessionClient = await Vendor.findOne({ sessionClientId: session._id });

            if (!vendorSessionClient) {
                throw ErrorHandler.UnauthorizedError(set, "Vendor account not found for this session");
            }

            return SuccessHandler(set, "Vendor Authenticated", {
                isAuthenticated: true,
                session,
                vendor: vendorSessionClient
            }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, "Error getting vendor status", error);
        }
    }, VendorValidator.authStatus)

export default vendorAuthStatus;
