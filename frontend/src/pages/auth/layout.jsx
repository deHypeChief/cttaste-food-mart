import { Outlet } from "react-router-dom";
import { AuthNavbar } from "../../components/navbar";

export default function AuthLayout() {
    return (
        <>
            <AuthNavbar />
            <main className="min-h-screen">
                <div className="md:grid grid-cols-2 h-screen md:h-full">
                    <div className="flex items-center h-full">
                        <Outlet />
                    </div>
                    <div className="bg-amber-200 h-screen hidden md:block"></div>
                </div>
            </main>
        </>
    )
}