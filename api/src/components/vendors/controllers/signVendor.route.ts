import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import { SessionClient } from "../../auth/_model";
import SuccessHandler from "../../../services/successHandler.service";
import AuthHandler from "../../../services/authHandler.service";
import { jwtSessionAccess, jwtSessionRefresh } from "../../../middleware/jwt.middleware";
import { VendorValidator } from "../_setup";
import { Vendor } from "../_model";

const signVendor = new Elysia()
    .use(jwtSessionAccess)
    .use(jwtSessionRefresh)
    .post("/sign", async ({
        cookie: { sessionAccess, sessionRefresh },
        request,
        sessionAccessJwt,
        sessionRefreshJwt,
        headers,
        set,
        body
    }) => {
        try {
            const { email, password } = body;

            const checkVendor = await SessionClient.findOne({ 
                email,
                role: { $in: ["vendor"] }
            })
            
            if (!checkVendor) {
                return ErrorHandler.ValidationError(set, "Invalid credentials")
            }

            const checkPassword = await checkVendor.comparePassword(password)
            if (!checkPassword) {
                return ErrorHandler.ValidationError(set, "Invalid credentials")
            }

            const vendor = await Vendor.findOne({ sessionClientId: checkVendor._id })
            if (!vendor) {
                return ErrorHandler.ValidationError(set, "Invalid credentials")
            }

            // Note: Allow login even if not approved - they can access dashboard but can't sell

            // set cookies
            await AuthHandler.signSession(
                set,
                checkVendor,
                request,
                headers,
                sessionAccess,
                sessionRefresh,
                sessionAccessJwt,
                sessionRefreshJwt
            )

            return SuccessHandler(
                set,
                "Vendor signed in successfully",
                {
                    vendor: {
                        ...vendor.toObject(),
                        sessionClient: {
                            _id: checkVendor._id,
                            email: checkVendor.email,
                            fullName: checkVendor.fullName,
                            role: checkVendor.role
                        }
                    }
                },
                true
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error signing in vendor",
                error
            );
        }
    }, VendorValidator.login)

export default signVendor;
