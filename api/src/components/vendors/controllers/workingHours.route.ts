import Elysia from "elysia";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Vendor } from "../_model";
import { VendorValidator } from "../_setup";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type Day = typeof daysOfWeek[number];

const workingHoursRoute = new Elysia()
  .use(isSessionAuth("vendor"))
  .get("/working-hours", async ({ set, session }) => {
    try {
      const vendor = await Vendor.findOne({ sessionClientId: session._id });
      if (!vendor) return ErrorHandler.ValidationError(set, "Vendor not found");

      // Ensure defaults exist if missing
      if (!vendor.workingHours || (vendor.workingHours as any).size === 0) {
        const defaults: Record<Day, any> = {
          Monday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
          Tuesday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
          Wednesday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
          Thursday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
          Friday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
          Saturday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
          Sunday: { isOpen: true, startTime: "09:00", closingTime: "18:00" },
        };
        vendor.workingHours = defaults as any;
        await vendor.save();
      }

      // Convert Map to plain object if needed
      const result = vendor.workingHours instanceof Map
        ? Object.fromEntries(vendor.workingHours as any)
        : (vendor.workingHours as any);

      return SuccessHandler(set, "Working hours retrieved", { workingHours: result }, true);
    } catch (error) {
      throw ErrorHandler.ServerError(set, "Error fetching working hours", error);
    }
  })
  .put("/working-hours", async ({ set, session, body }) => {
    try {
      const vendor = await Vendor.findOne({ sessionClientId: session._id });
      if (!vendor) return ErrorHandler.ValidationError(set, "Vendor not found");

      const payload = (body as any).workingHours as Record<string, { isOpen: boolean; startTime: string; closingTime: string }>;
      if (!payload || typeof payload !== "object") {
        return ErrorHandler.ValidationError(set, "Invalid working hours payload");
      }

      // Sanitize and keep only known days
      const sanitized: Record<string, any> = {};
      for (const day of daysOfWeek) {
        const v = payload[day];
        if (v) {
          sanitized[day] = {
            isOpen: !!v.isOpen,
            startTime: String(v.startTime || "09:00"),
            closingTime: String(v.closingTime || "18:00"),
          };
        }
      }

      vendor.workingHours = sanitized as any;
      await vendor.save();

      return SuccessHandler(set, "Working hours updated", { workingHours: sanitized }, true);
    } catch (error) {
      throw ErrorHandler.ServerError(set, "Error updating working hours", error);
    }
  }, VendorValidator.updateWorkingHours);

export default workingHoursRoute;
