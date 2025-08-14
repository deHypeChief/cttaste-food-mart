import { Link, Outlet, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "../../components/button";

export default function VendorLayout() {
    const location = useLocation();

    // Function to check if a path is active
    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/vendor/dashboard' || location.pathname === '/vendor/';
        }
        return location.pathname.includes(path);
    };

    return (
        <>
            <div className="h-screen flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-10 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <img src="/Logo.svg" alt="" className="size-12" />
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md mx-8">
                            <div className="relative">
                                <Icon icon="majesticons:search-line" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search Vendors"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        {/* Profile Section */}
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-black">
                                <Icon icon="majesticons:bell-line" className="w-6 h-6" />
                            </button>
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 pt-4">
                        <nav className="p-4 space-y-2 h-full overflow-y-auto flex flex-col justify-between">
                            <div>
                                <Link to="/vendor/dashboard">
                                    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('/dashboard')
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        <Icon icon="majesticons:dashboard-line" className="w-5 h-5" />
                                        Dashboard
                                    </button>
                                </Link>

                                <Link to="/vendor/orders">
                                    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('/orders')
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        <Icon icon="majesticons:shopping-bag-line" className="w-5 h-5" />
                                        My Orders
                                    </button>
                                </Link>

                                <Link to="/vendor/hours">
                                    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('/hours')
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        <Icon icon="majesticons:clock-line" className="w-5 h-5" />
                                        Working Hours
                                    </button>
                                </Link>

                                <Link to="/vendor/menu">
                                    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('/menu')
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        <Icon icon="majesticons:menu-line" className="w-5 h-5" />
                                        Menu List
                                    </button>
                                </Link>

                                <Link to="/vendor/analysis">
                                    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('/analysis')
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        <Icon icon="tabler:coin" className="w-5 h-5" />
                                        Analysis
                                    </button>
                                </Link>

                                <Link to="/vendor/promotion">
                                    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('/promotion')
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        <Icon icon="majesticons:megaphone-line" className="w-5 h-5" />
                                        Brand Promotion
                                    </button>
                                </Link>

                                <Link to="/vendor/delivery">
                                    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('/delivery')
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        <Icon icon="majesticons:truck-line" className="w-5 h-5" />
                                        Delivery
                                    </button>
                                </Link>
                            </div>

                            <div className="border-t border-gray-200 mt-8 pt-4">
                                <Link to="/vendor/support">
                                    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('/support')
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        <Icon icon="mynaui:support" className="w-5 h-5" />
                                        Get Support
                                    </button>
                                </Link>

                                <Link to="/vendor/settings">
                                    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('/settings')
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        <Icon icon="lsicon:setting-outline" className="w-5 h-5" />
                                        Setting
                                    </button>
                                </Link>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 p-8 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    )
}