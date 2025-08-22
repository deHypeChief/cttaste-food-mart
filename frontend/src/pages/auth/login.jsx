import { useEffect, useState } from "react";
import Button from "../../components/button";
import { Input } from "../../components/form";
import { Form, FormField } from "../../components/form";
import { Link, useNavigate } from "react-router-dom";
import { userAuthService, vendorAuthService } from "../../api/auth.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [activeType, setActiveType] = useState("vendor");
    const [isLoading, setIsLoading] = useState(false);
    const { setUser, setVendor, setUserType, checkUserAuthStatus, checkVendorAuthStatus } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type");
        if (type === "customer" || type === "vendor") {
            setActiveType(type);
        }
    }, []);
    // capture optional redirect query (e.g. /auth/login?type=vendor&redirect=%2Fvorder%2Ffoo)
    const paramsForRedirect = new URLSearchParams(window.location.search);
    const redirectParam = paramsForRedirect.get('redirect');

    const onSubmit = async () => {
        console.log('=== LOGIN FORM SUBMISSION STARTED ===');
        console.log('Form state:', form);
        console.log('Active type:', activeType);
        
        const next = { email: "", password: "" };
        if (!form.email) next.email = "Email is required";
        if (!form.password) next.password = "Password is required";
        setErrors(next);
        
        console.log('Validation errors:', next);
        
        if (!next.email && !next.password) {
            console.log('Validation passed, proceeding with login...');
            setIsLoading(true);
            try {
                let response;
                
                if (activeType === "vendor") {
                    console.log('Attempting vendor login with:', { email: form.email, password: form.password ? '[HIDDEN]' : 'MISSING' });
                    console.log('Form data being sent:', { email: form.email, password: form.password ? 'present' : 'missing' });
                    
                    response = await vendorAuthService.login(form);
                    console.log('Vendor login response:', response);
                    console.log('Response structure:', {
                        success: response?.success,
                        data: response?.data,
                        vendor: response?.data?.vendor,
                        session: response?.data?.session
                    });
                    
                        if (response && response.success) {
                        console.log('Setting vendor data:', response.data);
                        setVendor(response.data);
                        setUserType('vendor');
                        try { localStorage.setItem('auth.type', 'vendor'); } catch (e) { console.debug('localStorage set failed', e); }
                        // Confirm via dedicated vendor status
                        await checkVendorAuthStatus();
                        // Respect redirect param when present and safe
                        if (redirectParam) {
                            try {
                                const decoded = decodeURIComponent(redirectParam);
                                // only allow internal redirects
                                if (decoded.startsWith('/')) {
                                    navigate(decoded, { replace: true });
                                } else {
                                    navigate('/vendor', { replace: true });
                                }
                            } catch {
                                navigate('/vendor', { replace: true });
                            }
                        } else {
                            navigate('/vendor');
                        }
                    } else {
                        console.error('Vendor login failed - no success flag');
                    }
                } else {
                    console.log('Attempting customer login with:', { email: form.email });
                    response = await userAuthService.login(form);
                    console.log('Customer login response:', response);
                    
                    if (response.success) {
                        setUser(response.data.user || response.data);
                        setUserType('customer');
                        try { localStorage.setItem('auth.type', 'user'); } catch (e) { console.debug('localStorage set failed', e); }
                        // Confirm via dedicated user status
                        await checkUserAuthStatus();
                        navigate('/');
                    }
                }
                
                console.log("Login successful:", response);
            } catch (error) {
                console.error("Login failed:", error);
                
                let errorMessage = "Login failed. Please check your credentials.";
                
                if (error.status === 401) {
                    if (activeType === "vendor") {
                        errorMessage = "Vendor login failed. Please check your email and password, or ensure your vendor account has been approved.";
                    } else {
                        errorMessage = "Invalid email or password. Please try again.";
                    }
                } else if (error.status === 403) {
                    errorMessage = "Account not approved or access denied.";
                } else if (error.status === 404) {
                    errorMessage = "Account not found. Please check your email or register first.";
                }
                
                setErrors({ 
                    email: "",
                    password: "",
                    submit: error.message || errorMessage
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <div className="mx-5 md:mx-20 md:ml-28 w-screen md:w-auto" >
                <h1 className="text-4xl md:text-5xl font-medium leading-normal">
                    Hey, <br />
                    Welcome back
                </h1>

                <div className="w-full md:w-[400px]">
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

                <div className="mt-8 w-full md:w-[400px] space-y-8">
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
                        <Button type="submit" className="w-full py-3" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Login"}
                        </Button>
                        {errors.submit && (
                            <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
                        )}
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