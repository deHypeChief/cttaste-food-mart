import { useState } from "react";
import { Icon } from "@iconify/react";
import { DashboardCard, LargeCard } from "../../components/dashboardCard";
import { Input, FormField } from "../../components/form";
import Button from "../../components/button";
import Switch from "../../components/switch";

export default function Settings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [profileData, setProfileData] = useState({
        restaurantName: "Taste Palace",
        ownerName: "John Doe",
        email: "john@tastepalace.com",
        phone: "+234 803 123 4567",
        address: "15 Victoria Island, Lagos",
        description: "We serve the best Nigerian and Continental dishes",
        cuisine: "Nigerian, Continental",
        avatar: null
    });

    const [businessSettings, setBusinessSettings] = useState({
        minimumOrder: "5000",
        deliveryFee: "1500",
        deliveryRadius: "10",
        preparationTime: "30",
        currency: "NGN",
        taxRate: "7.5"
    });

    const [notifications, setNotifications] = useState({
        orderNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        promotionalEmails: true,
        weeklyReports: true
    });

    const [operationalSettings, setOperationalSettings] = useState({
        autoAcceptOrders: false,
        holidayMode: false,
        temporaryClosure: false,
        onlinePayments: true,
        cashOnDelivery: true
    });

    const [security, setSecurity] = useState({
        twoFactorAuth: false,
        loginAlerts: true,
        passwordLastChanged: "2024-07-15"
    });

    const tabs = [
        { id: "profile", label: "Restaurant Profile", icon: "majesticons:user-line" },
        { id: "business", label: "Business Settings", icon: "majesticons:building-line" },
        { id: "operations", label: "Operations", icon: "majesticons:settings-line" },
        { id: "notifications", label: "Notifications", icon: "majesticons:bell-line" },
        { id: "security", label: "Security", icon: "majesticons:lock-line" },
        { id: "payment", label: "Payment & Billing", icon: "majesticons:credit-card-line" }
    ];

    const handleProfileUpdate = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleBusinessUpdate = (field, value) => {
        setBusinessSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleNotificationToggle = (field) => {
        setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleOperationalToggle = (field) => {
        setOperationalSettings(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSecurityToggle = (field) => {
        setSecurity(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="bg-[#fdf6f1] min-h-screen">
            <h1 className="text-3xl font-semibold mb-8 text-gray-900">Settings</h1>

            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="flex flex-wrap gap-2 bg-white p-2 rounded-lg shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? "bg-orange-500 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <Icon icon={tab.icon} className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Profile Settings */}
            {activeTab === "profile" && (
                <div className="space-y-6">
                    <LargeCard title="Restaurant Profile" icon="majesticons:user-line">
                        <div className="space-y-6">
                            {/* Avatar Upload */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                    <Icon icon="majesticons:image-line" className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                    <Button variant="outlineFade" size="sm">
                                        Upload Logo
                                    </Button>
                                    <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Restaurant Name" required>
                                    <Input
                                        value={profileData.restaurantName}
                                        onChange={(e) => handleProfileUpdate("restaurantName", e.target.value)}
                                        placeholder="Enter restaurant name"
                                    />
                                </FormField>

                                <FormField label="Owner Name" required>
                                    <Input
                                        value={profileData.ownerName}
                                        onChange={(e) => handleProfileUpdate("ownerName", e.target.value)}
                                        placeholder="Enter owner name"
                                    />
                                </FormField>

                                <FormField label="Email Address" required>
                                    <Input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => handleProfileUpdate("email", e.target.value)}
                                        placeholder="Enter email address"
                                    />
                                </FormField>

                                <FormField label="Phone Number" required>
                                    <Input
                                        value={profileData.phone}
                                        onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                </FormField>

                                <FormField label="Cuisine Type">
                                    <Input
                                        value={profileData.cuisine}
                                        onChange={(e) => handleProfileUpdate("cuisine", e.target.value)}
                                        placeholder="e.g., Nigerian, Continental"
                                    />
                                </FormField>
                            </div>

                            <FormField label="Restaurant Address" required>
                                <Input
                                    value={profileData.address}
                                    onChange={(e) => handleProfileUpdate("address", e.target.value)}
                                    placeholder="Enter full address"
                                />
                            </FormField>

                            <FormField label="Description">
                                <textarea
                                    value={profileData.description}
                                    onChange={(e) => handleProfileUpdate("description", e.target.value)}
                                    placeholder="Tell customers about your restaurant"
                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                                />
                            </FormField>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline">Cancel</Button>
                                <Button variant="primary">Save Changes</Button>
                            </div>
                        </div>
                    </LargeCard>
                </div>
            )}

            {/* Business Settings */}
            {activeTab === "business" && (
                <div className="space-y-6">
                    <LargeCard title="Business Settings" icon="majesticons:building-line">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Minimum Order Amount (₦)">
                                <Input
                                    type="number"
                                    value={businessSettings.minimumOrder}
                                    onChange={(e) => handleBusinessUpdate("minimumOrder", e.target.value)}
                                    placeholder="5000"
                                />
                            </FormField>

                            <FormField label="Delivery Fee (₦)">
                                <Input
                                    type="number"
                                    value={businessSettings.deliveryFee}
                                    onChange={(e) => handleBusinessUpdate("deliveryFee", e.target.value)}
                                    placeholder="1500"
                                />
                            </FormField>

                            <FormField label="Delivery Radius (km)">
                                <Input
                                    type="number"
                                    value={businessSettings.deliveryRadius}
                                    onChange={(e) => handleBusinessUpdate("deliveryRadius", e.target.value)}
                                    placeholder="10"
                                />
                            </FormField>

                            <FormField label="Average Preparation Time (mins)">
                                <Input
                                    type="number"
                                    value={businessSettings.preparationTime}
                                    onChange={(e) => handleBusinessUpdate("preparationTime", e.target.value)}
                                    placeholder="30"
                                />
                            </FormField>

                            <FormField label="Tax Rate (%)">
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={businessSettings.taxRate}
                                    onChange={(e) => handleBusinessUpdate("taxRate", e.target.value)}
                                    placeholder="7.5"
                                />
                            </FormField>

                            <FormField label="Currency">
                                <select 
                                    value={businessSettings.currency}
                                    onChange={(e) => handleBusinessUpdate("currency", e.target.value)}
                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="NGN">Nigerian Naira (₦)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="GBP">British Pound (£)</option>
                                </select>
                            </FormField>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button variant="outline">Reset</Button>
                            <Button variant="primary">Update Settings</Button>
                        </div>
                    </LargeCard>
                </div>
            )}

            {/* Operations Settings */}
            {activeTab === "operations" && (
                <div className="space-y-6">
                    <LargeCard title="Operational Settings" icon="majesticons:settings-line">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Auto Accept Orders</h3>
                                    <p className="text-sm text-gray-600">Automatically accept incoming orders</p>
                                </div>
                                <Switch
                                    checked={operationalSettings.autoAcceptOrders}
                                    onChange={() => handleOperationalToggle("autoAcceptOrders")}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Holiday Mode</h3>
                                    <p className="text-sm text-gray-600">Pause all orders temporarily</p>
                                </div>
                                <Switch
                                    checked={operationalSettings.holidayMode}
                                    onChange={() => handleOperationalToggle("holidayMode")}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Temporary Closure</h3>
                                    <p className="text-sm text-gray-600">Close restaurant for maintenance</p>
                                </div>
                                <Switch
                                    checked={operationalSettings.temporaryClosure}
                                    onChange={() => handleOperationalToggle("temporaryClosure")}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Online Payments</h3>
                                    <p className="text-sm text-gray-600">Accept card and digital payments</p>
                                </div>
                                <Switch
                                    checked={operationalSettings.onlinePayments}
                                    onChange={() => handleOperationalToggle("onlinePayments")}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Cash on Delivery</h3>
                                    <p className="text-sm text-gray-600">Accept cash payments on delivery</p>
                                </div>
                                <Switch
                                    checked={operationalSettings.cashOnDelivery}
                                    onChange={() => handleOperationalToggle("cashOnDelivery")}
                                />
                            </div>
                        </div>
                    </LargeCard>
                </div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
                <div className="space-y-6">
                    <LargeCard title="Notification Preferences" icon="majesticons:bell-line">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Order Notifications</h3>
                                    <p className="text-sm text-gray-600">Get notified of new orders</p>
                                </div>
                                <Switch
                                    checked={notifications.orderNotifications}
                                    onChange={() => handleNotificationToggle("orderNotifications")}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                                    <p className="text-sm text-gray-600">Receive important updates via email</p>
                                </div>
                                <Switch
                                    checked={notifications.emailNotifications}
                                    onChange={() => handleNotificationToggle("emailNotifications")}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                                    <p className="text-sm text-gray-600">Get SMS alerts for urgent matters</p>
                                </div>
                                <Switch
                                    checked={notifications.smsNotifications}
                                    onChange={() => handleNotificationToggle("smsNotifications")}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Promotional Emails</h3>
                                    <p className="text-sm text-gray-600">Marketing tips and platform updates</p>
                                </div>
                                <Switch
                                    checked={notifications.promotionalEmails}
                                    onChange={() => handleNotificationToggle("promotionalEmails")}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Weekly Reports</h3>
                                    <p className="text-sm text-gray-600">Weekly sales and performance reports</p>
                                </div>
                                <Switch
                                    checked={notifications.weeklyReports}
                                    onChange={() => handleNotificationToggle("weeklyReports")}
                                />
                            </div>
                        </div>
                    </LargeCard>
                </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
                <div className="space-y-6">
                    <LargeCard title="Security Settings" icon="majesticons:lock-line">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-600">Add extra security to your account</p>
                                </div>
                                <Switch
                                    checked={security.twoFactorAuth}
                                    onChange={() => handleSecurityToggle("twoFactorAuth")}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Login Alerts</h3>
                                    <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                                </div>
                                <Switch
                                    checked={security.loginAlerts}
                                    onChange={() => handleSecurityToggle("loginAlerts")}
                                />
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Password</h3>
                                        <p className="text-sm text-gray-600">Last changed: {security.passwordLastChanged}</p>
                                    </div>
                                    <Button variant="outlineFade" size="sm">
                                        Change Password
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
                                <p className="text-sm text-red-700 mb-4">
                                    These actions are permanent and cannot be undone
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="outline" size="sm">
                                        Deactivate Account
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Delete Account
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </LargeCard>
                </div>
            )}

            {/* Payment Settings */}
            {activeTab === "payment" && (
                <div className="space-y-6">
                    <LargeCard title="Payment & Billing" icon="majesticons:credit-card-line">
                        <div className="space-y-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Bank Account</h3>
                                <p className="text-sm text-gray-600 mb-4">Account for receiving payments</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Bank Name">
                                        <Input placeholder="Select your bank" />
                                    </FormField>
                                    <FormField label="Account Number">
                                        <Input placeholder="Enter account number" />
                                    </FormField>
                                    <FormField label="Account Name">
                                        <Input placeholder="Account holder name" />
                                    </FormField>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Subscription Plan</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Basic Plan</p>
                                        <p className="text-sm text-gray-600">₦5,000/month • Up to 100 orders</p>
                                    </div>
                                    <Button variant="outlineFade" size="sm">
                                        Upgrade Plan
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Payment History</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>August 2024 Subscription</span>
                                        <span className="text-green-600">₦5,000</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>July 2024 Subscription</span>
                                        <span className="text-green-600">₦5,000</span>
                                    </div>
                                </div>
                                <Button variant="outlineFade" size="sm" className="mt-4">
                                    View All Transactions
                                </Button>
                            </div>
                        </div>
                    </LargeCard>
                </div>
            )}
        </div>
    );
}