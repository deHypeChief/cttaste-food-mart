import { useEffect, useState } from "react";
import Button from "../../components/button";
import { Input } from "../../components/form";
import { Form, FormField } from "../../components/form";
import { Link } from "react-router-dom";

export default function Register() {
    const [activeType, setActiveType] = useState("vendor");
    const [step, setStep] = useState(1); // 1, 2, 3
    const [errors, setErrors] = useState({});
    const [customerForm, setCustomerForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        school: "",
        password: "",
        confirmPassword: "",
    });
    const [vendorForm, setVendorForm] = useState({
        restaurantName: "",
        email: "",
        phone: "",
        location: "",
        address: "",
        vendorType: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type");
        if (type === "customer" || type === "vendor") {
            setActiveType(type);
        }
    }, []);

    const currentForm = activeType === "customer" ? customerForm : vendorForm;

    const validateStep = (type, stepNum, data) => {
        const e = {};
        const isEmail = (v) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v || "");
        const has = (v) => Boolean((v || "").toString().trim());
        const minLen = (v, n) => (v || "").length >= n;

        if (type === "customer") {
            if (stepNum === 1) {
                if (!has(data.fullName)) e.fullName = "Full name is required";
                if (!has(data.phone)) e.phone = "Phone number is required";
            } else if (stepNum === 2) {
                if (!has(data.email)) e.email = "Email is required";
                else if (!isEmail(data.email)) e.email = "Enter a valid email";
                if (!has(data.school)) e.school = "School is required";
            } else if (stepNum === 3) {
                if (!has(data.password)) e.password = "Password is required";
                else if (!minLen(data.password, 6)) e.password = "At least 6 characters";
                if (!has(data.confirmPassword)) e.confirmPassword = "Confirm your password";
                else if (data.confirmPassword !== data.password) e.confirmPassword = "Passwords do not match";
            }
        } else {
            if (stepNum === 1) {
                if (!has(data.restaurantName)) e.restaurantName = "Restaurant name is required";
                if (!has(data.email)) e.email = "Email is required";
                else if (!isEmail(data.email)) e.email = "Enter a valid email";
                if (!has(data.phone)) e.phone = "Phone number is required";
            } else if (stepNum === 2) {
                if (!has(data.location)) e.location = "Location is required";
                if (!has(data.address)) e.address = "Address is required";
                if (!has(data.vendorType)) e.vendorType = "Vendor type is required";
            } else if (stepNum === 3) {
                if (!has(data.password)) e.password = "Password is required";
                else if (!minLen(data.password, 6)) e.password = "At least 6 characters";
                if (!has(data.confirmPassword)) e.confirmPassword = "Confirm your password";
                else if (data.confirmPassword !== data.password) e.confirmPassword = "Passwords do not match";
            }
        }
        return e;
    };

    const handleNext = () => {
        const stepErrors = validateStep(activeType, step, currentForm);
        setErrors(stepErrors);
        if (Object.keys(stepErrors).length === 0) {
            setStep((s) => Math.min(3, s + 1));
        }
    };
    const handleBack = () => setStep((s) => Math.max(1, s - 1));

    const onSubmit = () => {
        const stepErrors = validateStep(activeType, 3, currentForm);
        setErrors(stepErrors);
        if (Object.keys(stepErrors).length === 0) {
            // final submit
            console.log("Submitting register form:", { type: activeType, data: currentForm });
        }
    };

    // Clear errors when step or type changes
    useEffect(() => {
        setErrors({});
    }, [step, activeType]);

    return (
        <>
            <div className="mx-20 ml-28 mt-12">
                {step === 3 ? (
                    <h1 className="text-5xl font-medium leading-normal">
                        Secure <br /> Your account
                    </h1>
                ) : step === 2 ? (
                    activeType === "customer" ? (
                        <h1 className="text-5xl font-medium leading-normal">
                            Tell us <br /> about you
                        </h1>
                    ) : (
                        <h1 className="text-5xl font-medium leading-normal">
                            Add your <br /> business details
                        </h1>
                    )
                ) : (
                    <h1 className="text-5xl font-medium leading-normal">
                        Create a <br />
                        {activeType === "customer" ? "Customer" : "Vendor"} Account
                    </h1>
                )}

                {step === 1 && (
                    <div>
                        <div className="flex p-1 bg-[#EFEFEF] w-fit rounded">
                            <div
                                className={`px-5 py-2 rounded cursor-pointer ${activeType === "vendor" ? "bg-primary" : ""}`}
                                onClick={() => {
                                    setActiveType("vendor");
                                    setStep(1);
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
                                    setStep(1);
                                    const params = new URLSearchParams(window.location.search);
                                    params.set("type", "customer");
                                    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
                                }}
                            >
                                <p className={`font-medium text-sm ${activeType === "customer" ? "text-white" : ""}`}>Customer</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 w-[400px] space-y-8">
                    <Form onSubmit={step === 3 ? onSubmit : (e) => e.preventDefault()} className="space-y-4">
                        {activeType === "customer" && (
                            <>
                                {step === 1 && (
                                    <>
                                        <FormField label="Full name" htmlFor="fullName" message={errors.fullName}
                                        >
                                            <Input
                                                id="fullName"
                                                name="fullName"
                                                placeholder="Full name"
                                                icon="mdi:account-outline"
                                                value={customerForm.fullName}
                                                onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                                            />
                                        </FormField>
                                        <FormField label="Phone number" htmlFor="phone" message={errors.phone}
                                        >
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="Phone number"
                                                icon="mdi:phone-outline"
                                                value={customerForm.phone}
                                                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                                            />
                                        </FormField>
                                    </>
                                )}
                                {step === 2 && (
                                    <>
                                        <FormField label="Email" htmlFor="email" message={errors.email}
                                        >
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="Email"
                                                icon="majesticons:mail-line"
                                                value={customerForm.email}
                                                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                                            />
                                        </FormField>
                                        <FormField label="School" htmlFor="school" message={errors.school}
                                        >
                                            <Input
                                                id="school"
                                                name="school"
                                                placeholder="School"
                                                icon="mdi:school-outline"
                                                value={customerForm.school}
                                                onChange={(e) => setCustomerForm({ ...customerForm, school: e.target.value })}
                                            />
                                        </FormField>
                                    </>
                                )}
                                {step === 3 && (
                                    <>
                                        <FormField label="Password" htmlFor="password" message={errors.password}
                                        >
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                placeholder="Password"
                                                icon="ic:outline-password"
                                                value={customerForm.password}
                                                onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                                            />
                                        </FormField>
                                        <FormField label="Confirm password" htmlFor="confirmPassword" message={errors.confirmPassword}
                                        >
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                placeholder="Confirm password"
                                                icon="ic:outline-password"
                                                value={customerForm.confirmPassword}
                                                onChange={(e) => setCustomerForm({ ...customerForm, confirmPassword: e.target.value })}
                                            />
                                        </FormField>
                                    </>
                                )}
                            </>
                        )}

                        {activeType === "vendor" && (
                            <>
                                {step === 1 && (
                                    <>
                                        <FormField label="Restaurant name" htmlFor="restaurantName" message={errors.restaurantName}
                                        >
                                            <Input
                                                id="restaurantName"
                                                name="restaurantName"
                                                placeholder="Restaurant name"
                                                icon="ep:food"
                                                value={vendorForm.restaurantName}
                                                onChange={(e) => setVendorForm({ ...vendorForm, restaurantName: e.target.value })}
                                            />
                                        </FormField>
                                        <FormField label="Email" htmlFor="vendorEmail" message={errors.email}
                                        >
                                            <Input
                                                id="vendorEmail"
                                                name="vendorEmail"
                                                type="email"
                                                placeholder="Email"
                                                icon="majesticons:mail-line"
                                                value={vendorForm.email}
                                                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                                            />
                                        </FormField>
                                        <FormField label="Phone number" htmlFor="vendorPhone" message={errors.phone}
                                        >
                                            <Input
                                                id="vendorPhone"
                                                name="vendorPhone"
                                                type="tel"
                                                placeholder="Phone number"
                                                icon="mdi:phone-outline"
                                                value={vendorForm.phone}
                                                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                                            />
                                        </FormField>
                                    </>
                                )}
                                {step === 2 && (
                                    <>
                                        <FormField label="Location" htmlFor="location" message={errors.location}
                                        >
                                            <Input
                                                id="location"
                                                name="location"
                                                placeholder="City / Area"
                                                icon="mdi:map-marker-outline"
                                                value={vendorForm.location}
                                                onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                                            />
                                        </FormField>
                                        <FormField label="Address" htmlFor="address" message={errors.address}
                                        >
                                            <Input
                                                id="address"
                                                name="address"
                                                placeholder="Street address"
                                                icon="mdi:home-outline"
                                                value={vendorForm.address}
                                                onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                                            />
                                        </FormField>
                                        <FormField label="Vendor type" htmlFor="vendorType" message={errors.vendorType}
                                        >
                                            <Input
                                                id="vendorType"
                                                name="vendorType"
                                                placeholder="e.g., Restaurant, Cafe, Lounge"
                                                icon="mdi:tag-outline"
                                                value={vendorForm.vendorType}
                                                onChange={(e) => setVendorForm({ ...vendorForm, vendorType: e.target.value })}
                                            />
                                        </FormField>
                                    </>
                                )}
                                {step === 3 && (
                                    <>
                                        <FormField label="Password" htmlFor="vendorPassword" message={errors.password}
                                        >
                                            <Input
                                                id="vendorPassword"
                                                name="vendorPassword"
                                                type="password"
                                                placeholder="Password"
                                                icon="ic:outline-password"
                                                value={vendorForm.password}
                                                onChange={(e) => setVendorForm({ ...vendorForm, password: e.target.value })}
                                            />
                                        </FormField>
                                        <FormField label="Confirm password" htmlFor="vendorConfirmPassword" message={errors.confirmPassword}
                                        >
                                            <Input
                                                id="vendorConfirmPassword"
                                                name="vendorConfirmPassword"
                                                type="password"
                                                placeholder="Confirm password"
                                                icon="ic:outline-password"
                                                value={vendorForm.confirmPassword}
                                                onChange={(e) => setVendorForm({ ...vendorForm, confirmPassword: e.target.value })}
                                            />
                                        </FormField>
                                    </>
                                )}
                            </>
                        )}

                        {step === 1 ? (
                            <div className="pt-2">
                                <Button type="button" className="w-full py-3" onClick={handleNext}>
                                    Continue
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-4 pt-2">
                                <Button type="button" variant="outline" className="px-6" onClick={handleBack}>
                                    Back
                                </Button>
                                {step === 2 ? (
                                    <Button type="button" className="px-6" onClick={handleNext}>
                                        Continue
                                    </Button>
                                ) : (
                                    <Button type="submit" className="px-6">
                                        Create Account
                                    </Button>
                                )}
                            </div>
                        )}
                    </Form>

                    <div className="flex justify-between">
                        <p className="text-sm">
                            Already have an account, <Link to={`/auth/login?type=${activeType}`}><span className="text-primary">Login</span></Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}