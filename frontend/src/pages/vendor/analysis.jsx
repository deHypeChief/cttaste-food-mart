import { useState } from "react";
import { Icon } from "@iconify/react";
import { DashboardCard, LargeCard } from "../../components/dashboardCard";
import { MonthlyChart } from "../../components/monthlyChart";
import Button from "../../components/button";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Sample analytics data
const revenueData = [
  { month: "Jan", revenue: 2250000, orders: 89, avgOrder: 25280 },
  { month: "Feb", revenue: 2600000, orders: 104, avgOrder: 25000 },
  { month: "Mar", revenue: 2400000, orders: 96, avgOrder: 25000 },
  { month: "Apr", revenue: 3050000, orders: 122, avgOrder: 25000 },
  { month: "May", revenue: 2900000, orders: 116, avgOrder: 25000 },
  { month: "Jun", revenue: 3350000, orders: 134, avgOrder: 25000 },
];

const categoryData = [
  { name: 'Rice Dishes', value: 35, color: '#fb923c' },
  { name: 'Soups', value: 25, color: '#3b82f6' },
  { name: 'Proteins', value: 20, color: '#10b981' },
  { name: 'Beverages', value: 12, color: '#f59e0b' },
  { name: 'Others', value: 8, color: '#ef4444' },
];

const weeklyOrdersData = [
  { day: 'Mon', orders: 45, revenue: 1125000 },
  { day: 'Tue', orders: 52, revenue: 1300000 },
  { day: 'Wed', orders: 38, revenue: 950000 },
  { day: 'Thu', orders: 61, revenue: 1525000 },
  { day: 'Fri', orders: 78, revenue: 1950000 },
  { day: 'Sat', orders: 94, revenue: 2350000 },
  { day: 'Sun', orders: 67, revenue: 1675000 },
];

const topItemsData = [
  { name: "Fried Rice", orders: 156, revenue: 3900000, percentage: 22 },
  { name: "Jollof Rice", orders: 134, revenue: 3350000, percentage: 19 },
  { name: "Pepper Soup", orders: 98, revenue: 2450000, percentage: 14 },
  { name: "Grilled Chicken", orders: 87, revenue: 2175000, percentage: 12 },
  { name: "Fish Stew", orders: 76, revenue: 1900000, percentage: 11 },
];

export default function Analysis() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  return (
    <div className="bg-[#fdf6f1] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Sales Analysis</h1>
        
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Period:</span>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Revenue"
          value="₦18.5M"
          subtitle="+12.5% from last month"
          icon="majesticons:money-line"
        />
        <DashboardCard
          title="Total Orders"
          value="1,247"
          subtitle="+8.2% from last month"
          icon="majesticons:box-line"
        />
        <DashboardCard
          title="Average Order Value"
          value="₦14,850"
          subtitle="+3.1% from last month"
          icon="majesticons:trending-up-line"
        />
        <DashboardCard
          title="Customer Satisfaction"
          value="4.8/5"
          subtitle="Based on 234 reviews"
          icon="majesticons:star-line"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <LargeCard title="Revenue Trend" icon="majesticons:chart-line">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => `₦${(value / 1000000)}M`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip 
                  formatter={(value) => [`₦${(value / 1000000).toFixed(1)}M`, 'Revenue']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#fb923c" 
                  strokeWidth={2}
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </LargeCard>

        {/* Sales by Category */}
        <LargeCard title="Sales by Category" icon="majesticons:pie-chart-line">
          <div className="h-80 flex items-center justify-center">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Share']}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </LargeCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Orders */}
        <LargeCard title="Weekly Order Pattern" icon="majesticons:calendar-line">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyOrdersData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'orders' ? `${value} orders` : `₦${(value / 1000000).toFixed(1)}M`,
                    name === 'orders' ? 'Orders' : 'Revenue'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </LargeCard>

        {/* Top Performing Items */}
        <LargeCard title="Top Performing Items" icon="majesticons:trophy-line">
          <div className="space-y-4">
            {topItemsData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.orders} orders</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">₦{(item.revenue / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </LargeCard>
      </div>

      {/* Monthly Sales Chart */}
      <div className="mb-8">
        <LargeCard title="Monthly Sales Overview" icon="majesticons:chart-bar-line">
          <MonthlyChart />
        </LargeCard>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button variant="primary" icon="majesticons:download-line">
          Export Report
        </Button>
        <Button variant="outlineFade" icon="majesticons:printer-line">
          Print Analysis
        </Button>
        <Button variant="outlineFade" icon="majesticons:share-line">
          Share Report
        </Button>
      </div>
    </div>
  );
}