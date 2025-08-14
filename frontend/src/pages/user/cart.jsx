import { Link } from "react-router-dom";
import Button from "../../components/button";
import { H1 } from "../../components/typography";
import { ExploreCard } from "../../components/vendor";

export default function Cart() {
    return (
        <div className="mx-20 ml-24 ">
            <div className="mt-10 flex justify-between">
                <H1>My Cart - 3</H1>
                <Button icon="gg:trash" className="px-6 py-3">
                    Clear Cart
                </Button>
            </div>

            <div className="mt-10 grid grid-cols-[1fr_0.5fr] gap-10">
                <div>
                    <div className="space-y-5">
                        <div className="bg-white p-7 rounded-xl flex items-center justify-between">
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
                                    <div className="flex items-center gap-2 mt-3">
                                        <Button
                                            icon="fluent:subtract-12-filled"
                                            className="py-3"
                                            onClick={() => { }}
                                            aria-label="Decrease quantity"
                                        />
                                        <p className="w-10 text-center font-medium text-lg opacity-60">1</p>
                                        <Button
                                            icon="ic:round-plus"
                                            className="py-3 "
                                            onClick={() => { }}
                                            aria-label="Increase quantity"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-7 rounded-xl flex items-center justify-between">
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
                                    <div className="flex items-center gap-2 mt-3">
                                        <Button
                                            icon="fluent:subtract-12-filled"
                                            className="py-3"
                                            onClick={() => { }}
                                            aria-label="Decrease quantity"
                                        />
                                        <p className="w-10 text-center font-medium text-lg opacity-60">1</p>
                                        <Button
                                            icon="ic:round-plus"
                                            className="py-3 "
                                            onClick={() => { }}
                                            aria-label="Increase quantity"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-7 rounded-xl flex items-center justify-between">
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
                                    <div className="flex items-center gap-2 mt-3">
                                        <Button
                                            icon="fluent:subtract-12-filled"
                                            className="py-3"
                                            onClick={() => { }}
                                            aria-label="Decrease quantity"
                                        />
                                        <p className="w-10 text-center font-medium text-lg opacity-60">1</p>
                                        <Button
                                            icon="ic:round-plus"
                                            className="py-3 "
                                            onClick={() => { }}
                                            aria-label="Increase quantity"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="w-full h-fit bg-white rounded-lg p-5 space-y-5 sticky top-24">
                        <div className="border-b border-border pb-3">
                            <p className="font-semibold text-lg">Cart Summary</p>
                        </div>
                        <div className="flex justify-between">
                            <h3 className="font-semibold text-2xl">Total</h3>
                            <h3 className="font-semibold text-2xl">N 3000</h3>
                        </div>
                        <Link to="/checkout" className="w-full">
                            <Button className="w-full px-6 py-3">
                                Proceed to Checkout
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-30">
                <div>
                    <p className="font-medium text-2xl">More Vendors</p>
                </div>
                <div className="my-10 grid grid-cols-4 gap-5">
                    <ExploreCard vendorName="dehypekitchen" />
                    <ExploreCard />
                    <ExploreCard />
                    <ExploreCard />
                    <ExploreCard />
                    <ExploreCard />
                    <ExploreCard />
                </div>
            </div>
        </div>
    )
}