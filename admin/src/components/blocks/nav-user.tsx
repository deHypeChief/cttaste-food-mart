import { Link, useNavigate  } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
	IconCreditCard,
	IconDotsVertical,
	IconLogout,
	IconNotification,
	IconUserCircle,
} from "@tabler/icons-react"

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"

export function NavUser() {
	const { isMobile } = useSidebar()
	const navigate = useNavigate()

	const { authStatus, logout } = useAuth()

	const { data: adminData } = useQuery({
		queryKey: ["AdminData"],
		queryFn: async () => {
			return await authStatus()
		},
	})

	async function handleLogout() {
		await logout()
		console.log("Logging out...")
		navigate({ to: "/" })
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg grayscale">
								<AvatarImage src={"avatar"} alt={adminData?.fullName} />
								<AvatarFallback className="rounded-lg">
									{
										adminData?.fullName?.split(" ")
											.map((n: string) => n[0])
											.join("")
											.toUpperCase()
											.slice(0, 2)
									}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{adminData?.fullName}</span>
								<span className="text-muted-foreground truncate text-xs">
									{adminData?.email}
								</span>
							</div>
							<IconDotsVertical className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={"avatar"} alt={adminData?.fullName} />
									<AvatarFallback className="rounded-lg">
										{
											adminData?.fullName?.split(" ")
												.map((n: string) => n[0])
												.join("")
												.toUpperCase()
												.slice(0, 2)
										}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{adminData?.fullName}</span>
									<span className="text-muted-foreground truncate text-xs">
										{adminData?.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<Link to='/settings/account'>
								<DropdownMenuItem>
									<IconUserCircle />
									Account
								</DropdownMenuItem>
							</Link>
							<DropdownMenuItem>
								<IconCreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<IconNotification />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<IconLogout />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
