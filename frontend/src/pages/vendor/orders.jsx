import OrdersTable from "../../components/ordersTable";
import { DashboardCard, LargeCard } from "../../components/dashboardCard";
import { Input } from "../../components/form";
import Button from "../../components/button";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { ordersService } from "../../api/orders";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/dialog";

const columns = [
	{ key: "orderId", label: "Order ID" },
	{ key: "customer", label: "Customer" },
	{ key: "total", label: "Total" },
	{ key: "address", label: "Address" },
	{ key: "date", label: "Date" },
];

export default function VendorOrders() {
	const [orders, setOrders] = useState([]);
	// const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [detail, setDetail] = useState(null);
	const [detailOpen, setDetailOpen] = useState(false);
	const [updating, setUpdating] = useState(false);

	const loadOrders = async () => {
	// setLoading(true);
		setError("");
		try {
			const res = await ordersService.listVendorOrders();
			const list = res?.data?.orders || [];
			setOrders(list);
		} catch (e) {
			setError(e.message || "Failed to load orders");
		} finally {
			// setLoading(false);
		}
	};

	useEffect(() => {
		loadOrders();
	}, []);

	const rows = useMemo(() => {
		const toRow = (o) => ({
			_id: o._id,
			orderId: o.orderNumber,
			customer: o.userId?.username || o.userId?.fullName || o.userId || "Customer",
			total: `₦ ${Number(o.total).toLocaleString()}`,
			address: o.address?.slice(0, 24) + (o.address?.length > 24 ? '...' : ''),
			date: new Date(o.createdAt).toISOString().split('T')[0],
		});
		const list = orders.map(toRow);
		if (!search) return list;
		const s = search.toLowerCase();
		return list.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(s)));
	}, [orders, search]);

	const openDetails = async (row) => {
		try {
			const res = await ordersService.getVendorOrder(row._id);
			setDetail(res?.data?.order || null);
			setDetailOpen(true);
		} catch (e) {
			setError(e.message || "Failed to fetch order details");
		}
	};

	const updateStatus = async (newStatus) => {
		if (!detail?._id) return;
		setUpdating(true);
		try {
			const res = await ordersService.updateOrderStatus(detail._id, newStatus);
			setDetail(res?.data?.order || detail);
			await loadOrders();
		} catch (e) {
			setError(e.message || "Failed to update status");
		} finally {
			setUpdating(false);
		}
	};

	return (
		<div className="bg-[#fdf6f1] min-h-screen">
			<h1 className="text-3xl font-semibold mb-8">Your Orders</h1>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<DashboardCard
					title="Todays Order"
					value={orders.length.toString()}
					subtitle="Incoming orders today"
					icon="majesticons:box-line"
				/>
				<DashboardCard
					title="Todays Pending Order"
					value={orders.filter(o => o.status === 'Pending').length.toString()}
					subtitle="Your pending orders today"
					icon="majesticons:box-line"
				/>
				<DashboardCard
					title="Total Orders"
					value={orders.length.toString()}
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
						className="w-full sm:w-[500px]"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
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
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
			)}
			{/* Responsive table wrapper for horizontal scroll on small screens */}
			<div className="overflow-x-auto -mx-4 sm:mx-0">
				<div className="inline-block align-middle min-w-[800px] sm:min-w-0 w-full">
					<OrdersTable columns={columns} data={rows} onRowClick={openDetails} />
				</div>
			</div>

			<Dialog open={detailOpen} onOpenChange={setDetailOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Order Details</DialogTitle>
					</DialogHeader>
					{detail ? (
						<div className="space-y-4">
							<div className="flex justify-between">
								<div>
									<p className="text-sm text-gray-500">Order ID</p>
									<p className="font-semibold">{detail.orderNumber}</p>
								</div>
								<div className="text-right">
									<p className="text-sm text-gray-500">Status</p>
									<p className="font-semibold">{detail.status}</p>
								</div>
							</div>
							<div>
								<p className="text-sm text-gray-500">Delivery Address</p>
								<p className="font-medium">{detail.address}</p>
							</div>
							<div className="border rounded-lg overflow-x-auto">
								<table className="w-full min-w-[480px] text-sm">
									<thead>
										<tr className="text-left bg-gray-50">
											<th className="p-2">Item</th>
											<th className="p-2">Qty</th>
											<th className="p-2">Price</th>
										</tr>
									</thead>
									<tbody>
										{detail.items?.map((it, i) => (
											<tr key={i} className="border-t">
												<td className="p-2">{it.name}</td>
												<td className="p-2">{it.quantity}</td>
												<td className="p-2">₦ {Number(it.price).toLocaleString()}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className="flex justify-between items-center">
								<p className="text-lg font-semibold">Total</p>
								<p className="text-lg font-bold">₦ {Number(detail.total).toLocaleString()}</p>
							</div>
						</div>
					) : (
						<p>Loading...</p>
					)}
					<DialogFooter className="mt-6">
						<div className="flex flex-wrap gap-2 w-fit justify-end">
							{['Pending','Accepted','Preparing','Ready','Completed','Cancelled'].map(s => (
								<Button key={s} variant={detail?.status === s ? 'default' : 'outline'} disabled={updating} onClick={() => updateStatus(s)}>
									{s}
								</Button>
							))}
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}