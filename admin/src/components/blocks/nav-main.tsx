import { Link, useLocation } from "@tanstack/react-router"
import type { Icon } from "@tabler/icons-react"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
    items,
}: {
    items: Array<{
        title: string
        url: string
        icon?: Icon
    }>
}) {
    const currentUrl = useLocation()

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => (
                        <Link to={item.url} key={item.title}>
                            <SidebarMenuItem >
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    className={currentUrl.pathname === item.url ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : ""}
                                    aria-current={currentUrl.pathname === item.url ? "page" : undefined}
                                >
                                    {item.icon && <item.icon />}
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
