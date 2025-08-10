import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import * as TanStackQueryProvider from './utils/integrations/tanstack-query/root-provider.tsx'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './assets/styles/global.css'
import { useAuth } from './hooks/use-auth.ts'


// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProvider.getContext(),
    auth: undefined!
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
  // Extend the context type to include 'auth'
  interface RouterContext {
    auth: ReturnType<typeof useAuth>;
  }
}

function AppRouter() {
  const auth = useAuth();

  return (
    <RouterProvider router={router} context={{ ...TanStackQueryProvider.getContext(), auth }} />
  )
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider>
        <AppRouter />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}

