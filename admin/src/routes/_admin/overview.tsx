import { createFileRoute } from '@tanstack/react-router'
import { OverviewCards } from '@/components/contents/overview/cards'
import Header from '@/components/blocks/header'
import { pannelData } from '@/utils/configs/pannel.config'

export const Route = createFileRoute('/_admin/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Header
        title={`${pannelData.name.split(" ")[0]} Overview`}
        subText={`Welcome to the ${pannelData.name.split(" ")[0]} admin overview.`}
      />
      <OverviewCards />
    </>
  )
}
