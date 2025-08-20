import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../../components/button";
import { H1 } from "../../components/typography";
import { ExploreCard } from "../../components/vendor";
import { useCart } from "../../hooks/useCart";
import { vendorService } from "../../api/vendor";

export default function Cart() {
    const { items, count, total, updateQty, clear } = useCart();
    const isEmpty = !items || items.length === 0;

    // Suggested vendors (max 8)
    const [vendors, setVendors] = useState([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [suggestError, setSuggestError] = useState("");

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
                        {items?.map((it) => (
                            <div key={it.menuItemId} className="bg-white p-7 rounded-xl flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                                <div className="flex gap-5 items-center">
                                    <div className="h-[80px] w-[80px] md:h-[100px] md:w-[100px] rounded-xl bg-gray-200 overflow-hidden">
                                        {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
                                    </div>

                                    <div className="flex flex-col justify-between py-2">
                                        <div>
                                            <div className="bg-primary text-white inline-flex items-center px-3 py-1 rounded text-xs font-medium top-4 left-5">
                                                <p>From</p>
                                            </div>
                                            <h2 className="text-xl font-medium mt-1">
                                                {/* Vendor name is not in snapshot; optional: fetch-by-vendor for labels later */}
                                                Vendor
                                            </h2>
                                        </div>

                                        <p className="font-medium opacity-60">{it.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <h3 className="font-semibold text-2xl md:text-right">N {Number(it.price).toLocaleString()}</h3>
                                        <div className="flex items-center gap-2 mt-3 justify-between ">
                                            <Button
                                                icon="fluent:subtract-12-filled"
                                                className="py-3"
                                                onClick={() => updateQty(it.menuItemId, Math.max(0, (it.quantity || 0) - 1))}
                                                aria-label="Decrease quantity"
                                            />
                                            <p className="w-10 text-center font-medium text-lg opacity-60">{it.quantity}</p>
                                            <Button
                                                icon="ic:round-plus"
                                                className="py-3 "
                                                onClick={() => updateQty(it.menuItemId, (it.quantity || 0) + 1)}
                                                aria-label="Increase quantity"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}