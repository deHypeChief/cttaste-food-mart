import { Icon } from '@iconify-icon/react';
import { createFileRoute, redirect } from '@tanstack/react-router'
import { RegisterForm } from '@/components/blocks/register.block'
import { pannelData } from '@/utils/configs/pannel.config';

export const Route = createFileRoute('/auth/registerAdmin')({
    beforeLoad: async ({ context }) => {
        // Access auth from a global import or correct context property
        const authStatus = await context.auth.authStatus()
        if (authStatus.isAuthenticated) {
            throw redirect({ to: '/overview' })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex justify-center gap-2 md:justify-start">
                        <a href="/" className="flex items-center gap-2 font-medium">
                            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
                                <img
                                    src={pannelData.logo}
                                    alt=""
                                    className="invert-100 w-6 h-6 dark:invert-0"
                                />
                            </div>
                            {pannelData.name}
                        </a>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-sm">
                            <RegisterForm />
                        </div>
                    </div>
                </div>
                <div className="bg-muted relative hidden lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Image"
                        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    />
                </div>
            </div>
        </>
    )
}
