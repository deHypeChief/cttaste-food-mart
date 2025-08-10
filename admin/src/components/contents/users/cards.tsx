import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type UserStats = {
    totalUsers: number;
    thisMonthUsers: number;
    lastMonthUsers: number;
    verifiedUsers: number;
    referralUsers: number;
    trendingChange: number;
};

export function UserCards({ stats }: { stats: UserStats }) {
    const isTrendingUp = stats.trendingChange >= 0;

    return (
        <div className="flex flex-wrap gap-4">
            {/* Total Users */}
            <Card className="@container/card flex-2 min-w-[250px] max-w-full">
                <CardHeader>
                    <CardDescription>Total Users</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.totalUsers.toLocaleString()}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {isTrendingUp ? <IconTrendingUp /> : <IconTrendingDown />}
                            {stats.trendingChange.toFixed(1)}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending {isTrendingUp ? "up" : "down"} this month{" "}
                        {isTrendingUp ? (
                            <IconTrendingUp className="size-4 text-green-600" />
                        ) : (
                            <IconTrendingDown className="size-4 text-red-600" />
                        )}
                    </div>
                    <div className="text-muted-foreground">New customers in total</div>
                </CardFooter>
            </Card>

            {/* This Month's Users */}
            <Card className="@container/card flex-1 min-w-[250px] max-w-full">
                <CardHeader>
                    <CardDescription>This Month</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.thisMonthUsers.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Compared to {stats.lastMonthUsers} last month
                    </div>
                    <div className="text-muted-foreground">New users this month</div>
                </CardFooter>
            </Card>

            {/* Verified Users */}
            <Card className="@container/card flex-1 min-w-[250px] max-w-full">
                <CardHeader>
                    <CardDescription>Verified Users</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.verifiedUsers.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Email verified accounts
                    </div>
                    <div className="text-muted-foreground">Ensures real userbase</div>
                </CardFooter>
            </Card>
        </div>
    );
}
