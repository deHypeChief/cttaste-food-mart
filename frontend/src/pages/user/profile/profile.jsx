import { useState, useEffect } from "react";
import { Form, FormField, Input } from "../../../components/form";
import Button from "../../../components/button";
import { useAuth } from "../../../hooks/useAuth.js";

export default function Profile() {
    const { user } = useAuth();
    
    // Debug log to see the user data structure
    console.log('User data in profile form:', user);
    
    const [form, setForm] = useState({
        name: user?.session?.fullName || user?.user?.username || '',
        school: user?.user?.school || '',
        phone: user?.user?.phoneNumber || '',
        email: user?.session?.email || '',
        country: 'Nigeria',
        deliveryAddress: user?.user?.address || ''
    });

    // Update form when user data loads
    useEffect(() => {
        if (user) {
            setForm({
                name: user?.session?.fullName || user?.user?.username || '',
                school: user?.user?.school || '',
                phone: user?.user?.phoneNumber || '',
                email: user?.session?.email || '',
                country: 'Nigeria',
                deliveryAddress: user?.user?.address || ''
            });
        }
    }, [user]);

    // eslint-disable-next-line no-unused-vars
    const [errors, setErrors] = useState({});

    const onSubmit = (e) => {
        e.preventDefault();
        console.log('Profile Data:', form);
    };

    return (
        <>
            <div className="bg-white p-7 rounded-xl ">
                <div className="border-b border-border pb-3 flex justify-between items-center ">
                    <p className="font-semibold text-lg">My Profile</p>
                </div>

                <div className="space-y-3 pt-5">
                    <div>
                        <Form onSubmit={onSubmit} className="space-y-4">
                            <FormField label="Your Name" message={errors.name} htmlFor="name">
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    icon="majesticons:user-line"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </FormField>
                            
                            <FormField label="School" message={errors.school} htmlFor="school">
                                <Input
                                    id="school"
                                    name="school"
                                    type="text"
                                    placeholder="Enter your school name"
                                    icon="majesticons:academic-cap-line"
                                    value={form.school}
                                    onChange={(e) => setForm({ ...form, school: e.target.value })}
                                />
                            </FormField>
                            
                            <FormField label="Phone Number" message={errors.phone} htmlFor="phone">
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    icon="majesticons:phone-line"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </FormField>
                            
                            <FormField label="Email" message={errors.email} htmlFor="email">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    icon="majesticons:mail-line"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </FormField>
                            
                            <FormField label="Country" message={errors.country} htmlFor="country">
                                <Input
                                    id="country"
                                    name="country"
                                    type="text"
                                    placeholder="Enter your country"
                                    icon="majesticons:globe-line"
                                    value={form.country}
                                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                                />
                            </FormField>
                            
                            <FormField label="Delivery Address" message={errors.deliveryAddress} htmlFor="deliveryAddress">
                                <Input
                                    id="deliveryAddress"
                                    name="deliveryAddress"
                                    type="text"
                                    placeholder="Enter your delivery address"
                                    icon="majesticons:map-marker-line"
                                    value={form.deliveryAddress}
                                    onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                                />
                            </FormField>
                            
                            <Button type="submit" className="w-full py-3">
                                Save Profile
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    )
} 