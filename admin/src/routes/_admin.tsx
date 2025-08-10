import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AppSidebar } from '@/components/blocks/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/blocks/site-header'

export const Route = createFileRoute('/_admin')({
	beforeLoad: async ({ context }) => {
		const authStatus = await context.auth.authStatus()
		if (!authStatus.isAuthenticated) {
			throw redirect({ to: '/' })
		}
	},
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<div className="flex flex-col gap-6 mx-4 sm:mx-6 md:mx-6">
							<Outlet />
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}


