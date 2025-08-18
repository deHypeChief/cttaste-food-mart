import Elysia from "elysia";
import registerVendor from "./controllers/registerVendor.route";
import signVendor from "./controllers/signVendor.route";
import vendorAuthStatus from "./controllers/vendorAuthStatus.route";
import updateVendorProfile from "./controllers/updateVendorProfile.route";
import workingHoursRoute from "./controllers/workingHours.route";
import vendorPasswordChange from "./controllers/passwordChange.route";
import listVendors from "./controllers/listVendors.route";
import commentsRoute from "./controllers/comments.route";

const vendorPlugin = new Elysia({
    prefix: "/vendors"
})
    .use(registerVendor)
    .use(signVendor)
    .use(vendorAuthStatus)
    .use(updateVendorProfile)
    .use(vendorPasswordChange)
    .use(workingHoursRoute)
    .use(listVendors)
    .use(commentsRoute)

export default vendorPlugin
