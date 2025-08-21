import Button from "./button";
import { Icon } from "@iconify/react"
import { Input } from "./form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../hooks/useCart.js";

export default function Navbar() {
    const { user, userType, isLoading } = useAuth();
    const { count } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");

    // keep navbar input in sync with URL when on Explore (home) page
    useEffect(() => {
        if (location.pathname === "/") {
            const params = new URLSearchParams(location.search);
            setSearchTerm(params.get("search") || "");
        }
    }, [location.pathname, location.search]);

    const submitSearch = () => {
        const term = searchTerm.trim();
        const params = new URLSearchParams();
        if (term) params.set("search", term);
        navigate(`/${params.toString() ? `?${params.toString()}` : ""}`);
    };

    // live search: debounce navigating to home with the current search term
    useEffect(() => {
        const handle = setTimeout(() => {
            // Only auto-search while on home page to avoid redirecting away from other pages
            if (location.pathname !== "/") return;
            const term = searchTerm.trim();
            const current = new URLSearchParams(location.search).get("search") || "";
            if (current === term) return;

            const params = new URLSearchParams();
            if (term) params.set("search", term);
            const url = `/${params.toString() ? `?${params.toString()}` : ""}`;
            navigate(url, { replace: true });
        }, 400);
        return () => clearTimeout(handle);
        // include location to cancel pending navigations when route changes
    }, [searchTerm, location.pathname, location.search, navigate]);

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

    const isUserRoute = location.pathname.startsWith('/user');
    return (
        <>
            <nav className="bg-white fixed top-0 w-screen z-20">
                <div className="px-5 md:px-20 flex justify-between items-center py-2">
                    <div>
                        <div className="flex items-center gap-10">
                            {isUserRoute ? (
                                <button onClick={() => navigate('/')} title="Home" className="focus:outline-none">
                                    <Icon icon="mdi:home-outline" className="size-6 md:size-8 text-primary" />
                                </button>
                            ) : (
                                <Link to="/">
                                    <img src="/Logo.svg" alt="logo" className="size-10 md:size-16" />
                                </Link>
                            )}
                            <div className="hidden dmt-1 md:flex">
                                <Input
                                    type="text"
                                    icon="ep:food"
                                    placeholder="Search Vendor"
                                    className="w-[400px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") submitSearch();
                                    }}
                                />
                                {/* <button
                                    type="button"
                                    onClick={submitSearch}
                                    className="ml-2 inline-flex items-center gap-1 px-3 py-3 border border-border/20 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                                    aria-label="Search vendors"
                                >
                                    <Icon icon="mdi:magnify" className="size-5" />
                                    <span className="hidden sm:inline">Search</span>
                                </button> */}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-10">
                        <Link to="/cart">
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:cart-outline" className="size-4 md:size-5" />
                                <p className="font-medium text-[.9rem] md:text-sm">Cart - {count || 0}</p>
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
                                    <span className="font-medium text-gray-700 hover:text-primary transition-colors hidden md:block">
                                        {getUserDisplayName() || 'Profile'}
                                    </span>
                                </div>
                            </Link>
                        ) : (
                            <Link to="/auth/login?type=customer " className="md:block">
                                <Button className="px-6 py-3 ">Login</Button>
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
                <div className="px-5 md:px-20 flex justify-between items-center py-2">
                    <div >
                        <Link to="/">
                            <img src="/Logo.svg" alt="logo" className="size-10 md:size-16" />
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    )
}