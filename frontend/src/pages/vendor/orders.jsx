import OrdersTable from "../../components/ordersTable";
import { DashboardCard, LargeCard } from "../../components/dashboardCard";
import { Input } from "../../components/form";
import Button from "../../components/button";
import { Icon } from "@iconify/react";

const columns = [
	{ key: "orderId", label: "Order ID" },
	{ key: "customer", label: "Customer" },
	{ key: "total", label: "Total" },
	{ key: "address", label: "Address" },
	{ key: "date", label: "Date" },
];

const data = [
	{
		orderId: "OID-239048202450",
		customer: "James Bond Flied",
		total: "N 35000",
		address: "No 20 Wistron church...",
		date: "2021-Jan-20",
	},
	// ...repeat for demo
	{
		orderId: "OID-239048202450",
		customer: "James Bond Flied",
		total: "N 35000",
		address: "No 20 Wistron church...",
		date: "2021-Jan-20",
	},
	{
		orderId: "OID-239048202450",
		customer: "James Bond Flied",
		total: "N 35000",
		address: "No 20 Wistron church...",
		date: "2021-Jan-20",
	},
	{
		orderId: "OID-239048202450",
		customer: "James Bond Flied",
		total: "N 35000",
		address: "No 20 Wistron church...",
		date: "2021-Jan-20",
	},
	{
		orderId: "OID-239048202450",
		customer: "James Bond Flied",
		total: "N 35000",
		address: "No 20 Wistron church...",
		date: "2021-Jan-20",
	},
	{
		orderId: "OID-239048202450",
		customer: "James Bond Flied",
		total: "N 35000",
		address: "No 20 Wistron church...",
		date: "2021-Jan-20",
	},
];

export default function VendorOrders() {
	return (
		<div className="bg-[#fdf6f1] min-h-screen">
			<h1 className="text-3xl font-semibold mb-8">Your Orders</h1>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<DashboardCard
					title="Todays Order"
					value="10"
					subtitle="Incoming orders today"
					icon="majesticons:box-line"
				/>
				<DashboardCard
					title="Todays Pending Order"
					value="2"
					subtitle="Your pending orders today"
					icon="majesticons:box-line"
				/>
				<DashboardCard
					title="Total Orders"
					value="12"
					subtitle="Orders made this month"
					icon="majesticons:menu-line"
				/>
			</div>
			<div className="flex flex-col md:flex-row items-center gap-4 mb-6">
				<div className="flex-1 w-full">
					<Input
						type="text"
						placeholder="Search Orders"
						icon="majesticons:search-line"
						className="w-[500px]"
					/>
				</div>
				<Button 
					variant="outlineFade"
					icon="majesticons:filter-line"
					iconPosition="left"
                    className="py-3"
				>
					Date Sort
				</Button>
			</div>
			{/* <LargeCard title="Orders Overview"> */}
				<OrdersTable columns={columns} data={data} />
			{/* </LargeCard> */}
		</div>
	);
}