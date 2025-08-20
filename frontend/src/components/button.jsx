import { Icon } from "@iconify/react";

const VARIANTS = {
    primary: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-primary text-primary hover:bg-primary/10",
    outlineFade: "border-2 border-border/20 hover:bg-primary/10 hover:text-black bg-white text-black/60",
    ghost: "bg-transparent text-primary hover:bg-primary/10",
};

const SIZES = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-xs md:text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
};

export default function Button({
    children,
    onClick,
    icon,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    fullWidth = false,
    iconPosition = "left",
    className = "",
    type = "button",
    ...props
}) {
    const isIconOnly = size === "icon" && !children;
    const variantClasses = VARIANTS[variant] ?? VARIANTS.primary;
    const sizeClasses = SIZES[size] ?? SIZES.md;
    const widthClasses = fullWidth ? "w-full" : "";
    const baseClasses =
        "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 text-center";

    const composedClassName = [
        baseClasses,
        variantClasses,
        sizeClasses,
        widthClasses,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            onClick={onClick}
            className={composedClassName}
            disabled={disabled || loading}
            {...props}
        >
            <div className="flex items-center gap-2">
                {icon && iconPosition === "left" && (
                    <Icon icon={icon} className="size-5" />
                )}
                {loading && (
                    <Icon
                        icon="svg-spinners:90-ring-with-bg"
                        className="size-5"
                    />
                )}
                {children && (
                    <span className={isIconOnly ? "sr-only" : ""}>{children}</span>
                )}
                {icon && iconPosition === "right" && (
                    <Icon icon={icon} className="size-5" />
                )}
            </div>
        </button>
    );
}