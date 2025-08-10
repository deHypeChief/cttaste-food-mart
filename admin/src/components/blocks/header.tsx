export default function Header({ title, subText, children }: {
    title: string;
    subText?: string;
    children?: React.ReactNode;
}) {
    return (
        <header className="border-b-2 flex items-center mb-6 pt-6 pb-4 px-3 md:pt-8 md:pb-8 md:px-7 ">
            <div className="w-full">
                <div className="flex flex-col md:flex-row justify-between w-full gap-4 md:gap-0">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <h1 className="text-3xl font-medium text-primary">{title || "Admin Dashboard"}</h1>
                            {
                                <p className="opacity-50 max-w-3xs md:text-base md:max-w-full">{subText}</p>
                            }
                        </div>
                    </div>
                    <div className="flex items-center">
                        {children}
                    </div>
                </div>
            </div>
        </header>
    )
}