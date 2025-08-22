import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/button";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { vendorService } from "../../api/vendor";
import { ordersService } from "../../api/orders";

export default function Checkout() {
    const navigate = useNavigate();
    const { user, isAuthenticated, userType, isLoading } = useAuth();
    const { items, loading: cartLoading, clear } = useCart();
    // (Deprecated) multi-link fallback removed; we now redirect directly to first WhatsApp link

    // Group cart items by vendorId
    const groups = useMemo(() => {
        const map = new Map();
        (items || []).forEach((it) => {
            const key = it.vendorId;
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(it);
        });
        return map;
    }, [items]);

    // Fetch vendor details for pickup location and delivery fee
    const [vendorsInfo, setVendorsInfo] = useState({}); // { [vendorId]: vendor }
    useEffect(() => {
        let alive = true;
        (async () => {
            const ids = Array.from(groups.keys()).filter(Boolean);
            const missing = ids.filter((id) => !vendorsInfo[id]);
            if (!missing.length) return;
            try {
                const results = await Promise.allSettled(missing.map((id) => vendorService.getPublic(id)));
                if (!alive) return;
                const next = { ...vendorsInfo };
                results.forEach((res, idx) => {
                    const id = missing[idx];
                    if (res.status === 'fulfilled') {
                        next[id] = res.value?.data?.vendor || null;
                    } else {
                        next[id] = null;
                    }
                });
                setVendorsInfo(next);
            } catch { /* ignore */ }
        })();
        return () => { alive = false; };
    }, [groups, vendorsInfo]);

    // Delivery option
    const [deliveryOption, setDeliveryOption] = useState('pickup'); // 'pickup' | 'doorstep'

    const itemsTotal = useMemo(() => {
        return (items || []).reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0);
    }, [items]);

    const deliveryFees = useMemo(() => {
        if (deliveryOption !== 'doorstep') return 0;
        let fee = 0;
        for (const vid of groups.keys()) {
            const v = vendorsInfo[vid];
            fee += Number(v?.deliveryFee || 0);
        }
        return fee;
    }, [deliveryOption, groups, vendorsInfo]);

    const grandTotal = itemsTotal + deliveryFees;

    const customer = {
        name: user?.session?.fullName || user?.user?.username || '—',
        phone: user?.user?.phoneNumber || '—',
        email: user?.session?.email || '—',
        address: user?.user?.address || '',
    };

    // Only signed-in customers can access this page
    useEffect(() => {
        if (isLoading) return; // wait until auth resolves
        const isCustomer = isAuthenticated && userType === 'customer';
        if (!isCustomer) {
            navigate('/auth/login?type=customer', { replace: true });
        }
    }, [isAuthenticated, userType, isLoading, navigate]);

    // Removed auto-redirect to /cart so we can jump straight to WhatsApp after ordering.

    const placeOrders = async () => {
        if (!isAuthenticated || userType !== 'customer') return;
        // Validate address for doorstep
        if (deliveryOption === 'doorstep' && !customer.address.trim()) {
            alert('Please add your delivery address in your profile before placing a doorstep delivery.');
            return;
        }
        try {
            const payloads = [];
            for (const [vendorId, vendorItems] of groups.entries()) {
                if (!vendorItems?.length) continue;
                const vinfo = vendorsInfo[vendorId];
                const addr = deliveryOption === 'doorstep'
                    ? customer.address
                    : (vinfo?.address || vinfo?.location || 'Pickup at vendor');
                payloads.push({
                    vendorId,
                    address: addr,
                    items: vendorItems.map((it) => ({
                        menuItemId: it.menuItemId,
                        name: it.name,
                        price: Number(it.price),
                        quantity: Number(it.quantity),
                        image: it.image,
                    })),
                });
            }
            if (!payloads.length) return;

            // Debug logs for order placement context
            try {
                console.groupCollapsed('[Checkout] Make Order click');
                console.log('Customer:', customer);
                console.log('Delivery option:', deliveryOption);
                console.log('Cart items:', items);
                console.log('Grouped by vendor (ids):', Array.from(groups.keys()));
                console.log('Computed payloads:', payloads);
                console.log('Totals -> items:', itemsTotal, 'deliveryFees:', deliveryFees, 'grand:', grandTotal);
            } finally {
                console.groupEnd?.();
            }
            
            // Place each vendor order separately
            const responses = await Promise.all(payloads.map((p) => ordersService.placeOrder(p)));
            // After orders are created, build the first WhatsApp link and redirect immediately
            try {
                const host = window.location.origin;
                for (let i = 0; i < responses.length; i++) {
                    const res = responses[i];
                    const p = payloads[i];
                    try {
                        const maybe = res?.data?.order || res?.data || res?.order || res;
                        const order = maybe?.order || maybe || null;
                        const orderId = order?._id || order?.id || (order && order._id) || null;
                        const v = vendorsInfo[p.vendorId];
                        if (!v) {
                            console.warn('[Checkout] Missing vendor info for', p.vendorId);
                            continue;
                        }
                        const rawPhone = v?.phoneNumber || v?.phone || '';
                        // Enhanced formatter allowing short test numbers
                        const phone = (() => {
                            if (!rawPhone) return null;
                            let d = String(rawPhone).replace(/\D/g, '');
                            if (!d) return null;
                            if (d.startsWith('0')) d = '234' + d.slice(1); // local leading 0
                            if (d.length === 10 && !d.startsWith('234')) d = '234' + d; // local 10-digit
                            if (d.length < 10) {
                                // Accept short test numbers (e.g., 3333) by prefixing 234 if missing
                                if (!d.startsWith('234')) d = '234' + d;
                                console.warn('[Checkout] Using fallback WhatsApp number for short test value:', d, '(raw:', rawPhone, ')');
                            }
                            return d;
                        })();
                        if (!phone) {
                            console.warn('[Checkout] No valid phone for vendor', p.vendorId, 'raw:', rawPhone);
                            continue;
                        }
                        const vendorTotal = (p.items || []).reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0);
                        const itemCount = (p.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
                        let msg = '';
                        msg += `from: ${customer.name}\n`;
                        msg += `total: ₦ ${vendorTotal.toLocaleString()}\n`;
                        msg += `items: ${itemCount}\n`;
                        msg += `----------------------------------\n`;
                        for (const it of p.items) {
                            msg += `*${it.name}*\n`;
                            msg += `Oty: ${it.quantity}\n`;
                            msg += `Amt: ₦ ${Number(it.price * it.quantity).toLocaleString()}\n`;
                            msg += `\n`;
                        }
                        if (orderId) {
                            const vorderUrl = `${host}/vorder/${orderId}`;
                            msg += `Order summary: ${vorderUrl}\n`;
                        }
                        const wa = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                        // Persist + log before redirect so user can see it
                        try {
                            console.group('[Checkout] WhatsApp Redirect');
                            console.info('WhatsApp link:', wa);
                            console.info('NOTE: Redirecting in 800ms. Copy link if needed.');
                            console.groupEnd();
                        } catch { /* ignore */ }
                        try { localStorage.setItem('lastWaLink', wa); } catch { /* ignore */ }
                        try { navigator.clipboard?.writeText(wa).catch(() => {}); } catch { /* ignore */ }
                        // Slight delay so log flushes & DevTools can catch it
                        setTimeout(() => { window.location.assign(wa); }, 800);
                        return; // stop after scheduling redirect
                    } catch { /* ignore and try next */ }
                }
            } catch (err) {
                console.warn('Failed to open WhatsApp links after order placement', err);
            }


            try {
                console.groupCollapsed('[Checkout] Order responses');
                console.log('Responses:', responses);
            } finally {
                console.groupEnd?.();
            }
            // If we got here, no WA link was produced; navigate to orders page and clear cart.
            await clear?.();
            navigate('/user/orders');
        } catch (e) {
            console.error('Failed to place order(s)', e);
            alert(e?.response?.data?.message || e.message || 'Failed to place order');
        }
    };

    return (
        <>
            <div className="mx-5 md:mx-20 md:ml-24">
                <div className="mt-10">
                    <h1 className="text-3xl font-semibold">My Order</h1>
                </div>

                <div className="mt-10 md:grid grid-cols-[1fr_0.5fr] gap-10 space-y-10 md:space-y-0">
                    <div className="space-y-5">
                        <div className="bg-white p-7 rounded-xl ">
                            <div className="border-b border-border pb-3 flex justify-between items-center ">
                                <p className="font-semibold text-lg">Customer Info</p>
                                <Link to="/user/profile" className="font-medium text-sm text-primary">Edit Customer Info</Link>
                            </div>

                            <div className="space-y-3 pt-5">
                                <h1 className="text-xl font-medium">{customer.name}</h1>
                                <div>
                                    <p className="text-[1rem] font-medium opacity-60">{customer.phone}</p>
                                    <p className="text-[1rem] font-medium opacity-60">{customer.email}</p>
                                    <p className="text-[1rem] font-medium opacity-60">{customer.address || 'No address set'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-7 rounded-xl ">
                            <div className="border-b border-border pb-3 flex justify-between items-center ">
                                <p className="font-semibold text-lg">Pick Up Location</p>
                            </div>
                            <div className="space-y-5 pt-5">
                                {Array.from(groups.keys()).map((vid) => {
                                    const v = vendorsInfo[vid];
                                    return (
                                        <div key={vid}>
                                            <h1 className="text-xl font-medium">{v?.restaurantName || 'Vendor'}</h1>
                                            <div>
                                                <p className="text-[1rem] font-medium opacity-60">{v?.phoneNumber || '—'}</p>
                                                <p className="text-[1rem] font-medium opacity-60">{v?.location || '—'}</p>
                                                <p className="text-[1rem] font-medium opacity-60">{v?.address || ''}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {groups.size === 0 && <p className="opacity-60">No vendors in cart</p>}
                            </div>
                        </div>

                        <div className="bg-white p-7 rounded-xl ">
                            <div className="border-b border-border pb-3 flex justify-between items-center ">
                                <p className="font-semibold text-lg">Delivery Summary</p>
                                {/* Optional: link to edit cart */}
                            </div>
                            <div className="space-y-8 pt-10">
                                {Array.from(groups.entries()).map(([vid, vitems]) => {
                                    const v = vendorsInfo[vid];
                                    return (
                                        <div key={vid} className="space-y-3">
                                            <div className="bg-primary text-white inline-flex items-center px-3 py-1 rounded text-xs font-medium">
                                                <p>From</p>
                                            </div>
                                            <h2 className="text-xl font-medium mt-1">{v?.restaurantName || 'Vendor'}</h2>
                                            {vitems.map((ci, idx) => (
                                                <div key={idx} className="p-4 py-0 rounded-xl flex items-center justify-between">
                                                    <div className="flex gap-5">
                                                        <div className="h-[84px] w-[84px] rounded-xl bg-gray-200 overflow-hidden">
                                                            {ci.image && <img src={ci.image} alt={ci.name} className="w-full h-full object-cover" />}
                                                        </div>
                                                        <div className="flex flex-col justify-center">
                                                            <p className="font-medium opacity-80">{ci.name}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-xl text-right">₦ {Number(ci.price).toLocaleString()}</h3>
                                                        <p className="text-right font-medium text-sm opacity-60">Qty: {ci.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                                {groups.size === 0 && <p className="opacity-60">Your cart is empty</p>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="w-full bg-white rounded-lg p-5 space-y-5 h-fit sticky top-24">
                            <div className="border-b border-border pb-3">
                                <p className="font-semibold text-lg">Cart Summary</p>
                            </div>
                            {/* Removed manual multi-chat fallback UI */}
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" name="delopt" value="pickup" checked={deliveryOption === 'pickup'} onChange={() => setDeliveryOption('pickup')} />
                                    Pick up
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" name="delopt" value="doorstep" checked={deliveryOption === 'doorstep'} onChange={() => setDeliveryOption('doorstep')} />
                                    Door step delivery
                                </label>
                            </div>
                            <div className="border-b border-border space-y-3 pb-5">
                                <div className="flex justify-between items-center opacity-60 ">
                                    <p className="font-medium text-[1rem]">Items({items?.length || 0})</p>
                                    <p className="font-medium text-[1rem]">₦ {itemsTotal.toLocaleString()}</p>
                                </div>
                                {deliveryOption === 'doorstep' && Array.from(groups.keys()).map((vid) => {
                                    const v = vendorsInfo[vid];
                                    const fee = Number(v?.deliveryFee || 0);
                                    return (
                                        <div key={vid} className="flex justify-between items-center opacity-60">
                                            <p className="font-medium text-[1rem]">Delivery Fee: {v?.restaurantName || 'Vendor'}</p>
                                            <p className="font-medium text-[1rem]">₦ {fee.toLocaleString()}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between">
                                <h3 className="font-semibold text-2xl">Total</h3>
                                <h3 className="font-semibold text-2xl">₦ {grandTotal.toLocaleString()}</h3>
                            </div>
                            <Button className="w-full px-6 py-3" onClick={placeOrders} disabled={!items?.length || cartLoading || !isAuthenticated || userType !== 'customer'}>
                                Make Order
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}