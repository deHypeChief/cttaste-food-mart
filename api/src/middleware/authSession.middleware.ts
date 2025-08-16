import Elysia from "elysia";
import { jwtSessionAccess, jwtSessionRefresh } from "./jwt.middleware";
import ErrorHandler from "../services/errorHandler.service";
import { SessionClient } from "../components/auth/_model";
import { IUser, User } from "../components/users/_model";
import AuthHandler from "../services/authHandler.service";
import { Admin, IAdmin } from "../components/admin/_model";
import { Vendor, IVendor } from "../components/vendors/_model";

/**
 * Middleware to check session authentication and role.
 * @param requiredRole - Role required to access the route ("user" | "admin" | "vendor" | null)
 */
export const isSessionAuth = (requiredRole: "user" | "admin" | "vendor" | null = null) =>
    (app: Elysia) =>
        app
            .use(jwtSessionAccess) // Attach access JWT middleware
            .use(jwtSessionRefresh) // Attach refresh JWT middleware
            .derive(async function handler({
                request,
                headers,
                sessionAccessJwt,
                sessionRefreshJwt,
                cookie: { sessionAccess, sessionRefresh },
                set
            }) {
                try {
                    const a_t = sessionAccess.value;
                    const r_t = sessionRefresh.value;

                    // If both tokens are missing, clear cookies and throw unauthorized error
                    if (!a_t && !r_t) {
                        sessionAccess.remove();
                        sessionRefresh.remove();
                        throw ErrorHandler.UnauthorizedError(
                            set,
                            "Authentication tokens required"
                        );
                    }

                    let sessionPayload;

                    // Try to verify Access Token first
                    if (a_t) {
                        try {
                            sessionPayload = await sessionAccessJwt.verify(a_t);
                        } catch {
                            // Ignore invalid access token and fall back to refresh token
                        }
                    }

                    // If Access Token is invalid or missing, try Refresh Token
                    if (!sessionPayload && r_t) {
                        try {
                            sessionPayload = await sessionRefreshJwt.verify(r_t);

                            // If refresh token is valid, refresh the session and generate new tokens
                            if (sessionPayload && sessionPayload.sessionClientId) {
                                const sessionClient = await SessionClient.findById(sessionPayload.sessionClientId);
                                if (!sessionClient) {
                                    throw ErrorHandler.UnauthorizedError(set, "Invalid session client");
                                }

                                // Generate new tokens and set cookies
                                await AuthHandler.signSession(
                                    set,
                                    sessionClient,
                                    request,
                                    headers,
                                    sessionAccess,
                                    sessionRefresh,
                                    sessionAccessJwt,
                                    sessionRefreshJwt
                                );
                            }
                        } catch (error) {
                            // If refresh token is invalid, clear cookies and throw unauthorized error
                            sessionAccess.remove();
                            sessionRefresh.remove();
                            throw ErrorHandler.UnauthorizedError(
                                set,
                                "Session cleared due to invalid credentials",
                                error
                            );
                        }
                    }

                    // If neither token is valid, clear cookies and throw unauthorized error
                    if (!sessionPayload) {
                        sessionAccess.remove();
                        sessionRefresh.remove();
                        throw ErrorHandler.UnauthorizedError(set, "Invalid authentication tokens");
                    }

                    // Validate session and check role
                    const { session: sessionDoc, sessionClient } = await validateSession(sessionPayload, set);

                    // If a specific role is required, check if user has it
                    if (requiredRole && !validateRole(sessionDoc.role, requiredRole)) {
                        throw ErrorHandler.UnauthorizedError(
                            set,
                            `Access denied: ${requiredRole} role required`
                        );
                    }

                    // Expose the session client document and the resolved user/admin/vendor entity
                    return { session: sessionDoc, sessionClient };
                } catch (error) {
                    // On any error, clear cookies and rethrow
                    sessionAccess.remove();
                    sessionRefresh.remove();
                    throw error;
                }
            });

/**
 * Validates the session payload and fetches the session client (user/admin).
 * @param payload - Decoded JWT payload
 * @param set - Response setter
 */
async function validateSession(payload: any, set: any) {
    const { role, sessionClientId } = payload;

    // Find session client by ID, exclude password
    const session = await SessionClient.findById(sessionClientId).select("-password");
    if (!session) {
        throw ErrorHandler.UnauthorizedError(set, "Invalid session client");
    }

    // Fetch the user or admin associated with the session
    const sessionClient: IAdmin | IUser | IVendor = role.includes("admin")
        ? await Admin.findOne({ sessionClientId }).populate("sessionClientId")
        : role.includes("vendor")
        ? await Vendor.findOne({ sessionClientId }).populate("sessionClientId")
        : await User.findOne({ sessionClientId }).populate("sessionClientId").select("fullname email role");
    if (!sessionClient) {
        throw ErrorHandler.ValidationError(
            set,
            "Session client not found"
        );
    }

    return { session, sessionClient };
}

/**
 * Checks if the user's roles include the required role.
 * @param roles - User's roles (string or array)
 * @param requiredRole - Role required ("user" | "admin" | "vendor")
 */
function validateRole(roles: string | string[], requiredRole: "user" | "admin" | "vendor") {
    const roleArray = Array.isArray(roles) ? roles : [roles];

    if (requiredRole === "user") {
        // Accept any of these roles as "user"
        return roleArray.some(role => ["user"].includes(role));
    }

    if (requiredRole === "admin") {
        // return roleArray.includes("admin");
        return roleArray.some(role => ["admin"].includes(role));
    }
    
    if (requiredRole === "vendor") {
        return roleArray.some(role => ["vendor"].includes(role));
    }

    return false;
}
