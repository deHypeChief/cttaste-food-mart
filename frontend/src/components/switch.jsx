import { useEffect, useState } from "react";

export default function Switch({
    checked = false,
    onChange,
    disabled = false,
    size = "md",
    className = "",
    ...props
}) {
    const [isChecked, setIsChecked] = useState(checked);

    // Keep internal state in sync with incoming prop changes
    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    const handleToggle = () => {
        if (disabled) return;
        const newValue = !isChecked;
        setIsChecked(newValue);
        onChange?.(newValue);
    };

    const sizeClasses = {
        sm: "w-10 h-5",
        md: "w-14 h-7",
        lg: "w-18 h-9"
    };

    const thumbSizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-7 h-7"
    };

    const translateClasses = {
        sm: isChecked ? "translate-x-6" : "translate-x-0.5",
        md: isChecked ? "translate-x-8" : "translate-x-0.5",
        lg: isChecked ? "translate-x-10" : "translate-x-1"
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className={`
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 py-4
        ${isChecked ? "bg-orange-500" : "bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${sizeClasses[size]}
        ${className}
      `}
            {...props}

        >
            <span
                className={`
          inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out
          ${thumbSizeClasses[size]}
          ${translateClasses[size]}
        `}
            />
            
            <span className="sr-only">Toggle switch</span>
        </button>
    );
}
