import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "../../../components/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/dialog";

export default function UserProfileLayout() {
    const location = useLocation();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Function to check if a path is active
    const isActive = (path) => {
        return location.pathname.endsWith(path);
    };

    const handleDeleteAccount = () => {
        console.log("Account deleted");
        setShowDeleteDialog(false);
        // Add actual delete logic here
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-alt pt-20 pb-20">


                <div className="grid grid-cols-[1fr_2.5fr] gap-10 mx-28 ml-24 mt-20">
                    <div className="bg-white rounded-lg p-5 space-y-5 h-fit sticky top-24">
                        <div className="flex items-center gap-5">
                            <div className="h-[65px] w-[65px] bg-gray-500 rounded-full" />
                            <div>
                                <h1 className="text-2xl font-medium">My Profile</h1>
                                <div className="flex items-center gap-2 opacity-60">
                                    <Icon icon="majesticons:mail-line" className="" />
                                    <p className="text-sm">james@mail.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mt-8">
                            <Link to="/user/" className="block">
                                <button className={`flex items-center w-full font-medium px-4 py-2 rounded transition-colors ${isActive('/')
                                        ? 'bg-primary text-white'
                                        : 'bg-primary/10 text-black hover:text-white hover:bg-primary'
                                    }`}>
                                    <Icon icon="solar:user-bold" className="mr-2 size-5" />
                                    Profile
                                </button>
                            </Link>
                            <Link to="/user/favorite" className="block">
                                <button className={`flex items-center w-full font-medium px-4 py-2 rounded transition-colors ${isActive('/favorite')
                                        ? 'bg-primary text-white'
                                        : 'bg-primary/10 text-black hover:text-white hover:bg-primary'
                                    }`}>
                                    <Icon icon="solar:heart-bold" className="mr-2 size-5" />
                                    Favorite
                                </button>
                            </Link>
                            <Link to="/user/orders" className="block">
                                <button className={`flex items-center w-full font-medium px-4 py-2 rounded transition-colors ${isActive('/orders')
                                        ? 'bg-primary   text-white'
                                        : 'bg-primary/10 text-black hover:text-white hover:bg-primary'
                                    }`}>
                                    <Icon icon="solar:cart-bold" className="mr-2 size-5" />
                                    My Orders
                                </button>
                            </Link>


                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Danger Zone</p>

                            <div className="space-y-3">
                                <button className="flex items-center w-full bg-primary/10 text-black font-medium px-4 py-2 rounded hover:text-white hover:bg-primary">
                                    <Icon icon="solar:logout-3-bold" className="mr-2 size-5" />
                                    Logout
                                </button>
                                
                                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                    <DialogTrigger asChild>
                                        <button className="flex items-center w-full bg-red-600 text-white font-medium px-4 py-2 rounded hover:bg-red-700">
                                            <Icon icon="gg:trash" className="mr-2 size-5" />
                                            Delete Account
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader className="text-center">
                                            <div className="mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                                <Icon icon="gg:trash" className="w-8 h-8 text-red-600" />
                                            </div>
                                            <DialogTitle className="text-xl font-semibold text-gray-900">
                                                Delete Account
                                            </DialogTitle>
                                            <DialogDescription className="text-gray-600 mt-2">
                                                We prioritize the needs of every students and increasing the sales of every food vendor across each institution.
                                            </DialogDescription>
                                        </DialogHeader>
                                        
                                        <div className="mt-6 flex flex-col gap-3">
                                            <Button 
                                                onClick={handleDeleteAccount}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                                            >
                                                Delete My Account
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Outlet />
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}