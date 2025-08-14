import { Icon } from "@iconify/react";

export function Input({ type = "text", icon, placeholder, className = "", value, onChange, id, name, ...props }) {
    return (
        <div className={`border-2 border-border/20 rounded-md flex items-center gap-3 px-3 py-3 bg-[#FFF] ${className}`}>
            {icon && (
                <div>
                    <Icon icon={icon} className="text-grey-500 size-5 text-black/50" />
                </div>
            )}
            <input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`focus:border-0 focus:outline-0 text-black  text-sm font-medium w-full`}
                {...props}
            />
        </div>
    );
}

export function Form({ onSubmit, className = "", children, ...props }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      className={className}
      {...props}
    >
      {children}
    </form>
  );
}

export function FormItem({ className = "", children }) {
  return <div className={["space-y-2", className].filter(Boolean).join(" ")}>{children}</div>;
}

export function FormLabel({ className = "", children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className={["block text-sm font-medium mb-2", className].filter(Boolean).join(" ")}
    >
      {children}
    </label>
  );
}

export function FormControl({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

export function FormMessage({ className = "", children }) {
  if (!children) return null;
  return (
    <p className={["text-sm text-red-600", className].filter(Boolean).join(" ")}>{children}</p>
  );
}

export function FormField({ label, message, htmlFor, children, className = "" }) {
  return (
    <FormItem className={className}>
      {label ? <FormLabel htmlFor={htmlFor}>{label}</FormLabel> : null}
      <FormControl>{children}</FormControl>
      <FormMessage>{message}</FormMessage>
    </FormItem>
  );
}
