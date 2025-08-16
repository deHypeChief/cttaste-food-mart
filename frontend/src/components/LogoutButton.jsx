import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import Button from './button.jsx';
import { Icon } from '@iconify/react';

export default function LogoutButton({ className = "", variant = "outline" }) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { logout, user, vendor, userType } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        try {
            await logout();
            // Redirect to appropriate login page
            if (userType === 'vendor') {
                navigate('/auth/login?type=vendor');
            } else {
                navigate('/auth/login?type=customer');
            }
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if logout fails on server, clear local state and redirect
            navigate('/auth/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Don't show logout button if not authenticated
    if (!user && !vendor) {
        return null;
    }

    return (
        <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant={variant}
            className={`flex items-center gap-2 ${className}`}
            icon={isLoggingOut ? "line-md:loading-loop" : "solar:logout-outline"}
        >
            {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
    );
}

// Simple text logout link
export function LogoutLink({ className = "" }) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        try {
            await logout();
            navigate('/auth/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/auth/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`text-red-600 hover:text-red-800 disabled:opacity-50 ${className}`}
        >
            {isLoggingOut ? (
                <span className="flex items-center gap-1">
                    <Icon icon="line-md:loading-loop" className="w-4 h-4" />
                    Logging out...
                </span>
            ) : (
                "Logout"
            )}
        </button>
    );
}
