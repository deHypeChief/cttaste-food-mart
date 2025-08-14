import Button from "./button";
import { Icon } from "@iconify/react"
import { Input } from "./form";
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <>
            <nav className="bg-white fixed top-0 w-screen z-20">
                <div className="px-20 flex justify-between items-center py-2">
                    <div>
                        <div className="flex items-center gap-10">
                            <div>
                                <img src="/Logo.svg" alt="" className="size-16" />
                            </div>
                            <div className="mt-1 flex">
                                <Input type="text" icon="ep:food" placeholder="Search Vendor" className="w-[400px]" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-10">
                        <Link to="/cart">
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:cart-outline" className="size-5" />
                                <p className="font-medium">Cart - 3</p>
                            </div>
                        </Link>
                        <Link to="/auth/login?type=customer">
                            <Button className="px-6 py-3">Login</Button>
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    )
}

export function AuthNavbar() {
    return (
        <>
            <nav className="fixed top-0 w-screen z-20">
                <div className="px-20 flex justify-between items-center py-2">
                    <div >
                        <Link to="/">
                            <img src="/Logo.svg" alt="logo" className="size-16" />
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    )
}