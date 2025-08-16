import { DashboardCard, LargeCard } from "../../components/dashboardCard";
import { MonthlyChart } from "../../components/monthlyChart";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useEffect, useMemo, useState } from "react";
import { menuService } from "../../api/menu.js";
import { ordersService } from "../../api/orders.js";

export default function Dashboard() {
    const { vendor } = useAuth();
    const [metrics, setMetrics] = useState({ menuCount: 0, monthOrders: 0, monthSales: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [chartData, setChartData] = useState([]);

    // Debug logging
    console.log('Dashboard - vendor data:', vendor);
    console.log('Dashboard - vendor type:', typeof vendor);
    console.log('Dashboard - vendor.vendor:', vendor?.vendor);
    console.log('Dashboard - vendor isApproved:', vendor?.vendor?.isApproved);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const [menuRes, ordersRes] = await Promise.all([
                    menuService.list().catch((e) => ({ data: { items: [] }, _error: e })),
                    ordersService.listVendorOrders().catch((e) => ({ data: { orders: [] }, _error: e })),
                ]);

                const items = menuRes?.data?.items || [];
                const orders = ordersRes?.data?.orders || [];

                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

                const inThisMonth = orders.filter((o) => {
                    const d = new Date(o.createdAt);
                    return d >= startOfMonth && d <= endOfMonth;
                });

                const monthOrders = inThisMonth.length;
                const monthSales = inThisMonth
                    .filter((o) => o.status === 'Completed')
                    .reduce((sum, o) => sum + Number(o.total || 0), 0);

                setMetrics({
                    menuCount: items.length,
                    monthOrders,
                    monthSales,
                });

                // Build 12-month chart series for current year
                const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                const year = now.getFullYear();
                const monthly = months.map((m, idx) => {
                    const start = new Date(year, idx, 1);
                    const end = new Date(year, idx + 1, 0, 23, 59, 59, 999);
                    const inRange = orders.filter(o => {
                        const d = new Date(o.createdAt);
                        return d >= start && d <= end;
                    });
                    const sales = inRange.filter(o => o.status === 'Completed').reduce((s, o) => s + Number(o.total || 0), 0);
                    return { month: m, sales, orders: inRange.length, revenue: sales };
                });
                setChartData(monthly);
            } catch (e) {
                setError(e.message || 'Failed to load dashboard metrics');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const vendorUrl = useMemo(() => {
        const slug = vendor?.vendor?.restaurantName?.toLowerCase().replace(/\s+/g, '') || 'vendor';
        return `https://cttaste.com/${slug}`;
    }, [vendor]);

    const copyVendorUrl = async () => {
        try {
            await navigator.clipboard.writeText(vendorUrl);
            console.log('Copied vendor URL');
        } catch (e) {
            console.warn('Copy failed:', e);
        }
    };

    return (
        <div className="space-y-6">
            {/* Approval Banner - Only show if vendor is not approved */}
            {vendor?.vendor && !vendor.vendor.isApproved && (
                <div className="bg-white p-7 py-5 rounded-xl flex justify-between items-center text-sm">
                    <p>Get your restaurant approved to start selling on CTtaste.</p>
                    <a 
                        href="mailto:support@cttaste.com?subject=Vendor Approval Request&body=Hello, I would like to request approval for my restaurant on CTtaste."
                        className="text-orange-500 cursor-pointer hover:underline"
                    >
                        Get Approval ›
                    </a>
                </div>
            )}

            {/* Status messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                    {error}
                </div>
            )}
            {loading && (
                <div className="text-sm text-gray-500">Refreshing metrics…</div>
            )}

            {/* Approved Status Banner - Show if vendor is approved */}
            {vendor?.vendor && vendor.vendor.isApproved && (
                <div className="bg-green-50 border border-green-200 p-7 py-5 rounded-xl flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <p className="text-green-700">Your restaurant is approved and ready to sell on CTtaste!</p>
                    </div>
                </div>
            )}

            {/* Welcome Banner */}
            <div className="relative rounded-xl overflow-hidden h-[40vh]">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                    <h1 className="text-white text-4xl font-semibold mb-4">
                        Welcome {vendor?.vendor?.restaurantName || vendor?.session?.fullName || 'Vendor'}
                    </h1>
                    <div className="flex items-center justify-between gap-3 bg-white bg-opacity-90 rounded-lg px-4 py-3 max-w-md">
                        <div className="flex items-center gap-3">
                            <Icon icon="majesticons:link" className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700 text-sm">
                                {vendorUrl}
                            </span>
                        </div>
                        <Icon onClick={copyVendorUrl} icon="majesticons:clipboard-copy" className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                    </div>
                </div>
                {/* Background decoration - you can replace with an actual image */}
                <div className="absolute top-0 right-0 w-full h-full bg-[url(/banner.png)] opacity-50 bg-cover"></div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard
                    title="Total Sale"
                    value={`₦ ${Number(metrics.monthSales || 0).toLocaleString()}`}
                    subtitle="Sales made this month"
                    icon="majesticons:money-line"
                />
                <DashboardCard
                    title="Menu Count"
                    value={String(metrics.menuCount || 0)}
                    subtitle="Your menu created"
                    icon="majesticons:menu-line"
                />
                <DashboardCard
                    title="Total Order"
                    value={String(metrics.monthOrders || 0)}
                    subtitle="Orders made this month"
                    icon="majesticons:shopping-cart-line"
                />
            </div>

            {/* Analysis and Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <LargeCard
                    title="Monthly Analysis"
                    icon="iconamoon:trend-up"
                    className="h-auto"
                >
                    <MonthlyChart data={chartData} />
                </LargeCard>
            </div>
        </div>
    );
}