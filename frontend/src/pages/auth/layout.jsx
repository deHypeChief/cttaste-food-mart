import { Outlet } from "react-router-dom";
import { AuthNavbar } from "../../components/navbar";

export default function AuthLayout() {
    return (
        <>
            <AuthNavbar />
            <main className="min-h-screen">
                <div className="grid grid-cols-2 h-full">
                    <div className="flex items-center">
                        <Outlet />
                    </div>
                    <div className="bg-amber-200 h-screen"></div>
                </div>
            </main>
        </>
    )
}