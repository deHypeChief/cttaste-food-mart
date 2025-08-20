import { Link, Outlet, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "../../components/button";
import { useAuth } from "../../hooks/useAuth.js";
import { useEffect, useState } from "react";

export default function VendorLayout() {
    const location = useLocation();
    const { vendor } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close mobile sidebar when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // Function to check if a path is active
    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/vendor/dashboard' || location.pathname === '/vendor' || location.pathname === '/vendor/';
        }
        return location.pathname.includes(path);
    };

    // Helper function to get vendor display name
    const getVendorDisplayName = () => {
        if (vendor?.session?.fullName) {
            return vendor.session.fullName;
        }
        if (vendor?.user?.username) {
            return vendor.user.username;
        }
        return '';
    };

    // Helper function to get vendor profile image
    const getVendorProfileImage = () => {
        if (vendor?.session?.profile) {
            return vendor.session.profile;
        }
        return null;
    };

    // Helper function to get first letter of name
    const getFirstLetter = () => {
        const name = getVendorDisplayName();
        return name ? name.charAt(0).toUpperCase() : 'V';
    };

    // Sidebar links configuration
    const mainLinks = [
        { to: '/vendor/dashboard', active: '/dashboard', icon: 'majesticons:dashboard-line', label: 'Dashboard' },
        { to: '/vendor/orders', active: '/orders', icon: 'majesticons:shopping-bag-line', label: 'My Orders' },
        { to: '/vendor/hours', active: '/hours', icon: 'majesticons:clock-line', label: 'Working Hours' },
        { to: '/vendor/menu', active: '/menu', icon: 'majesticons:menu-line', label: 'Menu List' },
        { to: '/vendor/analysis', active: '/analysis', icon: 'tabler:coin', label: 'Analysis' },
        { to: '/vendor/promotion', active: '/promotion', icon: 'majesticons:megaphone-line', label: 'Brand Promotion' },
        // { to: '/vendor/delivery', active: '/delivery', icon: 'majesticons:truck-line', label: 'Delivery' },
    ];

    const footerLinks = [
        { to: '/vendor/support', active: '/support', icon: 'mynaui:support', label: 'Get Support' },
        { to: '/vendor/settings', active: '/settings', icon: 'lsicon:setting-outline', label: 'Setting' },
    ];

    const SidebarNav = () => (
        <nav className="p-4 space-y-2 h-full overflow-y-auto flex flex-col justify-between">
            <div>
                {mainLinks.map((link) => (
                    <Link key={link.to} to={link.to}>
                        <button
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                                isActive(link.active) ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Icon icon={link.icon} className="w-5 h-5" />
                            {link.label}
                        </button>
                    </Link>
                ))}
            </div>

            <div className="border-t border-gray-200 mt-8 pt-4">
                {footerLinks.map((link) => (
                    <Link key={link.to} to={link.to}>
                        <button
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                                isActive(link.active) ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Icon icon={link.icon} className="w-5 h-5" />
                            {link.label}
                        </button>
                    </Link>
                ))}
            </div>
        </nav>
    );

    return (
        <>
            <div className="h-screen flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            {/* Mobile: sidebar toggle */}
                            <button
                                type="button"
                                className="md:hidden p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                                aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
                                onClick={() => setIsSidebarOpen((v) => !v)}
                            >
                                <Icon icon={isSidebarOpen ? 'mdi:close' : 'mdi:menu'} className="w-6 h-6" />
                            </button>
                            <img src="/Logo.svg" alt="" className="size-12" />
                        </div>

                        {/* Search Bar
                        <div className="flex-1 max-w-md mx-8">
                            <div className="relative">
                                <Icon icon="majesticons:search-line" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search Vendors"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div> */}

                        {/* Profile Section */}
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-black">
                                {/* <Icon icon="majesticons:bell-line" className="w-6 h-6" /> */}
                            </button>
                            <Link to="/vendor/settings">
                                <div className="flex items-center gap-3 cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                                        {getVendorProfileImage() ? (
                                            <img 
                                                src={getVendorProfileImage()} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white font-medium text-xs">
                                                {getFirstLetter()}
                                            </span>
                                        )}
                                    </div>
                                    {/* {isLoading ? (
                                        <div className="animate-pulse bg-gray-300 h-4 w-20 rounded"></div>
                                    ) : (
                                        <span className="font-medium text-gray-700 hover:text-orange-500 transition-colors hidden sm:block">
                                            {getVendorDisplayName() || 'Profile'}
                                        </span>
                                    )} */}
                                </div>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 flex-shrink-0 pt-4">
                        <SidebarNav />
                    </aside>

                    {/* Sidebar - Mobile overlay */}
                    <div className={`md:hidden  fixed inset-0 z-40 ${isSidebarOpen ? '' : 'pointer-events-none'}`}>
                        {/* Backdrop */}
                        <div
                            className={`absolute inset-0 bg-black/40 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                            onClick={() => setIsSidebarOpen(false)}
                            aria-hidden="true"
                        />
                        {/* Slide-in panel */}
                        <aside
                            className={`absolute left-0 top-0 h-[100dvh] w-64 bg-white border-r border-gray-200 pt-4 transform transition-transform duration-300 overflow-hidden flex flex-col ${
                                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Navigation menu"
                        >
                            <div className="px-4 pb-2 flex items-center justify-between">
                                <span className="font-semibold">Menu</span>
                                <button
                                    type="button"
                                    className="p-2 rounded-md hover:bg-gray-100"
                                    onClick={() => setIsSidebarOpen(false)}
                                    aria-label="Close menu"
                                >
                                    <Icon icon="mdi:close" className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <SidebarNav />
                            </div>
                        </aside>
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    )
}