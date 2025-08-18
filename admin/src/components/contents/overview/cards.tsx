import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Endpoint from "@/api/endpoints";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function OverviewCards() {
    const { data: users } = useQuery({ queryKey: ["users-analytics"], queryFn: Endpoint.getUsers });
    const { data: vendors } = useQuery({ queryKey: ["vendors-analytics"], queryFn: Endpoint.getVendorsAnalytics });

    const userStats = users?.data || {};
    const vendorStats = vendors?.data || {};

    const isUserUp = (userStats.trendingChange ?? 0) >= 0;
    const isVendorUp = (vendorStats.trendingChange ?? 0) >= 0;

    return (
        <div className="flex flex-wrap gap-4">
            <Card className="@container/card flex-1 min-w-[250px] max-w-full">
                <CardHeader>
                    <CardDescription>Total Users</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {userStats.totalUsers ?? 0}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {isUserUp ? <IconTrendingUp /> : <IconTrendingDown />}
                            {(userStats.trendingChange ?? 0).toFixed?.(1) ?? userStats.trendingChange ?? 0}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending {isUserUp ? 'up' : 'down'} this month {isUserUp ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                    </div>
                    <div className="text-muted-foreground">New customers in total</div>
                </CardFooter>
            </Card>

            <Card className="@container/card flex-1 min-w-[250px] max-w-full">
                <CardHeader>
                    <CardDescription>Total Vendors</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {vendorStats.totalVendors ?? 0}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {isVendorUp ? <IconTrendingUp /> : <IconTrendingDown />}
                            {(vendorStats.trendingChange ?? 0).toFixed?.(1) ?? vendorStats.trendingChange ?? 0}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Approved: {vendorStats.approvedVendors ?? 0} • Pending: {vendorStats.pendingVendors ?? 0}
                    </div>
                    <div className="text-muted-foreground">Marketplace supply</div>
                </CardFooter>
            </Card>

            <Card className="@container/card flex-1 min-w-[250px] max-w-full">
                <CardHeader>
                    <CardDescription>Active Vendors</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {vendorStats.activeVendors ?? 0}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">This month: {vendorStats.thisMonthVendors ?? 0}</Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Last month: {vendorStats.lastMonthVendors ?? 0}
                    </div>
                    <div className="text-muted-foreground">Growth of seller base</div>
                </CardFooter>
            </Card>
        </div>
    );
}