import { t } from 'elysia'

export const VendorValidator = {
    create: {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 8 }),
            fullName: t.String(),
            restaurantName: t.String({ minLength: 2 }),
            phoneNumber: t.String(),
            location: t.String(),
            address: t.String(),
            vendorType: t.String(),
            profile: t.Optional(t.String()),
            description: t.Optional(t.String()),
            cuisine: t.Optional(t.String())
        }),
        response: t.Optional(
            t.Object({
                success: t.Boolean(),
                message: t.String(),
                data: t.Object({
                    vendor: t.Object({
                        sessionClientId: t.String(),
                        restaurantName: t.String(),
                        phoneNumber: t.String(),
                        location: t.String(),
                        address: t.String(),
                        vendorType: t.String(),
                        _id: t.String(),
                        createdAt: t.String({ format: 'date-time' }),
                        updatedAt: t.String({ format: 'date-time' }),
                        __v: t.Number()
                    })
                })
            })
        ),
        detail: {
            tags: ['Vendor']
        }
    },
    login: {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String()
        }),
        response: t.Optional(
            t.Object({
                success: t.Boolean(),
                message: t.String(),
                data: t.Object({
                    vendor: t.Object({
                        _id: t.String(),
                        sessionClientId: t.String(),
                        restaurantName: t.String(),
                        phoneNumber: t.String(),
                        location: t.String(),
                        address: t.String(),
                        vendorType: t.String(),
                        isApproved: t.Boolean(),
                        isActive: t.Boolean()
                    })
                })
            })
        ),
        detail: {
            tags: ['Vendor']
        }
    },
    updateProfile: {
        body: t.Object({
            restaurantName: t.Optional(t.String()),
            ownerName: t.Optional(t.String()),
            phoneNumber: t.Optional(t.String()),
            location: t.Optional(t.String()),
            address: t.Optional(t.String()),
            description: t.Optional(t.String()),
            cuisine: t.Optional(t.String()),
            avatar: t.Optional(t.String()),
            banner: t.Optional(t.String()),
            isActive: t.Optional(t.Boolean())
        }),
        detail: {
            tags: ['Vendor']
        }
    },
    updateBusinessSettings: {
        body: t.Object({
            minimumOrder: t.Optional(t.Number()),
            deliveryFee: t.Optional(t.Number()),
            deliveryLocations: t.Optional(t.Array(t.Object({ location: t.String(), price: t.Number() }))),
            preparationTime: t.Optional(t.Number()),
            // Currency stays default NGN; taxRate removed from UI but kept optional for compatibility
            currency: t.Optional(t.String()),
            taxRate: t.Optional(t.Number()),
            pricePerPack: t.Optional(t.Number())
        }),
        detail: {
            tags: ['Vendor']
        }
    },
    updateOperationalSettings: {
        body: t.Object({
            autoAcceptOrders: t.Optional(t.Boolean()),
            holidayMode: t.Optional(t.Boolean()),
            temporaryClosure: t.Optional(t.Boolean()),
            onlinePayments: t.Optional(t.Boolean()),
            cashOnDelivery: t.Optional(t.Boolean()),
            // Notifications can also be updated here or via a dedicated route
            orderNotifications: t.Optional(t.Boolean()),
            emailNotifications: t.Optional(t.Boolean()),
            loginAlerts: t.Optional(t.Boolean())
        }),
        detail: {
            tags: ['Vendor']
        }
    },
    updateWorkingHours: {
        body: t.Object({
            workingHours: t.Record(
                t.String(),
                t.Object({
                    isOpen: t.Boolean(),
                    startTime: t.String(),
                    closingTime: t.String()
                })
            )
        }),
        detail: {
            tags: ['Vendor']
        }
    },
    authStatus: {
        response: t.Optional(
            t.Object({
                success: t.Boolean(),
                message: t.String(),
                data: t.Object({
                    isAuthenticated: t.Boolean(),
                    session: t.Object({
                        _id: t.String(),
                        email: t.String(),
                        fullName: t.String(),
                        role: t.Array(t.String())
                    }),
                    vendor: t.Object({
                        _id: t.String(),
                        restaurantName: t.String(),
                        location: t.String(),
                        isApproved: t.Boolean(),
                        isActive: t.Boolean()
                    })
                })
            })
        ),
        detail: {
            tags: ['Vendor']
        }
    }
}
