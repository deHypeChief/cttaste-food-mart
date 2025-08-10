import { Link, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

const requestSchema = z.object({ email: z.string().email() })

export const Route = createFileRoute('/auth/forgot-password')({
  beforeLoad: async ({ context }) => {
    const authStatus = await context.auth.authStatus()
    if (authStatus.isAuthenticated) throw redirect({ to: '/overview' })
  },
  component: ForgotPasswordPage
})

function ForgotPasswordPage() {
  const { resetPasswordRequest } = useAuth()
  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' }
  })
  const navigate = useNavigate()

  async function onSubmit(values: z.infer<typeof requestSchema>) {
    await resetPasswordRequest(values)
    navigate({ to: '/auth/reset-password', search: { email: values.email } })
  }

  return (
    <div className="min-h-svh flex items-center justify-center px-4 py-8">
      <div className='w-full max-w-sm space-y-6'>
        <div className='space-y-1 text-center'>
          <h1 className='text-xl font-semibold'>Forgot password</h1>
          <p className='text-sm text-muted-foreground'>Enter your account email to receive a reset code.</p>
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
            <Button type='submit' className='w-full'>Send Code</Button>
          </form>
        </Form>
        <div className='text-xs text-center text-muted-foreground'>
          <Link to='/' className='underline underline-offset-4'>Back to login</Link>
        </div>
      </div>
    </div>
  )
}
