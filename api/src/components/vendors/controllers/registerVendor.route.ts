import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import { SessionClient } from "../../auth/_model";
import { Vendor } from "../_model";
import SuccessHandler from "../../../services/successHandler.service";
import { VendorValidator } from "../_setup";
import { NotifyUser } from "../../notification/_model";
import NotificationHandler from "../../../services/notificationHandler.service";

const registerVendor = new Elysia()
    .post("/register", async ({ set, body }) => {
        const { 
            email, 
            password, 
            fullName, 
            restaurantName, 
            phoneNumber, 
            location, 
            address, 
            vendorType,
            profile,
            description,
            cuisine
        } = body;
        
        try {
            const checkEmail = await SessionClient.findOne({ email })
            if (checkEmail) {
                return ErrorHandler.ValidationError(set, "The email provided is already in use.")
            }

            const newClient = await SessionClient.create({
                email,
                password,
                fullName,
                role: ["vendor"],
                profile: profile || ""
            })

            if (!newClient) {
                return ErrorHandler.ServerError(
                    set,
                    "Error while creating vendor session"
                );
            }

            const newVendor = await Vendor.create({
                sessionClientId: newClient._id,
                restaurantName,
                phoneNumber,
                location,
                address,
                vendorType,
                description: description || "",
                cuisine: cuisine || "",
                isApproved: false,
                isActive: true
            })

            if (!newVendor) {
                await SessionClient.findByIdAndDelete(newClient._id)
                return ErrorHandler.ServerError(
                    set,
                    "Error while creating vendor profile"
                );
            }

            // Send welcome notification
            NotificationHandler.send(
                newClient._id,
                "notRead",
                `Hey ${newClient.fullName}, welcome to CTtaste! Your restaurant "${restaurantName}" is pending approval.`,
                "Welcome to CTtaste! 🎉",
            );

            return SuccessHandler(
                set,
                "Vendor account created successfully",
                {
                    vendor: newVendor,
                },
                true
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error registering vendor",
                error
            );
        }
    }, VendorValidator.create)

export default registerVendor;
