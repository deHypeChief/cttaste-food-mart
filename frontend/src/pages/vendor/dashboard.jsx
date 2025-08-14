import { DashboardCard, LargeCard } from "../../components/dashboardCard";
import { MonthlyChart } from "../../components/monthlyChart";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Approval Banner */}
            <div className="bg-white p-7 py-5 rounded-xl flex justify-between items-center text-sm">
                <p>Get your restaurant approved to start selling on CTtaste.</p>
                <p className="text-orange-500 cursor-pointer hover:underline">Get Approval ›</p>
            </div>

            {/* Welcome Banner */}
            <div className="relative rounded-xl overflow-hidden h-[40vh]">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                    <h1 className="text-white text-4xl font-semibold mb-4">Welcome Boniface</h1>
                    <div className="flex items-center justify-between gap-3 bg-white bg-opacity-90 rounded-lg px-4 py-3 max-w-md">
                        <div className="flex items-center gap-3">
                            <Icon icon="majesticons:link" className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700 text-sm">https://cttaste.com/boniface</span>
                        </div>
                        <Icon icon="majesticons:clipboard-copy" className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                    </div>
                </div>
                {/* Background decoration - you can replace with an actual image */}
                <div className="absolute top-0 right-0 w-full h-full bg-[url(/banner.png)] opacity-50 bg-cover"></div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard
                    title="Total Sale"
                    value="₦ 4,315"
                    subtitle="Sales made this month"
                    icon="majesticons:money-line"
                />
                <DashboardCard
                    title="Menu Count"
                    value="12"
                    subtitle="Your menu created"
                    icon="majesticons:menu-line"
                />
                <DashboardCard
                    title="Total Order"
                    value="200"
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
                    <MonthlyChart />
                </LargeCard>
            </div>
        </div>
    );
}