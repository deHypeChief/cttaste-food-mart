import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Box, BoxFooter, BoxHeader, BoxSubText, BoxTitle } from '@/components/blocks/box.block'
import { ModeToggleText } from '@/components/blocks/mode-toggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/_admin/settings/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { logout } = useAuth()

	const navigate = useNavigate()

	async function handleLogout() {
		await logout()
		console.log("Logging out...")
		navigate({ to: "/" })
	}
	return (

		<div className="space-y-10">
			<Box>
				<BoxHeader>
					<BoxTitle>Change Theme</BoxTitle>
					<BoxSubText>Use the options below to change the appearance of the admin dashboard.</BoxSubText>
				</BoxHeader>
				<BoxFooter
					moreInfo='The modes avalible are system light and dark'
					action={<ModeToggleText />}
				/>
			</Box>
			<Box>
				<BoxHeader>
					<BoxTitle>Logout Admin</BoxTitle>
					<BoxSubText>Click the button below to log out of the admin dashboard.</BoxSubText>
				</BoxHeader>
				<BoxFooter
					moreInfo='Make sure to save as this session would be lost'
					action={
						<Button variant="destructive" onClick={handleLogout}>
							Logout
						</Button>
					}
				/>
			</Box>
		</div>
	)
}
