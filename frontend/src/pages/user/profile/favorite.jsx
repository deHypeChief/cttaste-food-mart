import { Icon } from "@iconify/react";
import Button from "../../../components/button";

export default function Favorite() {
    return (
        <>
            <div className="bg-white p-7 rounded-xl ">
                <div className="border-b border-border pb-3 flex justify-between items-center ">
                    <p className="font-semibold text-lg">My Favorite</p>
                </div>

                <div className="space-y-5 pt-5">
                    <div className="p-4 py-0 rounded-xl flex items-center justify-between">
                        <div className="flex gap-5 items-center">
                            <div className="h-[100px] w-[100px] rounded-xl bg-gray-400" />

                            <div className=" py-2">
                                <h2 className="text-xl font-medium mt-1">
                                    De Hype Kitchen
                                </h2>

                                <p className="font-medium opacity-60">Fried Rice</p>
                            </div>
                        </div>
                        <div>
                            <button
                                type="button"
                                className="flex items-center justify-center size-8 transition-colors"
                            >
                                <Icon icon="solar:heart-bold" className="text-primary size-10" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 py-0 rounded-xl flex items-center justify-between">
                        <div className="flex gap-5 items-center">
                            <div className="h-[100px] w-[100px] rounded-xl bg-gray-400" />

                            <div className=" py-2">
                                <h2 className="text-xl font-medium mt-1">
                                    De Hype Kitchen
                                </h2>

                                <p className="font-medium opacity-60">Fried Rice</p>
                            </div>
                        </div>
                        <div>
                            <button
                                type="button"
                                className="flex items-center justify-center size-8 transition-colors"
                            >
                                <Icon icon="solar:heart-bold" className="text-primary size-10" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}