import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

// Loading component
const LoadingSpinner = () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-6">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite" aria-busy="true">
            <div className="relative">
                {/* Logo holder */}
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white shadow flex items-center justify-center">
                    <img src="/Logo.svg" alt="Company logo" className="h-10 w-10 sm:h-12 sm:w-12" />
                </div>
                {/* Spinning ring */}
                <div className="absolute inset-0 -m-3 rounded-full border-4 border-primary/20 border-t-primary motion-safe:animate-spin"></div>
            </div>
            <div className="text-center">
                <p className="text-sm sm:text-base font-medium text-gray-700">Checking authentication...</p>
                <p className="text-xs text-gray-500 mt-1">Hang tight, this won’t take long.</p>
            </div>
        </div>
    </div>
);

// Protected route for users (customers)
export const ProtectedUserRoute = ({ children }) => {
    const { user, vendor, isLoading, userType, checkUserAuthStatus } = useAuth();
    const location = useLocation();
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (!hasCheckedAuth) {
                try {
                    await checkUserAuthStatus();
                } catch {
                    // ignore; routing below will handle unauthenticated state
                } finally {
                    setHasCheckedAuth(true);
                }
            }
        };
        checkAuth();
    }, [checkUserAuthStatus, hasCheckedAuth]);

    // Show loading while checking authentication
    if (isLoading || !hasCheckedAuth) {
        return <LoadingSpinner />;
    }

    // Allow access if vendor is authenticated (vendors can access user routes)
    if (vendor && userType === 'vendor') {
        console.log('Vendor accessing user routes - allowing access...');
        return children;
    }

    // Redirect to customer login if not authenticated as customer
    if (!user || userType !== 'customer') {
        console.log('No customer authentication - redirecting to customer login...');
        return <Navigate to="/auth/login?type=customer" state={{ from: location }} replace />;
    }

    console.log('Customer accessing user routes - allowing access...');
    return children;
};

// Protected route for vendors
export const ProtectedVendorRoute = ({ children }) => {
    const { vendor, isLoading, userType, checkVendorAuthStatus } = useAuth();
    const location = useLocation();
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    // Debug logging
    console.log('ProtectedVendorRoute - Debug Info:', {
        vendor: vendor,
        userType: userType,
        isLoading: isLoading,
        hasCheckedAuth: hasCheckedAuth,
        location: location.pathname
    });

    useEffect(() => {
        const checkAuth = async () => {
            if (!hasCheckedAuth) {
                console.log('ProtectedVendorRoute - Running vendor auth check...');
                try {
                    await checkVendorAuthStatus();
                } catch {
                    // ignore; routing below will handle unauthenticated state
                } finally {
                    setHasCheckedAuth(true);
                    console.log('ProtectedVendorRoute - Auth check completed');
                }
            }
        };
        checkAuth();
    }, [checkVendorAuthStatus, hasCheckedAuth]);

    // Show loading while checking authentication
    if (isLoading || !hasCheckedAuth) {
        return <LoadingSpinner />;
    }

    // If user is logged in as customer, redirect to vendor login
    if (userType === 'customer') {
        console.log('Customer trying to access vendor routes - redirecting to vendor login...');
        return <Navigate to="/auth/login?type=vendor" state={{ from: location }} replace />;
    }

    // Only allow access if authenticated as vendor
    if (!vendor || userType !== 'vendor') {
        console.log('No vendor authentication - redirecting to vendor login...');
        return <Navigate to="/auth/login?type=vendor" state={{ from: location }} replace />;
    }

    console.log('Allowing access to vendor routes...');
    return children;
};

// Public route (redirects to dashboard if already authenticated)
export const PublicRoute = ({ children }) => {
    const { user, vendor, userType, isLoading } = useAuth();

    // Show loading while checking authentication
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Redirect to appropriate dashboard if already authenticated
    if (user && userType === 'customer') {
        return <Navigate to="/user" replace />;
    }
    
    if (vendor && userType === 'vendor') {
        return <Navigate to="/vendor/dashboard" replace />;
    }

    return children;
};
