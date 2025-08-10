import { ArrowUpDown, CheckCircle2, MoreHorizontal, XCircle } from "lucide-react";
import { format } from "date-fns";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

export type User = {
    username: string;
    verified: boolean;
    phoneNumber: string;
    dateOfBirth: string;
    sessionClientId: {
        email: string;
        fullName: string;
    }
}

const UserActionsColumn = {
    id: "actions",
    cell: ({ row }) => {
        const user = row.original
        const [open, setOpen] = useState(false)

        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() =>
                                navigator.clipboard.writeText(user.sessionClientId?.email || "")
                            }
                        >
                            Copy customer email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setOpen(true)}>
                            View customer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Customer Info Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-md sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Customer Information</DialogTitle>
                        </DialogHeader>

                        <div className="flex items-center gap-4 mt-4">
                            <Avatar  className="w-16 h-16 rounded-full ring-2 ring-muted shadow-sm overflow-hidden">
                                <AvatarImage src={user.sessionClientId.profile} alt={user.sessionClientId.fullName} />
                                <AvatarFallback className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground font-medium text-lg">
                                    {user.sessionClientId.fullName
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-lg font-semibold">{user.fullName}</h2>
                                <p className="text-sm text-muted-foreground">{user.sessionClientId?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm">
                            <div>
                                <span className="font-medium text-muted-foreground">Full Name</span>
                                <p>{user.sessionClientId.fullName}</p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Username</span>
                                <p>{user.username}</p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Phone</span>
                                <p>{user.phoneNumber}</p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">DOB</span>
                                <p>{new Date(user.dateOfBirth).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Gender</span>
                                <p className="capitalize">{user.gender || "N/A"}</p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Verified</span>
                                <p>{user.sessionClientId?.isEmailVerified ? "Yes ✅" : "No ❌"}</p>
                            </div>
                            <div className="col-span-full">
                                <span className="font-medium text-muted-foreground">Joinded On</span>
                                <p>{new Date(user.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        )
    },
}

export const userColumns = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "fullname",
        header: ({ column }: { column: any }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Full Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        accessorKey: 'sessionClientId.fullName',
        cell: ({ getValue }: { getValue: any }) => (
            <div className="px-4 py-2">
                {getValue()}
            </div>
        ),
    },
    {
        header: () => (
            <div className="px-4 py-2">
                Username
            </div>
        ),
        accessorKey: 'username',
        cell: ({ getValue }: { getValue: any }) => (
            <div className="px-4 py-2">
                {getValue()}
            </div>
        ),
    },
    {
        accessorFn: (row: any) => row.sessionClientId?.isEmailVerified,
        header: "Verified",
        cell: ({ row }) => {
            const isVerified = row.original.sessionClientId?.isEmailVerified;

            return (
                <Badge
                    variant="outline"
                    className={`px-2 gap-1 items-center ${isVerified
                        ? "text-green-600 border-green-300 dark:text-green-400"
                        : "text-red-600 border-red-300 dark:text-red-400"
                        }`}
                >
                    {isVerified ? (
                        <CheckCircle2 className="w-4 h-4" />
                    ) : (
                        <XCircle className="w-4 h-4" />
                    )}
                    {isVerified ? "Yes" : "No"}
                </Badge>
            );
        },
    },
    {
        id: "email",
        header: () => (
            <div className="px-4 py-2">
                Email
            </div>
        ),
        accessorKey: 'sessionClientId.email',
        cell: ({ getValue }: { getValue: any }) => (
            <div className="px-4 py-2">
                {getValue()}
            </div>
        ),
    },
    {
        header: () => (
            <div className="px-4 py-2">
                Phone Number
            </div>
        ),
        accessorKey: 'phoneNumber',
        cell: ({ getValue }: { getValue: any }) => (
            <div className="px-4 py-2">
                {getValue()}
            </div>
        ),
    },
    {
        header: () => (
            <div className="px-4 py-2">
                Date of Birth
            </div>
        ),
        accessorKey: 'dateOfBirth',
        cell: ({ getValue }: { getValue: () => string | Date }) => {
            const rawValue = getValue();
            const date = new Date(rawValue);

            let formatted = 'Invalid date';
            if (!isNaN(date.getTime())) {
                formatted = format(date, "dd MMM yyyy"); // e.g., "16 Jun 2025"
            }

            return (
                <div className="px-4 py-2">
                    {formatted}
                </div>
            );
        },
    },
    UserActionsColumn
]


