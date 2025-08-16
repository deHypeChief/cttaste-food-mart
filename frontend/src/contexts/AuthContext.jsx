import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService, userAuthService, vendorAuthService } from '../api/auth.js';

const AuthContext = createContext();

export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState(null); // 'customer' or 'vendor'

    // Core checker: call with 'vendor' or 'user' to avoid cross-role interference
    const checkAuthStatus = useCallback(async (type) => {
        setIsLoading(true);
        try {
            if (type === 'vendor') {
                const vendorResponse = await authService.getAuthStatus('vendor');
                if (vendorResponse.success && vendorResponse.data.isAuthenticated) {
                    setVendor(vendorResponse.data);
                    setUser(null);
                    setUserType('vendor');
                } else {
                    setVendor(null);
                    if (userType === 'vendor') setUserType(null);
                }
                return vendorResponse;
            }

            // Default to user when type is 'user' or undefined for customer context
            const userResponse = await authService.getAuthStatus('user');
            if (userResponse.success && userResponse.data.isAuthenticated) {
                setUser(userResponse.data);
                setVendor(null);
                setUserType('customer');
            } else {
                setUser(null);
                if (userType === 'customer') setUserType(null);
            }
            return userResponse;
        } catch (error) {
            console.error('Auth status check failed:', error);
            if (type === 'vendor') {
                setVendor(null);
                if (userType === 'vendor') setUserType(null);
            } else {
                setUser(null);
                if (userType === 'customer') setUserType(null);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [userType]);

    // Check auth status on app load
    const checkPreferredOnMount = useCallback(async () => {
        const preferredType = localStorage.getItem('auth.type');
        if (preferredType === 'vendor') {
            await checkAuthStatus('vendor');
            return;
        }
        if (preferredType === 'user' || preferredType === 'customer') {
            await checkAuthStatus('user');
            return;
        }
        // No prior preference: try vendor first, then fall back to user
        try {
            const v = await checkAuthStatus('vendor');
            if (v?.success && v?.data?.isAuthenticated) return;
        } catch { /* ignore */ }
        await checkAuthStatus('user');
    }, [checkAuthStatus]);

    useEffect(() => {
        // Only check the last used auth type to avoid cross-role cookie invalidation
        checkPreferredOnMount();
    }, [checkPreferredOnMount]);

    // Explicit helpers if components want to be crystal-clear
    const checkVendorAuthStatus = () => checkAuthStatus('vendor');
    const checkUserAuthStatus = () => checkAuthStatus('user');

    const login = async (credentials, type) => {
        setIsLoading(true);
        try {
            let response;
            if (type === 'vendor') {
                response = await vendorAuthService.login(credentials);
                if (response.success) {
                    localStorage.setItem('auth.type', 'vendor');
                    await checkAuthStatus('vendor');
                }
            } else {
                response = await userAuthService.login(credentials);
                if (response.success) {
                    localStorage.setItem('auth.type', 'user');
                    await checkAuthStatus('user');
                }
            }
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
            setVendor(null);
            setUserType(null);
            localStorage.removeItem('auth.type');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        vendor,
        userType,
        isLoading,
        isAuthenticated: !!(user || vendor),
        login,
        logout,
    checkAuthStatus,
    checkUserAuthStatus,
    checkVendorAuthStatus,
        setUser,
        setVendor,
        setUserType
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
