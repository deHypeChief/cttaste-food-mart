import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { DashboardCard, LargeCard } from "../../components/dashboardCard";
import { MonthlyChart } from "../../components/monthlyChart";
import Button from "../../components/button";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ordersService } from "../../api/orders";

const PIE_COLORS = ['#fb923c', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function Analysis() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  // Derived datasets
  const [revenueTrendData, setRevenueTrendData] = useState([]); // last 6 months
  const [pieData, setPieData] = useState([]); // top items share in period
  const [weeklyOrdersData, setWeeklyOrdersData] = useState([]); // last 7 days
  const [topItemsData, setTopItemsData] = useState([]); // top 5 items list in period
  const [monthlyChartData, setMonthlyChartData] = useState([]); // 12-month series

  const [cards, setCards] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrder: 0,
  });

  // Determine if there is any meaningful data to show
  const hasData = (orders?.length || 0) > 0 && (
    Number(cards.totalOrders) > 0 ||
    Number(cards.totalRevenue) > 0 ||
    (monthlyChartData || []).some(d => Number(d?.orders) > 0 || Number(d?.revenue) > 0)
  );

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await ordersService.listVendorOrders();
        const list = res?.data?.orders || [];
        setOrders(list);

        // Build 12-month series (current year)
        const now = new Date();
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const year = now.getFullYear();
        const monthly = months.map((m, idx) => {
          const start = new Date(year, idx, 1);
          const end = new Date(year, idx + 1, 0, 23, 59, 59, 999);
          const inRange = list.filter(o => {
            const d = new Date(o.createdAt);
            return d >= start && d <= end;
          });
          const sales = inRange.filter(o => o.status === 'Completed').reduce((s, o) => s + Number(o.total || 0), 0);
          return { month: m, sales, orders: inRange.length, revenue: sales };
        });
        setMonthlyChartData(monthly);

        // Revenue trend for last 6 months (from monthly)
        setRevenueTrendData(monthly.slice(Math.max(0, monthly.length - 6)));
      } catch (e) {
        setError(e.message || 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Recompute period-based datasets when orders or period changes
  useEffect(() => {
    if (!orders.length) return;

    const days = Number(selectedPeriod) || 30;
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (days - 1));

    const inPeriod = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= start && d <= now;
    });

    // Cards
    const revenue = inPeriod.filter(o => o.status === 'Completed').reduce((s, o) => s + Number(o.total || 0), 0);
    const count = inPeriod.length;
    setCards({
      totalRevenue: revenue,
      totalOrders: count,
      avgOrder: count ? Math.round(revenue / count) : 0,
    });

    // Pie data: top items share by revenue in period (top 5)
    const itemMap = new Map();
    inPeriod.forEach(o => {
      (o.items || []).forEach(it => {
        const key = it.name || String(it.menuItemId);
        const rev = Number(it.price || 0) * Number(it.quantity || 0);
        const prev = itemMap.get(key) || { name: key, orders: 0, revenue: 0 };
        prev.orders += Number(it.quantity || 0);
        prev.revenue += rev;
        itemMap.set(key, prev);
      });
    });
    const itemsArr = Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue);
    const top5 = itemsArr.slice(0, 5);
    const totalRevTop = top5.reduce((s, x) => s + x.revenue, 0) || 1;
    const pie = top5.map((x, i) => ({ name: x.name, value: Math.round((x.revenue / totalRevTop) * 100), color: PIE_COLORS[i % PIE_COLORS.length] }));
    setPieData(pie);
  setTopItemsData(top5.map((x) => ({ name: x.name, orders: x.orders, revenue: x.revenue, percentage: Math.round((x.revenue / totalRevTop) * 100) })));

    // Weekly orders: last 7 days
    const daysCount = 7;
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weekSeries = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const startDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const endDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayOrders = inPeriod.filter(o => {
        const od = new Date(o.createdAt);
        return od >= startDay && od <= endDay;
      });
      const dayRevenue = dayOrders.filter(o => o.status === 'Completed').reduce((s, o) => s + Number(o.total || 0), 0);
      weekSeries.push({ day: dayNames[d.getDay()], orders: dayOrders.length, revenue: dayRevenue });
    }
    setWeeklyOrdersData(weekSeries);
  }, [orders, selectedPeriod]);

  // Helpers: export, print, share
  const downloadBlob = (content, mimeType, filename) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        periodDays: Number(selectedPeriod),
        summary: {
          totalRevenue: cards.totalRevenue,
          totalOrders: cards.totalOrders,
          avgOrder: cards.avgOrder,
        },
        datasets: {
          monthlyChartData,
          revenueTrendData,
          weeklyOrdersData,
          topItemsData,
          pieData,
        },
      };
      const date = new Date().toISOString().split('T')[0];
      downloadBlob(JSON.stringify(report, null, 2), 'application/json', `analysis-report-${date}.json`);
    } catch (e) {
      console.error('Export failed', e);
      alert('Failed to export report.');
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error('Print failed', e);
    }
  };

  const handleShare = async () => {
    const title = 'Sales Analysis Report';
    const text = `Period: Last ${selectedPeriod} days\nTotal Revenue: ₦${Number(cards.totalRevenue).toLocaleString()}\nTotal Orders: ${cards.totalOrders}\nAverage Order: ₦${Number(cards.avgOrder).toLocaleString()}`;
    const url = window.location?.href || '';
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch {
      // ignore and fallback to clipboard
    }
    // Clipboard fallback
    const summary = `${title}\n${text}${url ? `\n${url}` : ''}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
        alert('Report summary copied to clipboard.');
      } else {
        const ta = document.createElement('textarea');
        ta.value = summary;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
        alert('Report summary copied to clipboard.');
      }
    } catch (e) {
      console.error('Share failed', e);
      alert('Sharing is not supported in this browser.');
    }
  };

  return (
    <div className="bg-[#fdf6f1] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-0">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-sm text-gray-500 mb-4">Loading analysis…</div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-3 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Sales Analysis</h1>
          
          {/* Period Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600">Period:</span>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

      {/* Empty/Inactive State */}
      {!loading && !hasData ? (
        <div className="bg-white rounded-xl p-10 border border-dashed border-gray-200 text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <Icon icon="majesticons:chart-bar-line" className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-gray-800 font-medium">No data yet — try making some sales</p>
          <p className="text-sm text-gray-500 mt-1">Your analytics will appear here once orders start coming in.</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Revenue"
              value={`₦${Number(cards.totalRevenue).toLocaleString()}`}
              subtitle={`Last ${selectedPeriod} days`}
              icon="majesticons:money-line"
            />
            <DashboardCard
              title="Total Orders"
              value={String(cards.totalOrders)}
              subtitle={`Last ${selectedPeriod} days`}
              icon="majesticons:box-line"
            />
            <DashboardCard
              title="Average Order Value"
              value={`₦${Number(cards.avgOrder).toLocaleString()}`}
              subtitle={`Last ${selectedPeriod} days`}
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
        <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrendData}>
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
            <LargeCard title="Top Items Share" icon="majesticons:pie-chart-line">
              <div className="h-64 sm:h-80 flex items-center justify-center">
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
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
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pieData.map((item, index) => (
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
              <div className="h-64 sm:h-80">
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
              <MonthlyChart data={monthlyChartData} />
            </LargeCard>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center items-stretch gap-3 sm:gap-4">
            <Button onClick={handleExport} className="w-full sm:w-auto" variant="primary" icon="majesticons:download-line">
              Export Report
            </Button>
            <Button onClick={handlePrint} className="w-full sm:w-auto" variant="outlineFade" icon="majesticons:printer-line">
              Print Analysis
            </Button>
            <Button onClick={handleShare} className="w-full sm:w-auto" variant="outlineFade" icon="majesticons:share-line">
              Share Report
            </Button>
          </div>
        </>
      )}
      </div>
    </div>
  );
}