import { Icon } from "@iconify/react/dist/iconify.js";

export function DashboardCard({ title, value, subtitle, icon, className = "" }) {
    return (
        <div className={`bg-white rounded-xl p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
                {icon && (
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon icon={icon} className="w-5 h-5 text-gray-600" />
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <div className="text-3xl font-semibold text-gray-900">{value}</div>
                {subtitle && (
                    <p className="text-gray-500 text-sm">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

export function LargeCard({ title, children, className = "", icon }) {
    return (
        <div className={`bg-white rounded-xl p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-lg font-semibold">{title}</h3>
                {icon && (
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon icon={icon} className="w-5 h-5 text-gray-600" />
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}
