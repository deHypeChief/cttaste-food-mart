import { Link } from "react-router-dom";
import Button from "../../components/button";

export default function Checkout() {
    return (
        <>
            <div className="mx-20 ml-24">
                <div className="mt-10">
                    <h1 className="text-3xl font-semibold">My Order</h1>
                </div>

                <div className="mt-10 grid grid-cols-[1fr_0.5fr] gap-10">
                    <div className="space-y-5">
                        <div className="bg-white p-7 rounded-xl ">
                            <div className="border-b border-border pb-3 flex justify-between items-center ">
                                <p className="font-semibold text-lg">Customer Info</p>
                                <p className="font-medium text-sm text-primary">Edit Customer Info</p>
                            </div>

                            <div className="space-y-3 pt-5">
                                <h1 className="text-xl font-medium">User Name</h1>
                                <div>
                                    <p className="text-[1rem] font-medium opacity-60">080 345 789 </p>
                                    <p className="text-[1rem] font-medium opacity-60">james@mail.com </p>
                                    <p className="text-[1rem] font-medium opacity-60">50 joint avenue gorgers Hostel</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-7 rounded-xl ">
                            <div className="border-b border-border pb-3 flex justify-between items-center ">
                                <p className="font-semibold text-lg">Pick Up Location</p>
                                {/* <p className="font-medium text-sm text-primary">Edit Customer Info</p> */}
                            </div>

                            <div className="space-y-3 pt-5">
                                <h1 className="text-xl font-medium">Chillbay Lounge</h1>
                                <div>
                                    <p className="text-[1rem] font-medium opacity-60">080 345 789 </p>
                                    <p className="text-[1rem] font-medium opacity-60">james@mail.com </p>
                                    <p className="text-[1rem] font-medium opacity-60">100 joint ave Hostel</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-7 rounded-xl ">
                            <div className="border-b border-border pb-3 flex justify-between items-center ">
                                <p className="font-semibold text-lg">Delivery Summary</p>
                                <p className="font-medium text-sm text-primary">Edit Order</p>
                            </div>

                            <div className="space-y-8 pt-10">
                                <div className="p-4 py-0 rounded-xl flex items-center justify-between">
                                    <div className="flex gap-5">
                                        <div className="h-[100px] w-[100px] rounded-xl bg-gray-400" />

                                        <div className="flex flex-col justify-between py-2">
                                            <div>
                                                <div className="bg-primary text-white inline-flex items-center px-3 py-1 rounded text-xs font-medium top-4 left-5">
                                                    <p>From</p>
                                                </div>
                                                <h2 className="text-xl font-medium mt-1">
                                                    De Hype Kitchen
                                                </h2>
                                            </div>

                                            <p className="font-medium opacity-60">Fried Rice</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <h3 className="font-semibold text-2xl text-right">N 3000</h3>
                                            <p className="text-right font-medium text-lg opacity-60">Qty: 1</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 py-0 rounded-xl flex items-center justify-between">
                                    <div className="flex gap-5">
                                        <div className="h-[100px] w-[100px] rounded-xl bg-gray-400" />

                                        <div className="flex flex-col justify-between py-2">
                                            <div>
                                                <div className="bg-primary text-white inline-flex items-center px-3 py-1 rounded text-xs font-medium top-4 left-5">
                                                    <p>From</p>
                                                </div>
                                                <h2 className="text-xl font-medium mt-1">
                                                    De Hype Kitchen
                                                </h2>
                                            </div>

                                            <p className="font-medium opacity-60">Fried Rice</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <h3 className="font-semibold text-2xl text-right">N 3000</h3>
                                            <p className="text-right font-medium text-lg opacity-60">Qty: 1</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="w-full bg-white rounded-lg p-5 space-y-5 h-fit sticky top-24">
                            <div className="border-b border-border pb-3">
                                <p className="font-semibold text-lg">Cart Summary</p>
                            </div>
                            <div className="border-b border-border space-y-3 pb-5">
                                <div className="flex justify-between items-center opacity-60 ">
                                    <p className="font-medium text-[1rem]">Items(6)</p>
                                    <p className="font-medium text-[1rem]">₦ 17,630</p>
                                </div>
                                <div className="flex justify-between items-center opacity-60">
                                    <p className="font-medium text-[1rem]">Delivery Fee : Chillbay Lounge </p>
                                    <p className="font-medium text-[1rem]">₦ 1,630</p>
                                </div>
                                <div className="flex justify-between items-center opacity-60">
                                    <p className="font-medium text-[1rem]">Delivery Fee : Chillbay Lounge </p>
                                    <p className="font-medium text-[1rem]">₦ 1,630</p>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <h3 className="font-semibold text-2xl">Total</h3>
                                <h3 className="font-semibold text-2xl">N 3000</h3>
                            </div>
                            <Link to="/checkout" className="w-full">
                                <Button className="w-full px-6 py-3">
                                    Make Order
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}