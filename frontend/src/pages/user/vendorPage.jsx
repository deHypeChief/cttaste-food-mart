import { useEffect, useState } from "react";
import Button from "../../components/button";
import { H1 } from "../../components/typography";
import { MenueCard } from "../../components/vendor";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../../components/dialog";
import { useParams, useSearchParams } from "react-router-dom";
import { vendorService } from "../../api/vendor";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";

export default function VendorInfo() {
    const { vendorName } = useParams();
    const [vendor, setVendor] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();
    const { addItem, updateQty, items: cartItems, clear: clearCartDb } = useCart();
    // Track quantities for each menu item by index
    const [quantities, setQuantities] = useState({});

    // State for new review form
    const [newReview, setNewReview] = useState({
        name: '',
        rating: 5,
        comment: ''
    });
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // Comments from API
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState("");
    const { isAuthenticated } = useAuth();

    const updateQuantity = (itemIndex, newQty) => {
        setQuantities(prev => ({
            ...prev,
            [itemIndex]: newQty
        }));
    };

    const clearCart = () => {
        setQuantities({});
        // Also clear persisted cart so UI stays in sync after refresh
        clearCartDb?.();
    };

    const handleReviewSubmit = async () => {
        if (!vendor?._id) return;
        if (newReview.name.trim() && newReview.comment.trim()) {
            try {
                // optimistic update
                const optimistic = {
                    userName: newReview.name,
                    rating: newReview.rating,
                    comment: newReview.comment,
                    createdAt: new Date().toISOString(),
                };
                setComments(prev => [optimistic, ...prev]);
                setNewReview({ name: '', rating: 5, comment: '' });
                // close the dialog after submit
                setIsReviewOpen(false);
                await vendorService.addComment(vendor._id, {
                    userName: optimistic.userName,
                    rating: optimistic.rating,
                    comment: optimistic.comment,
                });
                // refresh from server to ensure consistency
                await fetchComments(vendor._id);
            } catch (e) {
                setCommentsError(e.message || 'Failed to add comment');
            }
        }
    };

    // Derive a safe title and slug-to-id workaround if backend adds slug-based lookup later
    const title = vendor?.restaurantName || 'Vendor';
    const averageRating = comments.length
        ? Math.round((comments.reduce((s, c) => s + (c.rating || 0), 0) / comments.length) * 10) / 10
        : null;

    useEffect(() => {
        // Prefer fetching by explicit id if provided in query (?vid=...)
        (async () => {
            try {
                setLoading(true); setError("");
                const id = searchParams.get('id') || searchParams.get('vid');
                if (id) {
                    const res = await vendorService.getPublic(id);
                    const v = res?.data?.vendor;
                    if (!v?._id) throw new Error('Vendor not found');
                    setVendor(v);
                    const menuRes = await vendorService.getPublicMenu(v._id);
                    setMenu(menuRes?.data?.items || []);
                    fetchComments(v._id);
                    return;
                }
                // Fallback: find the vendor by name via list API (search)
                const res = await vendorService.list({ search: vendorName, limit: 1 });
                const found = res?.data?.items?.[0];
                if (!found) { setError('Vendor not found'); return; }
                setVendor(found);
                const menuRes = await vendorService.getPublicMenu(found._id);
                setMenu(menuRes?.data?.items || []);
                fetchComments(found._id);
            } catch (e) {
                setError(e.message || 'Failed to load vendor');
            } finally { setLoading(false); }
        })();
    }, [vendorName, searchParams]);

    const fetchComments = async (id) => {
        try {
            setCommentsLoading(true); setCommentsError("");
            const res = await vendorService.getComments(id);
            const items = res?.data?.items || [];
            setComments(items);
        } catch (e) {
            setCommentsError(e.message || 'Failed to load comments');
        } finally { setCommentsLoading(false); }
    };

    // Keep menu quantities in sync with persisted cart on load/refresh
    useEffect(() => {
        if (!menu?.length) {
            setQuantities({});
            return;
        }
        const map = {};
        menu.forEach((m, idx) => {
            const found = cartItems?.find(ci => ci.menuItemId === m._id);
            if (found) map[idx] = found.quantity || 0;
        });
        setQuantities(map);
    }, [menu, cartItems]);

    return (
        <div className="mx-5 md:mx-20 md:ml-24">
            <div className=" h-[55vh] bg-gray-200 mt-10 rounded-lg relative" style={vendor?.banner ? { backgroundImage: `url(${vendor.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                <div className="absolute inset-0 bg-black/40" />


                <div className="p-5 md:p-10 flex h-full flex-col justify-end relative">
                    <div className="space-y-5 md:space-y-0 md:flex justify-between items-end">
                        <div className="md:flex gap-5 items-center">
                            <div className="h-[60px] md:h-[100px] w-[60px] md:w-[100px] bg-pink-600 rounded-full overflow-hidden">
                                {vendor?.avatar && <img src={vendor.avatar} alt={title} className="w-full h-full object-cover" />}
                            </div>

                            <div>
                                <div className="flex gap-2 items-center">
                                    <H1 className={"text-white"}>
                                        {title}
                                    </H1>
                                    <div className="bg-primary flex items-center justify-center text-center text-white h-[30px] w-[30px] rounded-full text-sm font-medium">
                                        <p className="">{averageRating ?? '—'}</p>
                                    </div>
                                </div>
                                <p className="text-white">{vendor?.description || [vendor?.location, vendor?.vendorType].filter(Boolean).join(' • ')}</p>
                            </div>
                        </div>
                        <div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="primary" className="w-full px-6 py-3">
                                        View Comments
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh]">
                                    <DialogHeader>
                                        <DialogTitle>Comments for {String(title).toLowerCase()}</DialogTitle>
                                        <DialogDescription>
                                            See what customers are saying about {String(title).toLowerCase()}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="max-h-[60vh] overflow-y-auto space-y-4 mt-6 pr-2">
                                        {commentsError && <div className="text-red-600 text-sm">{commentsError}</div>}
                                        {commentsLoading && <div className="opacity-60 text-sm">Loading comments…</div>}
                                        {!commentsLoading && comments.length === 0 && <div className="opacity-60 text-sm">No comments yet</div>}
                                        {comments.map((comment, idx) => (
                                            <div key={idx} className="border-b pb-4 last:border-b-0">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0`}>
                                                        <span className="text-white text-sm font-medium">{(comment.userName || '').charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium text-sm">{comment.userName}</h4>
                                                            <div className="flex text-yellow-400">
                                                                {"★".repeat(comment.rating || 0)}{"☆".repeat(5 - (comment.rating || 0))}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {comment.comment}
                                                        </p>
                                                        <span className="text-xs text-gray-400">{new Date(comment.createdAt || Date.now()).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <div className="flex items-center justify-between w-full">
                    {/* <Button icon="mynaui:filter" variant="outlineFade" className="px-0 py-3">
                        Fillter
                    </Button> */}

                    <div className="flex items-center justify-between w-full  gap-5">
                        {isAuthenticated && (
                            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                                <DialogTrigger asChild>
                                    <Button icon="fluent:chat-16-regular" variant="outlineFade" className="px-0 py-3">
                                        Leave Comment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Leave a Review</DialogTitle>
                                        <DialogDescription>
                                            Share your experience with {title.toLowerCase()}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 mt-6">
                                        {/* Name Input */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Your Name</label>
                                            <input
                                                type="text"
                                                value={newReview.name}
                                                onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Enter your name"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        {/* Rating Input */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Rating</label>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                                        className={`text-2xl ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Comment Input */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Your Review</label>
                                            <textarea
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                                placeholder="Tell us about your experience..."
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                variant="primary"
                                                className="flex-1"
                                                onClick={handleReviewSubmit}
                                            >
                                                Submit Review
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Button icon="gg:trash" variant="outlineFade" className="px-0 py-3" onClick={clearCart}>
                            Clear Cart
                        </Button>
                    </div>
                </div>

                <div className="my-10 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5">
                    {loading && <div className="col-span-4 text-center opacity-60">Loading menu…</div>}
                    {error && <div className="col-span-4 text-center text-red-600">{error}</div>}
                    {!loading && !error && menu.length === 0 && (
                        <div className="col-span-4 text-center opacity-60">No menu items yet</div>
                    )}
                    {menu.map((m, idx) => (
                        <MenueCard
                            key={m._id}
                            itemName={m.name}
                            price={m.price}
                            image={m.image}
                            quantity={quantities[idx] || 0}
                            onQuantityChange={(newQty) => updateQuantity(idx, newQty)}
                            onAdd={() => addItem({ vendorId: vendor?._id, menuItemId: m._id, name: m.name, price: m.price, image: m.image, quantity: 1 })}
                            onUpdate={(newQty) => updateQty(m._id, newQty)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}