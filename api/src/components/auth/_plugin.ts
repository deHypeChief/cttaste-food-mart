import Elysia from "elysia";
import getSessions from "./controllers/getSessions.route";
import { adminAuthStatus, userAuthStatus } from "./controllers/authStatus.route";
import vendorAuthStatus from "../vendors/controllers/vendorAuthStatus.route";
import manageOTP from "./controllers/otp.routes";
import logout from "./controllers/logout.route";
import confirmRegistration from "./controllers/confirmRegistration.route";
import resendConfirm from "./controllers/resendConfirm.route";

const authPlugin = new Elysia({
    prefix: "/auth"
})
    // Public auth routes first (no session middleware)
    .use(confirmRegistration)
    .use(resendConfirm)
    // Protected or session-aware routes
    .use(getSessions)
    .use(adminAuthStatus)
    .use(userAuthStatus)
    .use(vendorAuthStatus)
    .use(manageOTP)
    .use(logout)

export default authPlugin