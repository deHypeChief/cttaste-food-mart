import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Button from "../../../components/button";
import { favoritesService } from "../../../api/favorites";
import { Link } from "react-router-dom";

export default function Favorite() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            setLoading(true); setError("");
            const res = await favoritesService.list();
            setItems(res?.data?.items || []);
        } catch (e) {
            setError(e.message || 'Failed to load favorites');
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const toggle = async (vendorId) => {
        try {
            await favoritesService.toggle(vendorId);
            setItems((prev) => prev.filter((it) => (it.vendorId?._id || it.vendorId) !== vendorId));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <div className="bg-white p-7 rounded-xl ">
                <div className="border-b border-border pb-3 flex justify-between items-center ">
                    <p className="font-semibold text-lg">My Favorite</p>
                </div>

                <div className="space-y-5 pt-5">
                    {loading && <div className="opacity-60">Loading…</div>}
                    {error && <div className="text-red-600">{error}</div>}
                    {!loading && !error && items.length === 0 && (
                        <div className="opacity-60">No favorites yet</div>
                    )}
                    {items.map((it) => {
                        const v = it.vendorId || {};
                        const id = v._id || it.vendorId;
                        return (
                            <div key={id} className="p-4 py-0 rounded-xl flex items-center justify-between">
                                <Link to={`/vendor/${(v.restaurantName||'').toLowerCase().replace(/\s+/g, '')}?id=${encodeURIComponent(id)}`} className="flex gap-5 items-center">
                                    <div className="h-[100px] w-[100px] rounded-xl bg-gray-200 overflow-hidden">
                                        {v.avatar && <img src={v.avatar} alt={v.restaurantName} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className=" py-2">
                                        <h2 className="text-xl font-medium mt-1">{v.restaurantName || 'Vendor'}</h2>
                                        <p className="font-medium opacity-60">{v.description || v.vendorType || ''}</p>
                                    </div>
                                </Link>
                                <div>
                                    <button type="button" className="flex items-center justify-center size-8 transition-colors" onClick={() => toggle(id)}>
                                        <Icon icon="solar:heart-bold" className="text-primary size-10" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}