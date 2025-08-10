import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { UserCards } from '@/components/contents/users/cards'
import UserTable from '@/components/contents/users/dataTable'
import Header from '@/components/blocks/header'
import { Button } from '@/components/ui/button'
import Endpoint from '@/api/endpoints'
import { Skeleton } from '@/components/ui/skeleton'
import { userColumns } from '@/components/contents/users/columns'

export const Route = createFileRoute('/_admin/users')({
    component: RouteComponent,
})


function RouteComponent() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["users-analytics"],
        queryFn: Endpoint.getUsers,
    });

    const header = (
        <Header title="User Analytics" subText="Manage and analyze user data">
            {/* <Button>Create User</Button> */}
        </Header>
    );

    if (isError) {
        return (
            <>
                {header}
                <div className="text-red-500">Failed to load user data.</div>
            </>
        );
    }

    if (isLoading || !data?.data) {
        return (
            <>
                {header}
                <div className=" space-y-6">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </>
        );
    }

    const {
        users,
        totalUsers,
        verifiedUsers,
        referralUsers,
        thisMonthUsers,
        lastMonthUsers,
        trendingChange,
    } = data.data;

    return (
        <>
            {header}
            <UserCards
                stats={{
                    totalUsers,
                    verifiedUsers,
                    referralUsers,
                    thisMonthUsers,
                    lastMonthUsers,
                    trendingChange,
                }}
            />
            <UserTable data={users} columns={userColumns} />
        </>
    );
}


