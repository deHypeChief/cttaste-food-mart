import { Icon } from "@iconify/react";
import Button from "../../components/button";
import { H1 } from "../../components/typography";
import { ExploreCard } from "../../components/vendor";

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
        {
            name: "Food",
            icon: "tdesign:chicken"
        },
        {
            name: "Food",
            icon: "tdesign:chicken"
        },
        {
            name: "Food",
            icon: "tdesign:chicken"
        },
        {
            name: "Food",
            icon: "tdesign:chicken"
        },
        {
            name: "Food",
            icon: "tdesign:chicken"
        },
        {
            name: "Food",
            icon: "tdesign:chicken"
        },
        {
            name: "Food",
            icon: "tdesign:chicken"
        }
    ]
}

export default function Explore() {
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
                    <Button icon="mingcute:location-line" variant="outlineFade" className="px-0 py-3">
                        UNIABU
                    </Button>
                    <div className="w-[70%] flex gap-4 overflow-x-scroll hide-scrollbar">
                        {
                            exploreData.catList.map((cat) => (
                                cat.name == "All" ? (
                                    <Button key={cat.name} variant="primary" className="px-6 py-3 rounded-full">
                                        {cat.name}
                                    </Button>
                                ) : (
                                    <Button key={cat.name} icon={cat.icon || ""} variant="outlineFade" className="px-0 py-3 rounded-full">
                                        {cat.name}
                                    </Button>
                                )
                            ))
                        }
                    </div>
                    <Button icon="mynaui:filter" variant="outlineFade" className="px-0 py-3">
                        Fillter
                    </Button>
                </div>

                <div className="my-10 grid grid-cols-4 gap-5">
                    <ExploreCard vendorName="dehypekitchen"/>
                    <ExploreCard />
                    <ExploreCard />
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