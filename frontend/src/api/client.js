import axios from 'axios';

// API base configuration
const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
    // User endpoints
    REGISTER_USER: '/users/register',
    LOGIN_USER: '/users/sign',
    USER_STATUS: '/auth/status/user',
    DELETE_USER: '/users/delete',
    
    // Vendor endpoints
    REGISTER_VENDOR: '/vendors/register',
    LOGIN_VENDOR: '/vendors/sign',
    VENDOR_STATUS: '/auth/status/vendor',
    UPDATE_VENDOR_PROFILE: '/vendors/profile',
    UPDATE_VENDOR_BUSINESS: '/vendors/business-settings',
    UPDATE_VENDOR_OPERATIONAL: '/vendors/operational-settings',
    VENDOR_WORKING_HOURS: '/vendors/working-hours',
    DELETE_VENDOR: '/vendors/delete',
    VENDOR_BANNER: '/vendors/banner',
    VENDOR_AVATAR: '/vendors/avatar',
    VENDOR_PASSWORD_CHANGE: '/vendors/password/change',
    
    // Auth endpoints
    LOGOUT: '/auth/logout',
    GENERATE_OTP: '/auth/otp/generate/email',
    VERIFY_OTP: '/auth/otp/verify/email',
    RESEND_CONFIRM: '/auth/resend-confirm',

    // Menu endpoints (vendor)
    MENU_LIST: '/menu',
    MENU_ITEM: (id) => `/menu/${id}`,
    MENU_IMAGE: (id) => `/menu/${id}/image`,

    // Orders endpoints
    ORDERS_PLACE: '/orders',
    VENDOR_ORDERS: '/orders/vendor',
    VENDOR_ORDER: (id) => `/orders/vendor/${id}`,
    VENDOR_ORDER_STATUS: (id) => `/orders/vendor/${id}/status`,

    // Cart endpoints
    CART: '/cart',
    CART_ITEMS: '/cart/items',
    CART_ITEM: (menuItemId) => `/cart/items/${menuItemId}`,

    // Favorites endpoints
    FAVORITES: '/favorites',
    FAVORITES_TOGGLE: '/favorites/toggle',
};

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true, // Include cookies in requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
    (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response.data; // Return just the data
    },
    (error) => {
        console.error('❌ API Error:', error);
        
        // Extract error message
        const errorMessage = error.response?.data?.message 
            || error.response?.data?.error 
            || error.message 
            || 'An unexpected error occurred';
        
        // Create a more user-friendly error
        const customError = new Error(errorMessage);
        customError.status = error.response?.status;
        customError.data = error.response?.data;
        
        return Promise.reject(customError);
    }
);

export { apiClient };
