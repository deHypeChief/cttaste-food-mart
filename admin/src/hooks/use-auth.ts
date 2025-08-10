
import { toast } from "sonner";
import { changePassword, confirmPasswordReset, isAuthenticated, login, logoutAdmin, register, requestPasswordReset } from "@/api/auth";

export const useAuth = () => {

    async function adminLogin(payload: { email: string; password: string }) {
        try {
            const data = await login(payload);
            toast.success("Login Successful")
            return data.data;
        } catch (error) {
            toast.error("Login Error", {
                description: (error as any).response?.data?.message || (error as any).response?.data || (error as any).message,
            })
            console.log(error);
        }
    }

    async function adminRegister(payload: { fullName: string; email: string; password: string, role: string }) {
        try {
            const data = await register(payload);
            toast.success("Registration Successful")
            // location.href = "/"
            return data.data;
        } catch (error) {
            toast.error("Admin Creation Error", {
                description: (error as any).response?.data?.message || (error as any).response?.data || (error as any).message,
            })
            console.log(error);
        }
    }

    async function authStatus() {
        try {
            const as = await isAuthenticated();
            const data = as.data;

            return {
                ...data.session,
                ...data.admin,
                isAuthenticated: data.isAuthenticated
            };
        } catch (error) {
            console.log(error);
            return {
                isAuthenticated: false
            }
        }
    }

    async function logout() {
        try {
            await logoutAdmin();
            toast.success("Admin logged out successfully")

            return true;
        } catch (error) {
            toast.error("Error loging out admni", {
                description: (error as any).response?.data?.message || (error as any).response?.data || (error as any).message,
            })
            console.log(error);
        }
    }

    async function resetPasswordRequest(payload: { email: string }) {
        try {
            const data = await requestPasswordReset(payload);
            toast.success("If the email exists, a code was sent")
            return data;
        } catch (error) {
            toast.error("Reset Request Error", {
                description: (error as any).response?.data?.message || (error as any).response?.data || (error as any).message,
            })
        }
    }

    async function resetPasswordConfirm(payload: { email: string; otp: string; newPassword: string }) {
        try {
            const data = await confirmPasswordReset(payload);
            toast.success("Password updated. You can login now")
            return data;
        } catch (error) {
            toast.error("Reset Confirm Error", {
                description: (error as any).response?.data?.message || (error as any).response?.data || (error as any).message,
            })
        }
    }

    async function updatePassword(payload: { currentPassword: string; newPassword: string }) {
        try {
            const data = await changePassword(payload);
            toast.success("Password updated")
            return data;
        } catch (error) {
            toast.error("Password Update Error", {
                description: (error as any).response?.data?.message || (error as any).response?.data || (error as any).message,
            })
        }
    }

    return { adminLogin, adminRegister, authStatus, logout, resetPasswordRequest, resetPasswordConfirm, updatePassword };
};

export type AuthContext = ReturnType<typeof useAuth>;