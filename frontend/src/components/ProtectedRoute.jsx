import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

// Loading component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <div className="ml-4">
            <p className="text-lg font-medium">Checking authentication...</p>
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
