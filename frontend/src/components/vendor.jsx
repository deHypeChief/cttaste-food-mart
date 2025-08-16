import { useMemo, useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useNavigate } from "react-router-dom";
import Button from "./button";
import { favoritesService } from "../api/favorites";
import { useAuth } from "../hooks/useAuth.js";

export function ExploreCard({ vendorName, name, vendorType, description, avatar, banner, location, id, initiallyLiked = false, onToggled }) {
    const [liked, setLiked] = useState(initiallyLiked);
    const { userType } = useAuth();
    const slug = useMemo(() => vendorName || (name ? name.toLowerCase().replace(/\s+/g, '') : 'unknown'), [vendorName, name]);
    useEffect(() => { setLiked(initiallyLiked); }, [initiallyLiked]);
    const navigate = useNavigate();

    const handleToggle = async (e) => {
        e.preventDefault(); // prevent navigation when clicking heart
    if (userType !== 'customer') { navigate('/auth/login?type=customer'); return; }
        try {
            setLiked((v) => !v);
            const res = await favoritesService.toggle(id);
            if (onToggled) onToggled(res?.data?.favorited === true);
        } catch (err) {
            setLiked((v) => !v); // revert on error
            console.error('Favorite toggle failed', err);
        }
    };
    return (
        <>
            <Link to={`/vendor/${slug}?id=${encodeURIComponent(id || '')}`}>
                <div className="w-full rounded-lg overflow-clip bg-white ">
                    <div className="h-[200px] bg-gray-200 relative" style={banner ? { backgroundImage: `url(${banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                        <div className="inline-flex items-center px-3 py-1.5 bg-primary rounded-full text-sm font-medium text-gray-700 absolute top-4 left-5">
                            <p className="text-xs text-white font-medium">{vendorType || 'Category'}</p>
                        </div>
                    </div>
                    <div className="px-5 pb-5 -mt-8 relative">
                        <div className="w-[60px] h-[60px] bg-primary rounded-full top-5 left-5 flex items-center justify-center overflow-hidden">
                            {avatar ? (
                                <img src={avatar} alt={`${name || 'Vendor'} logo`} className="w-full h-full object-cover" />
                            ) : (
                                <Icon icon="mdi:store" className="text-white size-6" />
                            )}
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="min-w-0">
                                <h3 className="font-medium text-lg truncate">{name || 'Vendor'}</h3>
                                <p className="text-sm opacity-60 truncate">{description || [location, vendorType].filter(Boolean).join(' • ') || 'Best Meals with drinks n wines'}</p>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="flex items-center justify-center size-8 transition-colors"
                                    aria-label={liked ? "Unlike" : "Like"}
                                    onClick={handleToggle}
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


export function MenueCard({ itemName, price, image, quantity = 0, onQuantityChange, onAdd, onUpdate }) {
    // Use internal state if no external control is provided
    const [internalQty, setInternalQty] = useState(0);
    const qty = onQuantityChange ? quantity : internalQty;
    const setQty = onQuantityChange ? onQuantityChange : setInternalQty;
    
    return (
        <div className="w-full rounded-lg overflow-clip bg-white ">
            <div className="h-[200px] bg-gray-200 relative">
                {image ? (
                    <img src={image} alt={itemName || 'Menu item'} className="w-full h-full object-cover" />
                ) : null}
            </div>
            <div className="px-5 pb-5 relative w-full">
                <div className="mt-4 w-full">
                    <div className="flex justify-between">
                        <h3 className="font-medium text-lg">{itemName}</h3>
                        <h3 className="font-medium text-lg">{price}</h3>
                    </div>
                    <div className="mt-3">
                        {qty === 0 ? (
                            <Button icon="solar:cart-outline" className="w-full px-6 py-3" onClick={() => { setQty(1); onAdd && onAdd(); }}>
                                Add to Cart
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    icon="fluent:subtract-12-filled"
                                    className="py-3"
                                    onClick={() => { const next = qty > 1 ? qty - 1 : 0; setQty(next); onUpdate && onUpdate(next); }}
                                    aria-label="Decrease quantity"
                                />
                                <p className="w-full text-center font-medium text-lg opacity-60">{qty}</p>
                                <Button
                                    icon="ic:round-plus"
                                    className="py-3"
                                    onClick={() => { const next = qty + 1; setQty(next); onUpdate && onUpdate(next); }}
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