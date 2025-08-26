import { Icon } from "@iconify/react";
import Button from "../../components/button";
import { H1 } from "../../components/typography";
import { ExploreCard } from "../../components/vendor";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
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
                const search = searchParams.get('search');
                if (search) params.search = search;
                const res = await vendorService.list(params);
                setVendors(res?.data?.items || []);
            } catch (e) {
                setError(e.message || 'Failed to load vendors');
            } finally { setLoading(false); }
        })();
    }, [activeType, location, searchParams]);

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

    // Featured vendor carousel (max 4)
    const featured = useMemo(() => (vendors || []).slice(0, 4), [vendors]);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!featured.length) return;
        // keep index within range when vendors update
        setCurrent((c) => (c >= featured.length ? 0 : c));
    }, [featured.length]);

    useEffect(() => {
        if (!featured.length) return;
        const id = setInterval(() => {
            setCurrent((c) => (c + 1) % featured.length);
        }, 5000);
        return () => clearInterval(id);
    }, [featured.length]);

    const activeVendor = featured[current];
    const activeTitle = activeVendor?.restaurantName || "Discover great vendors near you";
    const defaultHeroImage = '/portrait-man-practicing-his-profession-celebrate-international-labour-day.jpg';
    // Use vendor banner when available, otherwise show the provided portrait image when there are no vendors
    const bg = activeVendor?.banner || ((vendors.length === 0 && !loading) ? defaultHeroImage : undefined);
    const heroBgStyle = bg
        ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    const goToVendor = (v) => {
        if (!v) return;
        const slug = String(v.restaurantName || 'vendor').toLowerCase().replace(/\s+/g, '');
        // Pass id for reliable lookup
        navigate(`/vendor/${slug}?id=${v._id}`);
    };

    return (
        <div className="mx-5 md:mx-20 md:ml-24">
            <div className=" h-[55vh] bg-gray-200 mt-10 rounded-lg relative overflow-hidden" style={heroBgStyle}>
                {/* uniform dark overlay for readability */}
                <div className="absolute inset-0 bg-black/40" />

                <div className="p-5 md:p-10 flex h-full flex-col justify-end relative z-[1]">
                    <div className="mb-5 flex gap-2">
                        {featured.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`h-[5px] w-12 rounded-full transition-colors ${idx === current ? 'bg-white' : 'bg-gray-400/80'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                        {!featured.length && (
                            <div className="h-[5px] w-12 bg-white rounded-full" />
                        )}
                    </div>

                    <div className="md:w-[500px] max-w-full space-y-6 sm:space-y-10">
                        <H1 className='text-white'>
                            {activeVendor ? `Get discounts when you buy from ${activeTitle}` : 'Find meals you love from top vendors'}
                        </H1>
                        <Button className="px-6 py-3" onClick={() => goToVendor(activeVendor)} disabled={!activeVendor}>
                            Explore Menu
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-center justify-between">
                    <div className="flex items-center gap-2 w-full md:w-fit">
                        <select
                            className="px-3 py-2 border rounded-lg bg-white w-full md:w-fit"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        >
                            {CAMPUSES.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:w-[70%] flex gap-2 overflow-x-scroll hide-scrollbar  w-full">
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
                    {/* <Button icon="mynaui:filter" variant="outlineFade" className="px-0 py-3">
                        Fillter
                    </Button> */}
                </div>

                <div className="my-10 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5">
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
                            isCurrentlyOpen={v.isCurrentlyOpen}
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