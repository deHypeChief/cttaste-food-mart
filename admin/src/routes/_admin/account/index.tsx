import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/account/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/account/"!</div>
}
