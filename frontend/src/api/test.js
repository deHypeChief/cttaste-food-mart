import { apiClient } from './client.js';

// Test function to verify API connection
export const testApiConnection = async () => {
    try {
        console.log('🔄 Testing API connection...');
        const response = await apiClient.get('/');
        console.log('✅ API Connection successful:', response);
        return { success: true, data: response };
    } catch (error) {
        console.error('❌ API Connection failed:', error);
        return { success: false, error: error.message };
    }
};

// Test auth endpoints
export const testAuthEndpoints = {
    testUserRegister: async () => {
        try {
            const testData = {
                fullName: "Test User",
                email: "test@example.com",
                phoneNumber: "1234567890",
                username: "testuser",
                gender: "other",
                dateOfBirth: "1990-01-01",
                password: "testpassword123",
                profile: "",
                referalToken: "",
                school: "Test School"
            };
            
            console.log('🔄 Testing user registration endpoint...');
            const response = await apiClient.post('/users/register?role=user', testData);
            console.log('✅ User registration test successful:', response);
            return { success: true, data: response };
        } catch (error) {
            console.error('❌ User registration test failed:', error);
            return { success: false, error: error.message };
        }
    },

    testVendorRegister: async () => {
        try {
            const testData = {
                fullName: "Test Restaurant Owner",
                email: "vendor@example.com",
                phoneNumber: "1234567890",
                restaurantName: "Test Restaurant",
                location: "Test City",
                address: "123 Test Street",
                vendorType: "Restaurant",
                password: "testpassword123",
                profile: "",
                description: "Test restaurant",
                cuisine: "Test cuisine"
            };
            
            console.log('🔄 Testing vendor registration endpoint...');
            const response = await apiClient.post('/vendors/register', testData);
            console.log('✅ Vendor registration test successful:', response);
            return { success: true, data: response };
        } catch (error) {
            console.error('❌ Vendor registration test failed:', error);
            return { success: false, error: error.message };
        }
    }
};
