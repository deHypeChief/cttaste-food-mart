import { Icon } from "@iconify/react";
import Button from "../../components/button";
import { H1 } from "../../components/typography";
import { ExploreCard } from "../../components/vendor";
import { useEffect, useState } from "react";
import { vendorService } from "../../api/vendor";
import { favoritesService } from "../../api/favorites";
import { useAuth } from "../../hooks/useAuth.js";

const exploreData = {
    catList: [
        {
            name: "All"
        },
        {
            name: "Supermarket",
            icon: "mage:shop"
        },
        {
            name: "Food",
            icon: "tdesign:chicken"
        },
        { name: "Restaurant", icon: "mdi:food" },
        { name: "Cafe", icon: "mdi:coffee" },
        { name: "Lounge", icon: "mdi:sofa" },
        { name: "Fast Food", icon: "mdi:food-takeout-box" },
        { name: "Bar", icon: "mdi:glass-cocktail" },
        { name: "Other", icon: "mdi:dots-horizontal" },
    ]
}

export default function Explore() {
    const { userType } = useAuth();
    const CAMPUSES = [
        { value: "All", label: "All" },
        { value: "UNIABU", label: "UNIABU" },
        { value: "UNILAG", label: "UNILAG" },
        { value: "UI", label: "UI" },
        { value: "OAU", label: "OAU" },
        { value: "ABU", label: "ABU" },
        { value: "UNN", label: "UNN" },
        { value: "UNIBEN", label: "UNIBEN" },
        { value: "UNIPORT", label: "UNIPORT" },
        { value: "UNILORIN", label: "UNILORIN" },
        { value: "LASU", label: "LASU" },
        { value: "CU", label: "CU" },
        { value: "FUTA", label: "FUTA" },
        { value: "FUTMINNA", label: "FUTMINNA" },
        { value: "BUK", label: "BUK" },
        { value: "UNICAL", label: "UNICAL" },
        { value: "UNIUYO", label: "UNIUYO" },
        { value: "UNIZIK", label: "UNIZIK" },
        { value: "RSU", label: "RSU" },
        { value: "UNIJOS", label: "UNIJOS" },
    ];
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeType, setActiveType] = useState("All");
    const [location, setLocation] = useState("All");
    const [favIds, setFavIds] = useState(() => new Set());

    useEffect(() => {
        (async () => {
            try {
                setLoading(true); setError("");
                const params = { limit: 24 };
                if (activeType !== 'All') params.vendorType = activeType;
                if (location !== 'All') params.location = location;
                const res = await vendorService.list(params);
                setVendors(res?.data?.items || []);
            } catch (e) {
                setError(e.message || 'Failed to load vendors');
            } finally { setLoading(false); }
        })();
    }, [activeType, location]);

    // Load favorites for signed-in customers so hearts are persistent
    useEffect(() => {
        (async () => {
            if (userType !== 'customer') { setFavIds(new Set()); return; }
            try {
                const res = await favoritesService.list();
                const ids = new Set((res?.data?.items || []).map((it) => (it.vendorId?._id || it.vendorId)).filter(Boolean));
                setFavIds(ids);
            } catch (e) {
                console.warn('Failed to load favorites', e);
            }
        })();
    }, [userType]);

    return (
        <div className="mx-20 ml-24">
            <div className=" h-[55vh] bg-gray-200 mt-10 rounded-lg">
                <div className="" />

                <div className="p-10 flex h-full flex-col justify-end">
                    <div className="mb-5 flex gap-2">
                        <div className="h-[5px] w-12 bg-white rounded-full" />
                        <div className="h-[5px] w-12 bg-gray-400 rounded-full" />
                        <div className="h-[5px] w-12 bg-gray-400 rounded-full" />
                        <div className="h-[5px] w-12 bg-gray-400 rounded-full" />
                    </div>

                    <div className="w-[500px] space-y-10">
                        <H1 className=''>
                            Get Discounts When you buy from Chilly Bothey
                        </H1>
                        <Button className="px-6 py-3">Explore Menu</Button>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <select
                            className="px-3 py-2 border rounded-lg bg-white"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        >
                            {CAMPUSES.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-[70%] flex gap-2 overflow-x-scroll hide-scrollbar">
                        {exploreData.catList.map((cat) => (
                            <Button
                                key={cat.name}
                                icon={cat.icon || ""}
                                variant={activeType === cat.name ? "primary" : "outlineFade"}
                                className="px-4 py-2 rounded-full whitespace-nowrap"
                                onClick={() => setActiveType(cat.name)}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                    <Button icon="mynaui:filter" variant="outlineFade" className="px-0 py-3">
                        Fillter
                    </Button>
                </div>

                <div className="my-10 grid grid-cols-4 gap-5">
                    {loading && <div className="col-span-4 text-center opacity-60">Loading vendors…</div>}
                    {error && <div className="col-span-4 text-center text-red-600">{error}</div>}
                    {!loading && !error && vendors.length === 0 && (
                        <div className="col-span-4 text-center opacity-60">No vendors available</div>
                    )}
            {vendors.map((v) => (
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
                initiallyLiked={favIds.has(v._id)}
                onToggled={(favorited) => {
                    setFavIds((prev) => {
                        const next = new Set(prev);
                        if (favorited) next.add(v._id); else next.delete(v._id);
                        return next;
                    });
                }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}