import { Icon } from "@iconify/react/dist/iconify.js";

export default function Footer() {
    return (
        <>
            <footer className="py-10 px-5 md:px-20 space-y-10 bg-white">
                <div>
                    <img src="/Logo.svg" className="size-20" alt="" />
                </div>

                <div className="space-y-5 md:space-y-0 md:grid grid-cols-[1fr_1fr_1fr_0.75fr] gap-10">
                    <div>
                        <h2 className="font-medium text-sm md:text-xl mb-3">About Us</h2>
                        <p className="opacity-60">
                            We prioritize the needs of every students and increasing the sales of every food vendor across each institution.
                        </p>
                    </div>

                    <div>
                        <h2 className="font-medium text-sm md:text-xl mb-3">Other Products</h2>
                        <ul className="space-y-2 opacity-60">
                            <li className="">Who Are We</li>
                            <li className="">Privacy Policy</li>
                            <li className="">Terms Of Service</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-medium text-sm md:text-xl mb-3">For Restaurants</h2>
                        <ul className="space-y-2 opacity-60">
                            <li>Add Restaurants</li>
                            <li>Join The Community</li>
                            <li>Contact Us</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="font-medium text-sm md:text-xl mb-3">Our Social Media</h2>
                        <div className="flex items-center gap-3"> 
                            <Icon icon="mingcute:twitter-line" className="size-6" />
                            <Icon icon="iconoir:youtube" className="size-6" />
                            <Icon icon="mdi:instagram" className="size-6" />
                            <Icon icon="ic:baseline-facebook" className="size-6" />
                        </div>
                    </div>
                </div>

                <div className="md:flex space-y-5 md:space-y-0 items-center justify-between">
                    <p>© {new Date().getFullYear()} CTTaste. A product of CTHostel.</p>
                    <div className="flex items-center gap-5">
                        <img src="./app-store.png" alt="" />
                        <img src="./play-store.png" alt="" />
                    </div>
                </div>
            </footer>
        </>
    )
}