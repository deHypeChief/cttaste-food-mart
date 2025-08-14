import { Icon } from "@iconify/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: "Jan", sales: 45000, orders: 89, revenue: 2250000 },
  { month: "Feb", sales: 52000, orders: 104, revenue: 2600000 },
  { month: "Mar", sales: 48000, orders: 96, revenue: 2400000 },
  { month: "Apr", sales: 61000, orders: 122, revenue: 3050000 },
  { month: "May", sales: 58000, orders: 116, revenue: 2900000 },
  { month: "Jun", sales: 67000, orders: 134, revenue: 3350000 },
  { month: "Jul", sales: 73000, orders: 146, revenue: 3650000 },
  { month: "Aug", sales: 69000, orders: 138, revenue: 3450000 },
  { month: "Sep", sales: 64000, orders: 128, revenue: 3200000 },
  { month: "Oct", sales: 71000, orders: 142, revenue: 3550000 },
  { month: "Nov", sales: 78000, orders: 156, revenue: 3900000 },
  { month: "Dec", sales: 85000, orders: 170, revenue: 4250000 },
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs">
        <div className="font-semibold">{label}</div>
        <div className="text-orange-300">₦{data.sales.toLocaleString()}</div>
        <div className="text-gray-300">{data.orders} orders</div>
      </div>
    );
  }
  return null;
};

export function MonthlyChart() {
  return (
    <div className="space-y-4 w-full">
      {/* Chart Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 0,
              left: 0,
              bottom: 5,
            }}
          >
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              fontSize={12}
              fill="#666"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              fontSize={12}
              fill="#666"
              tickFormatter={(value) => `₦${(value / 1000)}k`}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(251, 146, 60, 0.1)' }}
            />
            <Bar 
              dataKey="sales" 
              fill="#fb923c" 
              radius={[4, 4, 0, 0]}
              name="Sales"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-400 rounded"></div>
          <span>Monthly Revenue (₦)</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon="majesticons:info-circle" className="w-4 h-4" />
          <span>Hover for details</span>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          Average: ₦{Math.round(chartData.reduce((sum, item) => sum + item.sales, 0) / chartData.length).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
