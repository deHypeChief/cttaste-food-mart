import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { Toaster } from 'sonner'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/blocks/theme-provider'

interface MyRouterContext {
  queryClient: QueryClient
  auth: { authStatus: () => Promise<{ isAuthenticated: boolean }> }
}

const queryClient = new QueryClient()

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Toaster richColors  />
          <Outlet />
        </QueryClientProvider>
      </ThemeProvider>
    </>
  ),
})
