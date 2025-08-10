import { Link, useLocation, useNavigate } from "@tanstack/react-router"


import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "lucide-react"
import { useEffect, useState } from "react"
import type { ParsedLocation } from "@tanstack/react-router";
import type { Icon } from "@tabler/icons-react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
    items,
    comand,
    ...props
}: {
    comand: Array<{
        title: string;
        url: string;
        icon: Icon;
    }>
    items: Array<{
        title: string;
        url: string;
        icon: Icon;
    }>
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {

    const currentUrl = useLocation()

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        item.title === "Search" ? (
                            <Search key={item.title} comand={comand} item={item} currentUrl={currentUrl} />
                        ) : (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild
                                    tooltip={item.title}
                                    className={currentUrl.pathname.includes(item.url) ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : ""}
                                    aria-current={currentUrl.pathname === item.url ? "page" : undefined}
                                >
                                    <Link to={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup >
    )
}


export function Search({ comand, item, currentUrl }: {
    item: {
        title: string;
        url: string;
        icon: Icon;
    }
    comand: Array<{
        title: string;
        url: string;
        icon: Icon;
    }>
    currentUrl: ParsedLocation<{}>
}) {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "q" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
            if (e.key.toLowerCase() === "p" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                // Navigate directly to account settings
                navigate({ to: "/settings/account" })
                setOpen(false)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])
    return (
        <>
            <SidebarMenuItem key={item.title} >
                <SidebarMenuButton asChild
                    tooltip={item.title}
                    className={currentUrl.pathname.includes(item.url) ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : ""}
                    aria-current={currentUrl.pathname === item.url ? "page" : undefined}
                    onClick={() => { setOpen((prev) => !prev) }}
                >
                    <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>

                        <p className="text-muted-foreground text-sm float-right">
                            Press{" "}
                            <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                                <span className="text-xs">Ctrl</span>Q
                            </kbd>
                        </p>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>


            <CommandDialog open={open} onOpenChange={setOpen} className="rounded-lg border shadow-md md:min-w-[450px]">
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Pages">
                        {comand.map((c) => (
                            <CommandItem
                                key={c.url}
                                // Close dialog when a page is selected
                                onSelect={() => setOpen(false)}
                            >
                                <Link to={c.url} className="flex items-center gap-2">
                                    <c.icon />
                                    <span>{c.title}</span>
                                </Link>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />

                    <CommandGroup heading="Settings">
                        <CommandItem
                            onSelect={() => {
                                navigate({ to: "/settings/account" })
                                setOpen(false)
                            }}
                        >
                            <Link to="/settings/account" className="flex items-center gap-2 flex-1">
                                <User />
                                <span>Profile</span>
                            </Link>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}