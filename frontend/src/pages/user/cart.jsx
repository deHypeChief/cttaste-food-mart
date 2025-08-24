import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/button";
import { H1 } from "../../components/typography";
import { ExploreCard } from "../../components/vendor";
import { useCart } from "../../hooks/useCart";
import { vendorService } from "../../api/vendor";

export default function Cart() {
    const { items, count, total, clear, packsByVendor, packItemQuantities, adjustPackItem } = useCart();
    const isEmpty = !items || items.length === 0;

    // Suggested vendors (max 8)
    const [vendors, setVendors] = useState([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [suggestError, setSuggestError] = useState("");

    // Vendor names for items in cart (map vendorId -> restaurantName)
    const [vendorNames, setVendorNames] = useState({});
    const [vendorNamesLoading, setVendorNamesLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setSuggestLoading(true); setSuggestError("");
                const res = await vendorService.list({ limit: 8 });
                setVendors(res?.data?.items || []);
            } catch (e) {
                setSuggestError(e.message || 'Failed to load vendors');
            } finally {
                setSuggestLoading(false);
            }
        })();
    }, []);

    // Fetch vendor names for cart items (only for vendorIds not already cached)
    useEffect(() => {
        // Only refetch on items/isEmpty changes to avoid update loop. We intentionally
        // exclude vendorNames from deps; new vendors trigger via items change.
        const fetchNames = async () => {
            const ids = Array.from(new Set((items || []).map(it => it.vendorId).filter(Boolean)));
            const missing = ids.filter(id => !vendorNames[id]);
            if (missing.length === 0) return; // nothing new
            setVendorNamesLoading(true);
            try {
                const entries = await Promise.all(missing.map(async id => {
                    try {
                        const res = await vendorService.getPublic(id);
                        const name = res?.data?.vendor?.restaurantName || 'Vendor';
                        return [id, name];
                    } catch {
                        return [id, 'Vendor'];
                    }
                }));
                setVendorNames(prev => ({ ...prev, ...Object.fromEntries(entries) }));
            } finally {
                setVendorNamesLoading(false);
            }
        };
        if (!isEmpty) fetchNames();
        else if (Object.keys(vendorNames).length) setVendorNames({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, isEmpty]);
    // Build vendor -> pack -> items structure
    const vendorPackStructure = useMemo(() => {
        const struct = {}; // { vendorId: { packs: { packId: [ { item, quantity } ] }, order: [packIds] } }
        const itemsById = Object.fromEntries((items || []).map(i => [i.menuItemId, i]));
        const vendorIds = Array.from(new Set((items || []).map(i => i.vendorId).filter(Boolean)));
        vendorIds.forEach(vid => {
            const packs = {};
            const packQty = packItemQuantities?.[vid] || {};
            const hasPackData = Object.keys(packQty).length > 0;
            if (hasPackData) {
                // Use explicit per-pack quantities only
                Object.entries(packQty).forEach(([pid, obj]) => {
                    Object.entries(obj).forEach(([mid, qty]) => {
                        if (!qty) return; // skip zero
                        const base = itemsById[mid];
                        if (!base) return;
                        if (!packs[pid]) packs[pid] = [];
                        packs[pid].push({ ...base, quantity: qty });
                    });
                });
            } else {
                // No pack data yet for this vendor: show a single default pack with server aggregate quantities
                const pid = 'pack-1';
                packs[pid] = (items || []).filter(it => it.vendorId === vid && Number(it.quantity) > 0).map(it => ({ ...it }));
            }
            // Order packs numerically
            const orderedPackIds = Object.keys(packs).sort((a, b) => {
                const na = Number((a.match(/pack-(\d+)/) || [])[1] || 9999);
                const nb = Number((b.match(/pack-(\d+)/) || [])[1] || 9999);
                return na - nb || a.localeCompare(b);
            });
            struct[vid] = { packs, order: orderedPackIds };
        });
        return struct;
    }, [items, packItemQuantities]);

    return (
        <div className="mx-5 md:mx-20 md:*:ml-24 ">
            <div className="mt-10 flex justify-between">
                <H1>My Cart - {count || 0}</H1>
                <Button icon="gg:trash" className="px-6 py-3" onClick={clear}>
                    Clear Cart
                </Button>
            </div>

            <div className="mt-10 grid md:grid-cols-[1fr_0.5fr] gap-10">
                <div>
                    <div className="space-y-5">
                        {isEmpty && (
                            <div className="text-center opacity-60">Your cart is empty</div>
                        )}
                        {!isEmpty && Object.entries(vendorPackStructure).map(([vid, info]) => {
                            const vendorLabel = vendorNames[vid] || (vendorNamesLoading ? 'Loading…' : 'Vendor');
                            return (
                                <div key={vid} className="bg-white p-7 rounded-xl space-y-6">
                                    <div>
                                        <div className="bg-primary text-white inline-flex items-center px-3 py-1 rounded text-xs font-medium">
                                            <p>From</p>
                                        </div>
                                        <h2 className="text-xl font-medium mt-2">{vendorLabel}</h2>
                                    </div>
                                    {/* Packs */}
                                    {info.order.map(pid => {
                                        const packItems = info.packs[pid] || [];
                                        if (!packItems.length) return null;
                                        const packName = packsByVendor[vid]?.[pid]?.name || pid;
                                        return (
                                            <div key={pid} className="border rounded-lg p-4 space-y-4">
                                                <h3 className="font-semibold text-sm uppercase tracking-wide text-primary">{packName}</h3>
                                                {packItems.map(ci => (
                                                    <div key={ci.menuItemId} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex gap-4 items-center">
                                                            <div className="h-[70px] w-[70px] rounded-lg bg-gray-200 overflow-hidden">
                                                                {ci.image && <img src={ci.image} alt={ci.name} className="w-full h-full object-cover" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium opacity-80">{ci.name}</p>
                                                                <p className="font-semibold text-lg mt-1">N {Number(ci.price).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 self-start md:self-auto">
                                                            {/* Quantity here reflects per-pack quantity (not global aggregated). adjustPackItem syncs server cart */}
                                                            <Button
                                                                icon="fluent:subtract-12-filled"
                                                                className="py-3"
                                                                onClick={() => adjustPackItem({ vendorId: vid, packId: pid, menuItemId: ci.menuItemId, name: ci.name, price: ci.price, image: ci.image }, -1)}
                                                                aria-label="Decrease quantity"
                                                            />
                                                            <p className="w-10 text-center font-medium text-lg opacity-60">{ci.quantity}</p>
                                                            <Button
                                                                icon="ic:round-plus"
                                                                className="py-3"
                                                                onClick={() => adjustPackItem({ vendorId: vid, packId: pid, menuItemId: ci.menuItemId, name: ci.name, price: ci.price, image: ci.image }, +1)}
                                                                aria-label="Increase quantity"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <div className="w-full h-fit bg-white rounded-lg p-5 space-y-5 sticky top-24">
                        <div className="border-b border-border pb-3">
                            <p className="font-semibold text-lg">Cart Summary</p>
                        </div>
                        <div className="flex justify-between">
                            <h3 className="font-semibold text-2xl">Total</h3>
                            <h3 className="font-semibold text-2xl">N {Number(total || 0).toLocaleString()}</h3>
                        </div>
                        {isEmpty ? (
                            <Button className="w-full px-6 py-3 opacity-50 cursor-not-allowed" disabled aria-disabled>
                                Proceed to Checkout
                            </Button>
                        ) : (
                            <Link to="/checkout" className="w-full">
                                <Button className="w-full px-6 py-3">
                                    Proceed to Checkout
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-30">
                <div>
                    <p className="font-medium text-2xl">More Vendors</p>
                </div>
                <div className="my-10 grid grid-cols-2 md:grid-cols-4 gap-5">
                    {suggestLoading && (
                        <div className="col-span-4 text-center opacity-60">Loading vendors…</div>
                    )}
                    {suggestError && (
                        <div className="col-span-4 text-center text-red-600">{suggestError}</div>
                    )}
                    {!suggestLoading && !suggestError && vendors.length === 0 && (
                        <div className="col-span-4 text-center opacity-60">No vendors available</div>
                    )}
                    {vendors.slice(0, 8).map((v) => (
                        <ExploreCard
                            key={v._id}
                            vendorName={v.restaurantName?.toLowerCase().replace(/\s+/g, '')}
                            name={v.restaurantName}
                            vendorType={v.vendorType}
                            description={v.description}
                            avatar={v.avatar}
                            banner={v.banner}
                            location={v.location}
                            id={v._id}
                            isCurrentlyOpen={v.isCurrentlyOpen}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}