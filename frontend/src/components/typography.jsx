export function H1({children, className}) {
    return(
        <h1 className={`${className} font-semibold text-xl md:text-4xl`}>{children}</h1>
    )
}