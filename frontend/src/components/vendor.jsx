import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import Button from "./button";

export function ExploreCard({ vendorName }) {
    const [liked, setLiked] = useState(false);
    return (
        <>
            <Link to={`/vendor/${vendorName}`}>
                <div className="w-full rounded-lg overflow-clip bg-white ">
                    <div className="h-[200px] bg-gray-500 relative">
                        <div className="inline-flex items-center px-3 py-1.5 bg-primary rounded-full text-sm font-medium text-gray-700 absolute top-4 left-5">
                            <p className="text-xs text-white font-medium">Category Name</p>
                        </div>
                    </div>
                    <div className="px-5 pb-5 -mt-8 relative">
                        <div className="w-[60px] h-[60px] bg-primary rounded-full top-5 left-5 flex items-center justify-center" />
                        <div className="flex justify-between mt-2">
                            <div>
                                <h3 className="font-medium text-lg">Chillbay Lounge</h3>
                                <p className="text-sm opacity-60">Best Meals with drinks n wines</p>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="flex items-center justify-center size-8 transition-colors"
                                    aria-label={liked ? "Unlike" : "Like"}
                                    onClick={() => setLiked((v) => !v)}
                                >
                                    {liked ? (
                                        <Icon icon="solar:heart-bold" className="text-primary size-6" />
                                    ) : (
                                        <Icon icon="solar:heart-outline" className="text-primary size-6" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </>
    );
}


export function MenueCard({ itemName, price, quantity = 0, onQuantityChange }) {
    // Use internal state if no external control is provided
    const [internalQty, setInternalQty] = useState(0);
    const qty = onQuantityChange ? quantity : internalQty;
    const setQty = onQuantityChange ? onQuantityChange : setInternalQty;
    
    return (
        <div className="w-full rounded-lg overflow-clip bg-white ">
            <div className="h-[200px] bg-gray-500 relative">
                {/* <div className="inline-flex items-center px-3 py-1.5 bg-primary rounded-full text-sm font-medium text-gray-700 absolute top-4 left-5">
                    <p className="text-xs text-white font-medium">Category Name</p>
                </div> */}
            </div>
            <div className="px-5 pb-5 relative w-full">
                <div className="mt-4 w-full">
                    <div className="flex justify-between">
                        <h3 className="font-medium text-lg">{itemName}</h3>
                        <h3 className="font-medium text-lg">{price}</h3>
                    </div>
                    <div className="mt-3">
                        {qty === 0 ? (
                            <Button icon="solar:cart-outline" className="w-full px-6 py-3" onClick={() => setQty(1)}>
                                Add to Cart
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    icon="fluent:subtract-12-filled"
                                    className="py-3"
                                    onClick={() => setQty(qty > 1 ? qty - 1 : 0)}
                                    aria-label="Decrease quantity"
                                />
                                <p className="w-full text-center font-medium text-lg opacity-60">{qty}</p>
                                <Button
                                    icon="ic:round-plus"
                                    className="py-3"
                                    onClick={() => setQty(qty + 1)}
                                    aria-label="Increase quantity"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}