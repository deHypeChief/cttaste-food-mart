
export function Box({
    children
}: {
    children?: any,

}) {
    return (
        <div className="border-2 rounded-lg overflow-hidden">
            <div>

                {children}
            </div>
        </div >
    )
}

export function BoxHeader({ children }: { children: any }) {
    return (
        <>
            <div className="px-4 pt-8 pb-0 md:px-6 md:pt-8">
                {children}
            </div>
        </>
    )
}

export function BoxTitle({ children }: { children: any }) {
    return (
        <h1 className="text-lg font-semibold">{children}</h1>
    )
}

export function BoxSubText({ children }: { children: any }) {
    return (
        <p className="mt-1 opacity-50 ">{children}</p>
    )
}

export function BoxContent({ children }: { children: any }) {
    return (
        <>
            <div className=" px-4 pt-6 md:px-6 md:pt-6">
                {children}
            </div>
        </>
    )
}

export function BoxFooter({ moreInfo, action }: { moreInfo: string, action?: any }) {
    return (
        <>
            <div className="flex-col items-center gap-4 md:flex-row bg-gray-300/10 mt-6 px-6 pt-3 pb-3 flex justify-between">
                <p className="opacity-50">{moreInfo || ""}</p>
                {action}
            </div>
        </>
    )
}