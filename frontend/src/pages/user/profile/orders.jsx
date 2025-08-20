import { Icon } from "@iconify/react";
import Button from "../../../components/button";

export default function Orders() {
    return (
        <>
            <div className="bg-white p-7 rounded-xl ">
                <div className="border-b border-border pb-3 flex justify-between items-center ">
                    <p className="font-semibold text-lg">My Orders</p>
                </div>

                <div className="space-y-5 pt-5">
                    <div className="p-4 py-0 rounded-xl md:flex items-center justify-between space-y-5 md:space-y-0 bg-gray-50">
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
                            <div className="flex md:block justify-between items-center gap-2">
                                <h3 className="font-semibold text-2xl text-right">N 3000</h3>
                                <p className="text-right font-medium text-lg opacity-60">Qty: 1</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}