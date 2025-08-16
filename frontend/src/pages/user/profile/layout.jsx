import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "../../../components/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/dialog";
import { useAuth } from "../../../hooks/useAuth.js";
import { authService } from "../../../api/auth.js";
import { useToast } from "../../../components/toast.jsx";

export default function UserProfileLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const { user, isLoading, logout } = useAuth();
    const { toast } = useToast();

    // Debug log to see user data structure
    console.log('User data in layout:', user);

    // Function to check if a path is active
    const isActive = (path) => {
        return location.pathname.endsWith(path);
    };

    const handleDeleteAccount = async () => {
        if (isDeletingAccount) return;
        
        setIsDeletingAccount(true);
        try {
            // Call the delete account API
            await authService.deleteAccount('customer');
            
            console.log("Account successfully deleted for user:", user?.session?.email);
            
            // Show success toast
            toast.success(
                "Account successfully deleted. You will be redirected to the login page.",
                "Account Deleted"
            );
            
            // Logout the user after deletion
            await logout();
            navigate('/auth/login?type=customer');
            
        } catch (error) {
            console.error('Account deletion failed:', error);
            
            // Check if it's a 404 error (endpoint not implemented)
            if (error.response?.status === 404) {
                toast.warning(
                    "Account deletion feature is not yet implemented on the server. Please contact support for manual account deletion.",
                    "Feature Not Available"
                );
            } else {
                toast.error(
                    "Failed to delete account. Please try again or contact support.",
                    "Deletion Failed"
                );
            }
        } finally {
            setIsDeletingAccount(false);
            setShowDeleteDialog(false);
        }
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        try {
            await logout();
            navigate('/auth/login?type=customer');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/auth/login?type=customer');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-alt pt-20 pb-20">


                <div className="grid grid-cols-[1fr_2.5fr] gap-10 mx-28 ml-24 mt-20">
                    <div className="bg-white rounded-lg p-5 space-y-5 h-fit sticky top-24">
                        <div className="flex items-center gap-5">
                            <div className="h-[65px] w-[65px] bg-gray-500 rounded-full flex items-center justify-center">
                                {user?.session?.profile && user.session.profile !== "" ? (
                                    <img 
                                        src={user.session.profile} 
                                        alt="Profile" 
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <Icon 
                                        icon="solar:user-bold" 
                                        className="text-white text-2xl" 
                                    />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-medium">
                                    {isLoading ? (
                                        <div className="animate-pulse bg-gray-300 h-6 w-32 rounded"></div>
                                    ) : (
                                        user?.session?.fullName || user?.user?.username || 'My Profile'
                                    )}
                                </h1>
                                <div className="flex items-center gap-2 opacity-60">
                                    <Icon icon="majesticons:mail-line" className="" />
                                    <p className="text-sm">
                                        {isLoading ? (
                                            <div className="animate-pulse bg-gray-300 h-4 w-40 rounded"></div>
                                        ) : (
                                            user?.session?.email || 'Loading...'
                                        )}
                                    </p>
                                </div>
                                {user?.user?.phoneNumber && !isLoading && (
                                    <div className="flex items-center gap-2 opacity-60 mt-1">
                                        <Icon icon="majesticons:phone-line" className="" />
                                        <p className="text-sm">{user.user.phoneNumber}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 mt-8">
                            <Link to="/user" className="block">
                                <button className={`flex items-center w-full font-medium px-4 py-2 rounded transition-colors ${isActive('/') || isActive('/user')
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
                                <button 
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="flex items-center w-full bg-primary/10 text-black font-medium px-4 py-2 rounded hover:text-white hover:bg-primary disabled:opacity-50"
                                >
                                    <Icon 
                                        icon={isLoggingOut ? "line-md:loading-loop" : "solar:logout-3-bold"} 
                                        className="mr-2 size-5" 
                                    />
                                    {isLoggingOut ? "Logging out..." : "Logout"}
                                </button>
                                
                                
                                <Dialog open={showDeleteDialog} onOpenChange={(open) => {
                                    // Prevent closing dialog while deletion is in progress
                                    if (!isDeletingAccount) {
                                        setShowDeleteDialog(open);
                                    }
                                }}>
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
                                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including your profile, orders, and preferences.
                                            </DialogDescription>
                                        </DialogHeader>
                                        
                                        <div className="mt-6 flex flex-col gap-3">
                                            <Button 
                                                onClick={handleDeleteAccount}
                                                disabled={isDeletingAccount}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 disabled:opacity-50"
                                            >
                                                {isDeletingAccount ? (
                                                    <span className="flex items-center gap-2">
                                                        <Icon icon="line-md:loading-loop" className="w-4 h-4" />
                                                        Deleting Account...
                                                    </span>
                                                ) : (
                                                    "Delete My Account"
                                                )}
                                            </Button>
                                            <Button 
                                                onClick={() => setShowDeleteDialog(false)}
                                                disabled={isDeletingAccount}
                                                variant="outline"
                                                className="w-full py-3"
                                            >
                                                Cancel
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