import { Outlet } from "react-router-dom";
import Footer from "../../components/footer";
import Navbar from "../../components/navbar";

export default function UserLayout() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-alt pt-20 pb-20">
                <Outlet />
            </main>
            <Footer />
        </>
    )
}