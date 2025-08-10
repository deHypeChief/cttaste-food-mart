import { createFileRoute, redirect, Link, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'Code must be 6 digits'),
  newPassword: z.string().min(6, 'Minimum 6 characters')
})

export const Route = createFileRoute('/auth/reset-password')({
  beforeLoad: async ({ context }) => {
    const authStatus = await context.auth.authStatus()
    if (authStatus.isAuthenticated) throw redirect({ to: '/overview' })
  },
  component: ResetPasswordPage
})

function ResetPasswordPage() {
  const search = useSearch({ from: '/auth/reset-password' }) as { email?: string }
  const { resetPasswordConfirm } = useAuth()
  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: search.email || '', otp: '', newPassword: '' }
  })

  async function onSubmit(values: z.infer<typeof resetSchema>) {
    await resetPasswordConfirm(values)
  }

  return (
    <div className='mx-auto max-w-sm py-10 space-y-6'>
      <div className='space-y-1'>
        <h1 className='text-xl font-semibold'>Reset password</h1>
        <p className='text-sm text-muted-foreground'>Enter the 6‑digit code sent to your email and choose a new password.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField name='email' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' placeholder='you@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name='otp' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder='123456' maxLength={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name='newPassword' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type='password' placeholder='New password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type='submit' className='w-full'>Reset Password</Button>
        </form>
      </Form>
      <div className='text-xs text-center text-muted-foreground'>
        <Link to='/' className='underline underline-offset-4'>Back to login</Link>
      </div>
    </div>
  )
}
