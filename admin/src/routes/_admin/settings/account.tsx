import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { Box, BoxContent, BoxFooter, BoxHeader, BoxSubText, BoxTitle } from '@/components/blocks/box.block';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export const Route = createFileRoute('/_admin/settings/account')({
	component: RouteComponent,
})

const passwordSchema = z.object({
	currentPassword: z.string().min(6),
	newPassword: z.string().min(6),
	confirmNewPassword: z.string().min(6)
}).refine(d => d.newPassword === d.confirmNewPassword, { path: ['confirmNewPassword'], message: 'Passwords do not match' })

type PasswordForm = z.infer<typeof passwordSchema>

function RouteComponent() {
	const { authStatus, updatePassword } = useAuth()

	const { data: adminData } = useQuery({
		queryKey: ["AdminData"],
		queryFn: async () => {
			return await authStatus()
		},
	})
	const form = useForm<PasswordForm>({
		resolver: zodResolver(passwordSchema),
		defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' }
	})

	const { mutateAsync: changePasswordMutation, isPending } = useMutation({
		mutationFn: async (values: PasswordForm) => {
			await updatePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
			form.reset()
		}
	})

	async function onSubmit(values: PasswordForm) {
		await changePasswordMutation(values)
	}

	return (
		<div className="space-y-10">
			<Box>
				<BoxHeader>
					<div className="flex justify-between flex-col gap-6 md:flex-row">
						<div>
							<BoxTitle>Admin Avatar</BoxTitle>
							<BoxSubText>Change your admin name here. Click the profile section to add an image</BoxSubText>
						</div>
						<div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold dark:text-black">
							{
								adminData?.fullName?.split(" ")
									.map((n: string) => n[0])
									.join("")
									.toUpperCase()
									.slice(0, 2)
							}
						</div>
					</div>
				</BoxHeader>
				<BoxFooter
					moreInfo='Make sure to save as this session would be lost'
				/>
			</Box>

			<Box>
				<BoxHeader>
					<BoxTitle>Admin Name</BoxTitle>
					<BoxSubText>Change your admin name here. Click the profile section to add an image</BoxSubText>
				</BoxHeader>
				<BoxContent>
					<div className="max-w-lg md:w-lg">
						<Input placeholder={
							adminData?.fullName
						} />
					</div>
				</BoxContent>
				<BoxFooter
					moreInfo='Please use 32 characters at maximum.'
					action={<Button>Update</Button>}
				/>
			</Box>

			<Box>
				<BoxHeader>
					<BoxTitle>Change Password</BoxTitle>
					<BoxSubText>Update your password. You will use this next time you log in.</BoxSubText>
				</BoxHeader>
				<BoxContent>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
						<div className="space-y-2">
							<label className="text-sm font-medium">Current Password</label>
							<Input type="password" placeholder="Current password" {...form.register('currentPassword')} />
							{form.formState.errors.currentPassword && <p className="text-xs text-red-500">{form.formState.errors.currentPassword.message}</p>}
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">New Password</label>
							<Input type="password" placeholder="New password" {...form.register('newPassword')} />
							{form.formState.errors.newPassword && <p className="text-xs text-red-500">{form.formState.errors.newPassword.message}</p>}
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Confirm New Password</label>
							<Input type="password" placeholder="Confirm new password" {...form.register('confirmNewPassword')} />
							{form.formState.errors.confirmNewPassword && <p className="text-xs text-red-500">{form.formState.errors.confirmNewPassword.message}</p>}
						</div>
						<div className="pt-2">
							<Button type="submit" disabled={isPending}>{isPending ? 'Updating...' : 'Change Password'}</Button>
						</div>
					</form>
				</BoxContent>
				<BoxFooter moreInfo='Use at least 6 characters. Avoid reused passwords.'/>
			</Box>
		</div>
	);
}
