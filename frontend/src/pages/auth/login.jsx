import { useEffect, useState } from "react";
import Button from "../../components/button";
import { Input } from "../../components/form";
import { Form, FormField } from "../../components/form";
import { Link } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [activeType, setActiveType] = useState("vendor");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type");
        if (type === "customer" || type === "vendor") {
            setActiveType(type);
        }
    }, []);

    const onSubmit = () => {
        console.log("Form data:", form);
        const next = { email: "", password: "" };
        if (!form.email) next.email = "Email is required";
        if (!form.password) next.password = "Password is required";
        setErrors(next);
        if (!next.email && !next.password) {
            // submit logic here
            console.log("Submitting form:", form);
            // e.g., call API
        }
    };

    return (
        <>
            <div className="mx-20 ml-28">
                <h1 className="text-5xl font-medium leading-normal">
                    Hey, <br />
                    Welcome back
                </h1>

                <div>
                    <div className="flex p-1 bg-[#EFEFEF] w-fit rounded">
                        <div
                            className={`px-5 py-2 rounded cursor-pointer ${activeType === "vendor" ? "bg-primary" : ""}`}
                            onClick={() => {
                                setActiveType("vendor");
                                const params = new URLSearchParams(window.location.search);
                                params.set("type", "vendor");
                                window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
                            }}
                        >
                            <p className={`font-medium text-sm ${activeType === "vendor" ? "text-white" : ""}`}>Vendor</p>
                        </div>
                        <div
                            className={`px-5 py-2 rounded cursor-pointer ${activeType === "customer" ? "bg-primary" : ""}`}
                            onClick={() => {
                                setActiveType("customer");
                                const params = new URLSearchParams(window.location.search);
                                params.set("type", "customer");
                                window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
                            }}
                        >
                            <p className={`font-medium text-sm ${activeType === "customer" ? "text-white" : ""}`}>Customer</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 w-[400px] space-y-8">
                    <Form onSubmit={onSubmit} className="space-y-4">
                        <FormField label="Email" message={errors.email} htmlFor="email">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email"
                                icon="majesticons:mail-line"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Password" message={errors.password} htmlFor="password">
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Password"
                                icon="ic:outline-password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </FormField>
                        <Button type="submit" className="w-full py-3">
                            Login
                        </Button>
                    </Form>

                    <div className="flex justify-between">
                        <p className="text-sm">
                            New here, <Link to={`/auth/register?type=${activeType}`}><span className="text-primary">Create Account</span></Link>
                        </p>
                        <p className="text-sm">
                            Forgot password?
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}