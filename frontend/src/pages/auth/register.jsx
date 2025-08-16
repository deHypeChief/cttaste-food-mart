import { useEffect, useState } from "react";
import Button from "../../components/button";
import { Input } from "../../components/form";
import { Form, FormField } from "../../components/form";
import { Link, useNavigate } from "react-router-dom";
import { userAuthService, vendorAuthService } from "../../api/auth.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function Register() {
    const NIGERIAN_UNIS = [
        { value: "University of Abuja (UNIABUJA)", label: "University of Abuja (UNIABUJA)" },
        { value: "University of Lagos (UNILAG)", label: "University of Lagos (UNILAG)" },
        { value: "University of Ibadan (UI)", label: "University of Ibadan (UI)" },
        { value: "Obafemi Awolowo University (OAU)", label: "Obafemi Awolowo University (OAU)" },
        { value: "Ahmadu Bello University (ABU)", label: "Ahmadu Bello University (ABU)" },
        { value: "University of Nigeria, Nsukka (UNN)", label: "University of Nigeria, Nsukka (UNN)" },
        { value: "University of Benin (UNIBEN)", label: "University of Benin (UNIBEN)" },
        { value: "University of Port Harcourt (UNIPORT)", label: "University of Port Harcourt (UNIPORT)" },
        { value: "University of Ilorin (UNILORIN)", label: "University of Ilorin (UNILORIN)" },
        { value: "Lagos State University (LASU)", label: "Lagos State University (LASU)" },
        { value: "Covenant University (CU)", label: "Covenant University (CU)" },
        { value: "FUTA", label: "Federal University of Technology Akure (FUTA)" },
        { value: "FUTMINNA", label: "Federal University of Technology Minna (FUTMINNA)" },
        { value: "Bayero University Kano (BUK)", label: "Bayero University Kano (BUK)" },
        { value: "University of Calabar (UNICAL)", label: "University of Calabar (UNICAL)" },
        { value: "University of Uyo (UNIUYO)", label: "University of Uyo (UNIUYO)" },
        { value: "Nnamdi Azikiwe University (UNIZIK)", label: "Nnamdi Azikiwe University (UNIZIK)" },
        { value: "Rivers State University (RSU)", label: "Rivers State University (RSU)" },
        { value: "University of Jos (UNIJOS)", label: "University of Jos (UNIJOS)" },
    ];
    const [activeType, setActiveType] = useState("vendor");
    const [step, setStep] = useState(1); // 1, 2, 3
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { setUser, setVendor, setUserType } = useAuth();
    const navigate = useNavigate();
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

    const onSubmit = async () => {
        const stepErrors = validateStep(activeType, 3, currentForm);
        setErrors(stepErrors);
        if (Object.keys(stepErrors).length === 0) {
            setIsLoading(true);
            try {
                let response;
                
                if (activeType === "customer") {
                    // Map frontend form to backend expected format
                    const userData = {
                        fullName: customerForm.fullName,
                        phoneNumber: customerForm.phone,
                        email: customerForm.email,
                        school: customerForm.school,
                        password: customerForm.password,
                        confirmPassword: customerForm.confirmPassword,
                        username: customerForm.fullName.replace(/\s+/g, '').toLowerCase(),
                        gender: "notSpecified",
                        dateOfBirth: new Date().toISOString().split('T')[0],
                        profile: "",
                        referalToken: ""
                    };
                    
                    response = await userAuthService.register(userData);
                    
                    if (response.success) {
                        setUser(response.data.user);
                        setUserType('customer');
                        navigate('/user/dashboard');
                    }
                } else {
                    // Map frontend form to backend expected format
                    const vendorData = {
                        fullName: vendorForm.restaurantName + " Owner",
                        email: vendorForm.email,
                        phoneNumber: vendorForm.phone,
                        restaurantName: vendorForm.restaurantName,
                        location: vendorForm.location,
                        address: vendorForm.address,
                        vendorType: vendorForm.vendorType || "Restaurant",
                        password: vendorForm.password,
                        confirmPassword: vendorForm.confirmPassword,
                        profile: "",
                        description: "",
                        cuisine: ""
                    };
                    
                    response = await vendorAuthService.register(vendorData);
                    
                    if (response.success) {
                        setVendor(response.data.vendor);
                        setUserType('vendor');
                        navigate('/vendor/dashboard');
                    }
                }
                
                console.log("Registration successful:", response);
            } catch (error) {
                console.error("Registration failed:", error);
                setErrors({ submit: error.message || "Registration failed. Please try again." });
            } finally {
                setIsLoading(false);
            }
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
                                        <FormField label="Location (Campus)" htmlFor="location" message={errors.location}>
                                            <div className="relative">
                                                <select
                                                    id="location"
                                                    name="location"
                                                    value={vendorForm.location}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
                                                >
                                                    <option value="">Select your campus</option>
                                                    {NIGERIAN_UNIS.map((u) => (
                                                        <option key={u.value} value={u.value}>{u.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                    </svg>
                                                </div>
                                            </div>
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
                                        <FormField label="Vendor type" htmlFor="vendorType" message={errors.vendorType}>
                                            <div className="relative">
                                                <select
                                                    id="vendorType"
                                                    name="vendorType"
                                                    value={vendorForm.vendorType}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, vendorType: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
                                                >
                                                    <option value="">Select vendor type</option>
                                                    <option value="Restaurant">Restaurant</option>
                                                    <option value="Cafe">Cafe</option>
                                                    <option value="Lounge">Lounge</option>
                                                    <option value="Fast Food">Fast Food</option>
                                                    <option value="Bar">Bar</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                    </svg>
                                                </div>
                                            </div>
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
                                    <Button type="submit" className="px-6" disabled={isLoading}>
                                        {isLoading ? "Creating..." : "Create Account"}
                                    </Button>
                                )}
                            </div>
                        )}
                        {errors.submit && (
                            <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
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