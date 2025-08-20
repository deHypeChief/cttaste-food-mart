import { Outlet } from "react-router-dom";
import Footer from "../../components/footer";
import Navbar from "../../components/navbar";
import LogoutButton from "../../components/LogoutButton.jsx";

export default function UserLayout() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-alt pt-10 md:pt-20 pb-20">
                <Outlet />
            </main>
            <Footer />
            {/* User logout button positioned for easy access */}
        </>
    )
}