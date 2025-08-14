import { useState } from "react";
import Button from "../../components/button";
import { H1 } from "../../components/typography";
import { MenueCard } from "../../components/vendor";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/dialog";

export default function VendorInfo() {
    // Track quantities for each menu item by index
    const [quantities, setQuantities] = useState({
        0: 0, // Fried Rice 1
        1: 0, // Fried Rice 2
        2: 0, // Fried Rice 3
    });

    // State for new review form
    const [newReview, setNewReview] = useState({
        name: '',
        rating: 5,
        comment: ''
    });

    // Sample comments data
    const [comments, setComments] = useState([
        {
            id: 1,
            name: "John Doe",
            rating: 5,
            comment: "Amazing food quality! The fried rice was perfectly seasoned and the service was excellent.",
            timeAgo: "2 days ago",
            avatar: "J",
            bgColor: "bg-primary"
        },
        {
            id: 2,
            name: "Mary Johnson",
            rating: 4,
            comment: "Great atmosphere and delicious meals. Will definitely come back!",
            timeAgo: "1 week ago",
            avatar: "M",
            bgColor: "bg-green-500"
        },
        {
            id: 3,
            name: "Alex Smith",
            rating: 5,
            comment: "Outstanding service and food quality. The best restaurant in the area!",
            timeAgo: "1 week ago",
            avatar: "A",
            bgColor: "bg-blue-500"
        },
        {
            id: 4,
            name: "Sarah Wilson",
            rating: 5,
            comment: "Incredible experience! The staff was friendly and the food was absolutely delicious. Highly recommend the special menu.",
            timeAgo: "2 weeks ago",
            avatar: "S",
            bgColor: "bg-purple-500"
        },
        {
            id: 5,
            name: "David Brown",
            rating: 4,
            comment: "Good food and reasonable prices. The ambiance is perfect for family dining.",
            timeAgo: "3 weeks ago",
            avatar: "D",
            bgColor: "bg-orange-500"
        },
        {
            id: 6,
            name: "Lisa Chen",
            rating: 5,
            comment: "Best restaurant in town! Everything from appetizers to desserts was perfect. Will be coming back soon.",
            timeAgo: "1 month ago",
            avatar: "L",
            bgColor: "bg-pink-500"
        },
        {
            id: 7,
            name: "Mike Rodriguez",
            rating: 4,
            comment: "Great service and fresh ingredients. The presentation was beautiful and taste was amazing.",
            timeAgo: "1 month ago",
            avatar: "M",
            bgColor: "bg-indigo-500"
        },
        {
            id: 8,
            name: "Emma Thompson",
            rating: 5,
            comment: "Exceptional dining experience! The chef really knows how to bring out the best flavors.",
            timeAgo: "2 months ago",
            avatar: "E",
            bgColor: "bg-red-500"
        }
    ]);

    const updateQuantity = (itemIndex, newQty) => {
        setQuantities(prev => ({
            ...prev,
            [itemIndex]: newQty
        }));
    };

    const clearCart = () => {
        setQuantities({
            0: 0,
            1: 0,
            2: 0,
        });
    };

    const handleReviewSubmit = () => {
        if (newReview.name.trim() && newReview.comment.trim()) {
            const review = {
                id: comments.length + 1,
                name: newReview.name,
                rating: newReview.rating,
                comment: newReview.comment,
                timeAgo: "Just now",
                avatar: newReview.name.charAt(0).toUpperCase(),
                bgColor: "bg-gray-500"
            };
            
            setComments([review, ...comments]);
            setNewReview({ name: '', rating: 5, comment: '' });
        }
    };

    return (
        <div className="mx-20 ml-24">
            <div className=" h-[55vh] bg-gray-200 mt-10 rounded-lg relative">
                <div className="absolute" />

                <div className="p-10 flex h-full flex-col justify-end">
                    <div className="flex justify-between items-end">
                        <div className="flex gap-5 items-center">
                            <div className="h-[100px] w-[100px] bg-pink-600 rounded-full" />

                            <div>
                                <div className="flex gap-2 items-center">
                                    <H1>
                                        DALISH Restaurant
                                    </H1>
                                    <div className="bg-primary flex items-center justify-center text-center text-white h-[30px] w-[30px] rounded-full text-sm font-medium">
                                        <p>5</p>
                                    </div>
                                </div>
                                <p>Best Meals with drinks n wines</p>
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
                                        <DialogTitle>Customer Comments</DialogTitle>
                                        <DialogDescription>
                                            See what customers are saying about DALISH Restaurant
                                        </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="max-h-[60vh] overflow-y-auto space-y-4 mt-6 pr-2">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="border-b pb-4 last:border-b-0">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-8 h-8 ${comment.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                                                        <span className="text-white text-sm font-medium">{comment.avatar}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium text-sm">{comment.name}</h4>
                                                            <div className="flex text-yellow-400">
                                                                {"★".repeat(comment.rating)}{"☆".repeat(5 - comment.rating)}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {comment.comment}
                                                        </p>
                                                        <span className="text-xs text-gray-400">{comment.timeAgo}</span>
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
                <div className="flex items-center justify-between">
                    <Button icon="mynaui:filter" variant="outlineFade" className="px-0 py-3">
                        Fillter
                    </Button>

                    <div className="flex items-center gap-5">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button icon="fluent:chat-16-regular" variant="outlineFade" className="px-0 py-3">
                                    Leave Comment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Leave a Review</DialogTitle>
                                    <DialogDescription>
                                        Share your experience with DALISH Restaurant
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
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="flex-1">
                                                Cancel
                                            </Button>
                                        </DialogTrigger>
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
                        <Button icon="gg:trash" variant="outlineFade" className="px-0 py-3" onClick={clearCart}>
                            Clear Cart
                        </Button>
                    </div>
                </div>

                <div className="my-10 grid grid-cols-4 gap-5">
                    <MenueCard
                        itemName="Fried Rice"
                        price={3000}
                        quantity={quantities[0]}
                        onQuantityChange={(newQty) => updateQuantity(0, newQty)}
                    />
                    <MenueCard
                        itemName="Fried Rice"
                        price={3000}
                        quantity={quantities[1]}
                        onQuantityChange={(newQty) => updateQuantity(1, newQty)}
                    />
                    <MenueCard
                        itemName="Fried Rice"
                        price={3000}
                        quantity={quantities[2]}
                        onQuantityChange={(newQty) => updateQuantity(2, newQty)}
                    />
                </div>
            </div>
        </div>
    )
}