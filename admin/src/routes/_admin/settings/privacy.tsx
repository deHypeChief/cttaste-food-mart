import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/settings/privacy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/settings/privacy"!</div>
}
