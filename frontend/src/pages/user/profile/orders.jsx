import { Icon } from "@iconify/react";
import Button from "../../../components/button";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ordersService } from "../../../api/orders";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const response = await ordersService.listUserOrders();
                // apiClient returns the raw response body from backend, which uses SuccessHandler:
                // { success, message, data: { orders: [...] } }
                let ordersData = [];
                if (Array.isArray(response)) ordersData = response;
                else if (response?.data?.orders) ordersData = response.data.orders;
                else if (response?.orders) ordersData = response.orders;
                else if (response?.data && Array.isArray(response.data)) ordersData = response.data;
                setOrders(ordersData || []);
            } catch (err) {
                console.error('Failed to fetch orders', err);
                setError("Failed to fetch orders");
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const navigate = useNavigate();

    return (
        <div className="bg-white p-7 rounded-xl ">
            <div className="border-b border-border pb-3 flex justify-between items-center ">
                <p className="font-semibold text-lg">My Orders</p>
            </div>
            <div className="space-y-5 pt-5">
                {loading && <div>Loading orders...</div>}
                {error && <div className="text-red-500">{error}</div>}
                {!loading && !error && orders.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-lg font-semibold">No orders yet</p>
                        <p className="opacity-60 mt-2">You have no past or new orders.</p>
                        <div className="mt-4 flex justify-center">
                            <Button onClick={() => navigate('/')}>Go home</Button>
                        </div>
                    </div>
                )}
                {!loading && !error && orders.length > 0 && orders.map(order => {
                    const firstItem = order.items && order.items.length ? order.items[0] : null;
                    const totalQty = order.items ? order.items.reduce((s, it) => s + (it.quantity || 0), 0) : (order.quantity || 1);
                    const orderId = order.id || order._id;
                    const orderDate = order.createdAt || order.date;
                    return (
                        <div key={orderId} className="p-4 py-0 rounded-xl md:flex items-center justify-between space-y-5 md:space-y-0 bg-gray-50">
                            <div className="flex gap-5">
                                <div className="h-[100px] w-[100px] rounded-xl overflow-hidden bg-gray-100">
                                    {firstItem?.image || order.vendorAvatar ? (
                                        <img src={firstItem?.image || order.vendorAvatar} alt="item" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400">No image</div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-between py-2">
                                    <div>
                                        <div className="bg-primary text-white inline-flex items-center px-3 py-1 rounded text-xs font-medium top-4 left-5">
                                            <p>From</p>
                                        </div>
                                        <h2 className="text-xl font-medium mt-1">
                                            {order.vendorName || (order.vendor && order.vendor.restaurantName) || "Vendor"}
                                        </h2>
                                    </div>
                                    <p className="font-medium opacity-60">{firstItem?.name || firstItem?.title || "Item"}</p>
                                </div>
                            </div>
                            <div>
                                <div className="flex md:flex-row-reverse justify-between items-center gap-2 md:gap-5">
                                    <div className="md:w-[200px]">
                                        <h3 className="font-semibold md:text-2xl md:text-right">N {order.total}</h3>
                                        <p className="md:text-right font-medium text-lg opacity-60">Qty: {totalQty}</p>
                                    </div>
                                    <div className="md:w-[200px]">
                                        <p className="md:text-right text-xs opacity-60">{order.status}</p>
                                        <p className="md:text-right text-xs opacity-60">{orderDate ? new Date(orderDate).toLocaleDateString() : ''}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}