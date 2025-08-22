import { apiClient, API_ENDPOINTS } from './client.js';

// User authentication services
export const userAuthService = {
    // Register customer
    register: async (userData) => {
        const { confirmPassword: _confirmPassword, ...registrationData } = userData;
        return apiClient.post(`${API_ENDPOINTS.REGISTER_USER}?role=user`, registrationData);
    },

    // Login customer
    login: async (credentials) => {
        return apiClient.post(API_ENDPOINTS.LOGIN_USER, credentials);
    },

    // Get user auth status
    getStatus: async () => {
        return apiClient.get(API_ENDPOINTS.USER_STATUS);
    },

    // Update user profile
    updateProfile: async (profileData) => {
        return apiClient.patch(API_ENDPOINTS.USER_UPDATE_PROFILE, profileData);
    },

    // Delete user account
    deleteAccount: async () => {
        return apiClient.delete(API_ENDPOINTS.DELETE_USER);
    },
};

// Vendor authentication services
export const vendorAuthService = {
    // Register vendor
    register: async (vendorData) => {
        const { confirmPassword: _confirmPassword, ...registrationData } = vendorData;
        return apiClient.post(API_ENDPOINTS.REGISTER_VENDOR, registrationData);
    },

    // Login vendor
    login: async (credentials) => {
        console.log('vendorAuthService.login called with:', { 
            email: credentials.email, 
            password: credentials.password ? '[HIDDEN]' : 'MISSING',
            credentialsObject: credentials 
        });
        console.log('Sending POST to:', API_ENDPOINTS.LOGIN_VENDOR);
        
        try {
            const response = await apiClient.post(API_ENDPOINTS.LOGIN_VENDOR, credentials);
            console.log('vendorAuthService.login response:', response);
            return response;
        } catch (error) {
            console.error('vendorAuthService.login error:', error);
            throw error;
        }
    },

    // Get vendor auth status
    getStatus: async () => {
        return apiClient.get(API_ENDPOINTS.VENDOR_STATUS);
    },

    // Update vendor profile
    updateProfile: async (profileData) => {
        return apiClient.put(API_ENDPOINTS.UPDATE_VENDOR_PROFILE, profileData);
    },

    // Update business settings
    updateBusinessSettings: async (businessData) => {
        return apiClient.put(API_ENDPOINTS.UPDATE_VENDOR_BUSINESS, businessData);
    },

    // Update operational settings
    updateOperationalSettings: async (operationalData) => {
        return apiClient.put(API_ENDPOINTS.UPDATE_VENDOR_OPERATIONAL, operationalData);
    },

    // Change password
    changePassword: async ({ currentPassword, newPassword }) => {
        return apiClient.post(API_ENDPOINTS.VENDOR_PASSWORD_CHANGE, { currentPassword, newPassword });
    },

    // Delete vendor account
    deleteAccount: async () => {
        return apiClient.delete(API_ENDPOINTS.DELETE_VENDOR);
    },

};

// Common auth services
export const authService = {
    // Logout
    logout: async () => {
        return apiClient.post(API_ENDPOINTS.LOGOUT);
    },

    // Generate OTP for email verification
    generateOTP: async (sessionId) => {
        return apiClient.post(API_ENDPOINTS.GENERATE_OTP, { sessionId });
    },

    // Verify OTP
    verifyOTP: async (sessionId, otp) => {
        return apiClient.post(API_ENDPOINTS.VERIFY_OTP, { sessionId, otp });
    },

    // Get auth status based on type
    getAuthStatus: async (userType) => {
        if (userType === 'vendor') {
            return vendorAuthService.getStatus();
        } else {
            return userAuthService.getStatus();
        }
    },

    // Delete account based on type
    deleteAccount: async (userType) => {
        if (userType === 'vendor') {
            return vendorAuthService.deleteAccount();
        } else {
            return userAuthService.deleteAccount();
        }
    },
};

// Resend confirmation helper (both user and vendor can use)
export const resendConfirmService = async (email) => {
    return apiClient.post(API_ENDPOINTS.RESEND_CONFIRM, { email });
};
