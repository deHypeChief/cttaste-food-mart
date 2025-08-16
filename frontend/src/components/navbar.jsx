import Button from "./button";
import { Icon } from "@iconify/react"
import { Input } from "./form";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../hooks/useCart.js";

export default function Navbar() {
    const { user, userType, isLoading } = useAuth();
    const { count } = useCart();
    
    // Helper function to get user display name
    const getUserDisplayName = () => {
        if (user?.session?.fullName) {
            return user.session.fullName;
        }
        if (user?.user?.username) {
            return user.user.username;
        }
        return '';
    };

    // Helper function to get user profile image
    const getUserProfileImage = () => {
        if (user?.session?.profile) {
            return user.session.profile;
        }
        return null;
    };

    // Helper function to get first letter of name
    const getFirstLetter = () => {
        const name = getUserDisplayName();
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    // Check if customer is logged in
    const isCustomerLoggedIn = userType === 'customer' && user;

    return (
        <>
            <nav className="bg-white fixed top-0 w-screen z-20">
                <div className="px-20 flex justify-between items-center py-2">
                    <div>
                        <div className="flex items-center gap-10">
                            <Link to="/">
                                <img src="/Logo.svg" alt="logo" className="size-16" />
                            </Link>
                            <div className="mt-1 flex">
                                <Input type="text" icon="ep:food" placeholder="Search Vendor" className="w-[400px]" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-10">
            <Link to="/cart">
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:cart-outline" className="size-5" />
                <p className="font-medium">Cart - {count || 0}</p>
                            </div>
                        </Link>
                        
                        {isLoading ? (
                            <div className="animate-pulse bg-gray-300 h-10 w-20 rounded"></div>
                        ) : isCustomerLoggedIn ? (
                            <Link to="/user">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                                        {getUserProfileImage() ? (
                                            <img 
                                                src={getUserProfileImage()} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white font-medium text-sm">
                                                {getFirstLetter()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-medium text-gray-700 hover:text-primary transition-colors">
                                        {getUserDisplayName() || 'Profile'}
                                    </span>
                                </div>
                            </Link>
                        ) : (
                            <Link to="/auth/login?type=customer">
                                <Button className="px-6 py-3">Login</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </>
    )
}

export function AuthNavbar() {
    return (
        <>
            <nav className="fixed top-0 w-screen z-20">
                <div className="px-20 flex justify-between items-center py-2">
                    <div >
                        <Link to="/">
                            <img src="/Logo.svg" alt="logo" className="size-16" />
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    )
}