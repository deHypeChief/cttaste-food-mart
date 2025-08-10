import { IconBell, IconDashboard, IconLock, IconUser } from '@tabler/icons-react'
import { Link, Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import Header from '@/components/blocks/header'
import { pannelData } from '@/utils/configs/pannel.config'
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

export const Route = createFileRoute('/_admin/settings')({
    component: RouteComponent,
})

const data = {
    navMain: [
        {
            title: "General",
            url: "/settings",
            icon: IconDashboard,
        },
        {
            title: "Profile",
            url: "/settings/account",
            icon: IconUser,
        },
        {
            title: "Notifications",
            url: "/settings/notifications",
            icon: IconBell,
        },
        {
            title: "Privacy",
            url: "/settings/privacy",
            icon: IconLock,
        },
    ],
}

function RouteComponent() {
    return (
        <div>
            <Header title='Admin Settings' subText={`Manage all ${pannelData.name.split(" ")[0]} admin-related settings here.`} />
            <div className="grid gap-6 grid-cols-1 md:grid-cols-[280px_1fr]">
                <div className="navRight ml-0 md:ml-4">
                    <SideContent />
                </div>
                <div className="contentLeft">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}


function SideContent() {
    const currentUrl = useLocation()

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {data.navMain.map((item) => (
                        <Link to={item.url} key={item.title}>
                            <SidebarMenuItem >
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    className={currentUrl.pathname === item.url ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : ""}
                                >
                                    <item.icon />
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </Link>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}