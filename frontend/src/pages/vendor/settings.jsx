import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { DashboardCard, LargeCard } from "../../components/dashboardCard";
import { Input, FormField } from "../../components/form";
import Button from "../../components/button";
import Switch from "../../components/switch";
import LogoutButton from "../../components/LogoutButton.jsx";
import { vendorAuthService } from "../../api/auth";
import { vendorService } from "../../api/vendor";
import { useToast } from "../../components/toast.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/dialog.jsx";

export default function Settings() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const bannerInputRef = useRef(null);
    const avatarInputRef = useRef(null);

    const [profileData, setProfileData] = useState({
        restaurantName: "",
        ownerName: "",
        phoneNumber: "",
        address: "",
        description: "",
        cuisine: "",
        avatar: "",
        banner: "",
        isActive: true,
    });

    const [businessSettings, setBusinessSettings] = useState({
        minimumOrder: "",
        deliveryFee: "",
        preparationTime: "",
    });

    const [notifications, setNotifications] = useState({
        orderNotifications: true,
        emailNotifications: true,
    });

    const [operationalSettings, setOperationalSettings] = useState({
        autoAcceptOrders: false,
        holidayMode: false,
        temporaryClosure: false,
        onlinePayments: true,
        cashOnDelivery: true
    });

    const [security, setSecurity] = useState({
        loginAlerts: true,
    });

    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [pwLoading, setPwLoading] = useState(false);

    const tabs = [
        { id: "profile", label: "Restaurant Profile", icon: "majesticons:user-line" },
        { id: "business", label: "Business Settings", icon: "majesticons:building-line" },
        // { id: "operations", label: "Operations", icon: "majesticons:settings-line" },
        { id: "notifications", label: "Notifications", icon: "majesticons:bell-line" },
        { id: "security", label: "Security", icon: "majesticons:lock-line" },
        // Payment tab hidden for now
    ];

    // Load current vendor profile on mount
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await vendorAuthService.getStatus();
                const v = res?.data?.vendor || {};
                setProfileData(prev => ({
                    ...prev,
                    restaurantName: v.restaurantName || "",
                    ownerName: v.ownerName || "",
                    phoneNumber: v.phoneNumber || "",
                    address: v.address || "",
                    description: v.description || "",
                    cuisine: v.cuisine || "",
                    avatar: v.avatar || "",
                    banner: v.banner || "",
                    isActive: v.isActive !== undefined ? v.isActive : true,
                }));
                setBusinessSettings({
                    minimumOrder: String(v.minimumOrder ?? ""),
                    deliveryFee: String(v.deliveryFee ?? ""),
                    preparationTime: String(v.preparationTime ?? ""),
                });
                setNotifications({
                    orderNotifications: v.orderNotifications !== undefined ? v.orderNotifications : true,
                    emailNotifications: v.emailNotifications !== undefined ? v.emailNotifications : true,
                });
                setSecurity({
                    loginAlerts: v.loginAlerts !== undefined ? v.loginAlerts : true,
                });
            } catch (e) {
                setError(e.message || 'Failed to load settings');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

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

    const handlePasswordSave = async () => {
        try {
            if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
                toast.error('All fields are required');
                return;
            }
            if (pwForm.newPassword.length < 6) {
                toast.error('New password must be at least 6 characters');
                return;
            }
            if (pwForm.newPassword !== pwForm.confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
            setPwLoading(true);
            await vendorAuthService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            toast.success('Password updated');
            setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setShowPasswordDialog(false);
        } catch (e) {
            toast.error(e.message || 'Failed to update password');
        } finally {
            setPwLoading(false);
        }
    };

    // Save handlers
    const saveProfile = async () => {
        try {
            setLoading(true); setError(""); setSuccess("");
            const payload = {
                restaurantName: profileData.restaurantName,
                ownerName: profileData.ownerName,
                phoneNumber: profileData.phoneNumber,
                address: profileData.address,
                description: profileData.description,
                cuisine: profileData.cuisine,
                isActive: profileData.isActive,
            };
            await vendorAuthService.updateProfile(payload);
            setSuccess('Profile updated');
        } catch (e) { setError(e.message || 'Failed to update profile'); }
        finally { setLoading(false); }
    };

    const saveBusiness = async () => {
        try {
            setLoading(true); setError(""); setSuccess("");
            const payload = {
                minimumOrder: businessSettings.minimumOrder ? Number(businessSettings.minimumOrder) : undefined,
                deliveryFee: businessSettings.deliveryFee ? Number(businessSettings.deliveryFee) : undefined,
                preparationTime: businessSettings.preparationTime ? Number(businessSettings.preparationTime) : undefined,
            };
            await vendorAuthService.updateBusinessSettings(payload);
            setSuccess('Business settings updated');
        } catch (e) { setError(e.message || 'Failed to update business settings'); }
        finally { setLoading(false); }
    };

    const saveOperations = async () => {
        try {
            setLoading(true); setError(""); setSuccess("");
            const payload = { ...operationalSettings, ...notifications };
            await vendorAuthService.updateOperationalSettings(payload);
            setSuccess('Operational settings updated');
        } catch (e) { setError(e.message || 'Failed to update operations'); }
        finally { setLoading(false); }
    };

    const uploadBanner = async (file) => {
        if (!file) return;
        try {
            setLoading(true); setError(""); setSuccess("");
            const res = await vendorService.uploadBanner(file);
            const v = res?.data?.vendor;
            setProfileData(prev => ({ ...prev, banner: v?.banner || prev.banner }));
            setSuccess('Banner updated');
        } catch (e) { setError(e.message || 'Failed to upload banner'); }
        finally { setLoading(false); }
    };

    const uploadAvatar = async (file) => {
        if (!file) return;
        const MAX = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX) {
            toast.error('Logo exceeds 2MB limit', 'Upload failed');
            return;
        }
        try {
            setLoading(true); setError(""); setSuccess("");
            const res = await vendorService.uploadAvatar(file);
            const v = res?.data?.vendor;
            setProfileData(prev => ({ ...prev, avatar: v?.avatar || prev.avatar }));
            setSuccess('Logo updated');
        } catch (e) { setError(e.message || 'Failed to upload logo'); }
        finally { setLoading(false); }
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
                            {/* Logo, Banner + Availability */}
                            <div className="space-y-4">
                                {/* Logo */}
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                                        {profileData.avatar ? (
                                            <img src={profileData.avatar} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Icon icon="majesticons:image-line" className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadAvatar(e.target.files?.[0])} />
                                        <Button variant="outlineFade" size="sm" onClick={() => avatarInputRef.current?.click()}>Upload Logo</Button>
                                        <p className="text-xs text-gray-500 mt-1">PNG or JPG up to 2MB</p>
                                    </div>
                                </div>

                                <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative">
                                    {profileData.banner ? (
                                        <img src={profileData.banner} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-500 text-sm flex items-center gap-2"><Icon icon="majesticons:image-line"/> Banner image</div>
                                    )}
                                    <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadBanner(e.target.files?.[0])} />
                                    <Button variant="outlineFade" size="sm" className="absolute bottom-2 right-2" onClick={() => bannerInputRef.current?.click()}>Upload Banner</Button>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Restaurant Availability</h3>
                                        <p className="text-sm text-gray-600">Toggle to set your restaurant online/offline</p>
                                    </div>
                                    <Switch checked={profileData.isActive} onChange={(val) => setProfileData(p => ({...p, isActive: val}))} />
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

                                <FormField label="Phone Number" required>
                                    <Input
                                        value={profileData.phoneNumber}
                                        onChange={(e) => handleProfileUpdate("phoneNumber", e.target.value)}
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

                            {error && <p className="text-sm text-red-600">{error}</p>}
                            {success && <p className="text-sm text-green-600">{success}</p>}
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                                <Button variant="primary" onClick={saveProfile} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
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

                            <FormField label="Average Preparation Time (mins)">
                                <Input
                                    type="number"
                                    value={businessSettings.preparationTime}
                                    onChange={(e) => handleBusinessUpdate("preparationTime", e.target.value)}
                                    placeholder="30"
                                />
                            </FormField>
                            {/* Currency fixed to NGN, Tax rate removed */}
                        </div>
                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button variant="outline" onClick={() => window.location.reload()}>Reset</Button>
                            <Button variant="primary" onClick={saveBusiness} disabled={loading}>{loading ? 'Saving...' : 'Update Settings'}</Button>
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

                            {/* Only order and email notifications remain */}
                            <div className="flex justify-end">
                                <Button variant="primary" onClick={saveOperations} disabled={loading}>{loading ? 'Saving...' : 'Save Preferences'}</Button>
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
                                    <h3 className="font-medium text-gray-900">Login Alerts</h3>
                                    <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                                </div>
                                <Switch
                                    checked={security.loginAlerts}
                                    onChange={() => handleSecurityToggle("loginAlerts")}
                                />
                            </div>

                            {/* Password change would open a separate flow; link retained */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Password</h3>
                                        <p className="text-sm text-gray-600">Keep your account secure by changing your password regularly.</p>
                                    </div>
                                    <Button variant="outlineFade" size="sm" onClick={() => setShowPasswordDialog(true)}>
                                        Change Password
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
                                <p className="text-sm text-red-700 mb-4">
                                    These actions are permanent and cannot be undone
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    <LogoutButton variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" />
                                    <Button variant="outline" size="sm" onClick={async () => { try { await vendorService.deleteVendor(); window.location.href = '/'; } catch (e) { setError(e.message || 'Failed to delete'); }}}>Delete Account</Button>
                                </div>
                            </div>
                        </div>
                    </LargeCard>
                </div>
            )}
            
            {/* Change Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <FormField label="Current Password" required>
                            <Input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Enter current password" />
                        </FormField>
                        <FormField label="New Password" required>
                            <Input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Enter new password" />
                        </FormField>
                        <FormField label="Confirm New Password" required>
                            <Input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Re-enter new password" />
                        </FormField>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)} disabled={pwLoading}>Cancel</Button>
                        <Button variant="primary" onClick={handlePasswordSave} disabled={pwLoading}>{pwLoading ? 'Saving...' : 'Update Password'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Inline password change dialog component usage is above; no export necessary.