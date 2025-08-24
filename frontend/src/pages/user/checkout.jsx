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
    const { items, loading: cartLoading, clear, packsByVendor, assignments, packItemQuantities } = useCart();
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

    // Build pack grouping per vendor { vendorId: { packId: [items] } }
    const packGroups = useMemo(() => {
        // Build grouping using packItemQuantities so that an item can exist in multiple packs with different quantities.
        const res = {};
        (items || []).forEach(it => {
            const vid = it.vendorId; if (!vid) return;
            const vendorPackQty = packItemQuantities?.[vid];
            if (vendorPackQty) {
                Object.entries(vendorPackQty).forEach(([pid, obj]) => {
                    const qty = obj[it.menuItemId];
                    if (!qty) return;
                    if (!res[vid]) res[vid] = {};
                    if (!res[vid][pid]) res[vid][pid] = [];
                    res[vid][pid].push({ ...it, quantity: qty });
                });
            } else {
                const packId = assignments[it.menuItemId]?.packId || 'pack-1';
                if (!res[vid]) res[vid] = {};
                if (!res[vid][packId]) res[vid][packId] = [];
                res[vid][packId].push(it);
            }
        });
        return res;
    }, [items, assignments, packItemQuantities]);

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
    const [deliverySelections, setDeliverySelections] = useState({}); // { vendorId: { location: string, price: number } }
    const [deliveryInstructions, setDeliveryInstructions] = useState('');

    const itemsTotal = useMemo(() => {
        return (items || []).reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0);
    }, [items]);

    const deliveryFees = useMemo(() => {
        if (deliveryOption !== 'doorstep') return 0;
        let fee = 0;
        for (const vid of groups.keys()) {
            const sel = deliverySelections[vid];
            if (sel && typeof sel.price === 'number') {
                fee += Number(sel.price) || 0;
                continue;
            }
            const v = vendorsInfo[vid];
            const locations = v?.deliveryLocations || [];
            if (Array.isArray(locations) && locations.length) {
                const prices = locations.map(l => Number(l?.price || 0)).filter(p => !isNaN(p));
                if (prices.length) fee += Math.min(...prices);
                else fee += Number(v?.deliveryFee || 0);
            } else {
                fee += Number(v?.deliveryFee || 0);
            }
        }
        return fee;
    }, [deliveryOption, groups, vendorsInfo, deliverySelections]);

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
                const sel = deliverySelections[vendorId];
                payloads.push({
                    vendorId,
                    address: addr,
                    deliveryMode: deliveryOption,
                    deliveryLocation: deliveryOption === 'doorstep' ? sel?.location : undefined,
                    deliveryPrice: deliveryOption === 'doorstep' ? (sel ? Number(sel.price || 0) : undefined) : undefined,
                    deliveryInstructions: deliveryOption === 'doorstep' ? (deliveryInstructions || undefined) : undefined,
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
                        const deliveryPrice = Number(p.deliveryPrice || 0);
                        const vendorSubtotal = (p.items || []).reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0);
                        const vendorTotal = vendorSubtotal + deliveryPrice;
                        // itemCount not used in new message format

                        // Build WhatsApp message in the requested layout
                        // Build message in the requested format (with emojis)
                        let msg = '';
                        const vendorName = v?.restaurantName || 'VENDOR';
                        msg += `🧾 ORDER FROM ${vendorName} 🍴\n`;
                        msg += `📦 ORDER DETAILS\n`;
                        msg += `🔖 Order ID : ${orderId || '—'}\n`;
                        msg += `--•--\n`;

                        // Packs first (use packGroups if available for this vendor)
                        const vendorPackGroups = packGroups[p.vendorId] || {};
                        const orderedPackIds = Object.keys(vendorPackGroups).sort();
                        if (orderedPackIds.length) {
                            orderedPackIds.forEach((pid) => {
                                const def = packsByVendor[p.vendorId]?.[pid];
                                msg += `📦 ${def?.name || pid}\n`;
                                msg += `--•--\n`;
                                const list = vendorPackGroups[pid] || [];
                                list.forEach((it) => {
                                    msg += `🍽️ ${it.name} | qty:${it.quantity}\n`;
                                });
                                msg += `\n`;
                            });
                        } else if (p.items && p.items.length) {
                            // no packs: list plain items
                            msg += `--•--\n`;
                            p.items.forEach((it) => {
                                msg += `🍽️ ${it.name} | qty:${it.quantity}\n`;
                            });
                            msg += `\n`;
                        }

                        // Totals
                        msg += `SUB TOTAL : ₦${vendorSubtotal.toLocaleString()} 💰\n`;
                        msg += `DELIVERY PRICE : ₦${deliveryPrice.toLocaleString()} 🚚\n`;
                        msg += `TOTAL PRICE : ₦${vendorTotal.toLocaleString()} ✅\n`;
                        msg += `------ CUSTOMER DETAILS 👤 ------\n`;
                        msg += `👤 Name : ${customer.name}\n`;
                        if (p.deliveryMode === 'doorstep') {
                            msg += `📍 Location : ${p.deliveryLocation || ''}\n`;
                        }
                        msg += `🏠 Address : ${p.address || customer.address || '—'}\n`;
                        msg += `📞 Phone number : ${customer.phone}\n`;

                        // Delivery instructions when doorstep
                        if (p.deliveryMode === 'doorstep' && p.deliveryInstructions) {
                            msg += `📝 Delivery Instructions : ${p.deliveryInstructions}\n`;
                        }

                        // Price confirmation link (fall back to vorder if no price route known)
                        let priceUrl = `${host}/vorder/${orderId}`;
                        try {
                            const vendorKey = v?._id || v?.id || p.vendorId || '';
                            if (vendorKey && orderId) priceUrl = `https://cttaste.com/price/${vendorKey}/${orderId}`;
                        } catch { /* ignore and use vorder */ }
                        msg += `🔗 PRICE CONFIRMATION\n`;
                        msg += `${priceUrl}\n`;

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
                        // Clear cart before redirect so user's cart is emptied
                        try { await clear?.(); } catch (err) { console.warn('Failed to clear cart before redirect', err); }
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
                                    const vendorPackGroups = packGroups[vid] || {};
                                    const packIds = Object.keys(vendorPackGroups).length ? Object.keys(vendorPackGroups) : ['__all'];
                                    return (
                                        <div key={vid} className="space-y-5">
                                            <div className="bg-primary text-white inline-flex items-center px-3 py-1 rounded text-xs font-medium">
                                                <p>From</p>
                                            </div>
                                            <h2 className="text-xl font-medium mt-1">{v?.restaurantName || 'Vendor'}</h2>
                                            {packIds.map(pid => {
                                                const list = pid === '__all' ? vitems : vendorPackGroups[pid];
                                                const packName = pid === '__all' ? null : (packsByVendor[vid]?.[pid]?.name || pid);
                                                return (
                                                    <div key={pid} className="border rounded-lg p-3 space-y-3">
                                                        {packName && <h3 className="font-semibold text-sm uppercase tracking-wide text-primary">{packName}</h3>}
                                                        {list.map((ci, idx) => (
                                                            <div key={idx} className="p-2 rounded-xl flex items-center justify-between bg-gray-50">
                                                                <div className="flex gap-4">
                                                                    <div className="h-[64px] w-[64px] rounded-lg bg-gray-200 overflow-hidden">
                                                                        {ci.image && <img src={ci.image} alt={ci.name} className="w-full h-full object-cover" />}
                                                                    </div>
                                                                    <div className="flex flex-col justify-center">
                                                                        <p className="font-medium opacity-80">{ci.name}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-semibold text-lg text-right">₦ {Number(ci.price).toLocaleString()}</h3>
                                                                    <p className="text-right font-medium text-xs opacity-60">Qty: {ci.quantity}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })}
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
                                    const sel = deliverySelections[vid];
                                    const fee = sel ? Number(sel.price || 0) : 0;
                                    return (
                                        <div key={vid} className="space-y-2">
                                            <div className="flex justify-between items-center opacity-60">
                                                <p className="font-medium text-[1rem]">Delivery: {v?.restaurantName || 'Vendor'}</p>
                                                <p className="font-medium text-[1rem]">₦ {fee.toLocaleString()}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <select
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    value={sel?.location || ''}
                                                    onChange={(e) => {
                                                        const loc = e.target.value;
                                                        const found = (v?.deliveryLocations || []).find(dl => dl.location === loc);
                                                        setDeliverySelections(prev => ({ ...prev, [vid]: found ? { location: found.location, price: Number(found.price || 0) } : undefined }));
                                                    }}
                                                >
                                                    <option value="">Select delivery location</option>
                                                    {(v?.deliveryLocations || []).map((dl, i) => (
                                                        <option key={i} value={dl.location}>{dl.location} (₦ {Number(dl.price).toLocaleString()})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                                {deliveryOption === 'doorstep' && (
                                    <div className="mt-4 space-y-2">
                                        <label className="text-sm font-medium">Delivery Instructions (describe your place)</label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                                            placeholder="e.g., Black gate, third floor, ring the bell..."
                                            value={deliveryInstructions}
                                            onChange={(e) => setDeliveryInstructions(e.target.value)}
                                        />
                                    </div>
                                )}
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