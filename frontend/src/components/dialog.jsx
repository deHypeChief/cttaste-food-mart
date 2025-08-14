import React, { createContext, useContext, useState } from "react";
import { Icon } from "@iconify/react";

// Dialog Context
const DialogContext = createContext({});

// Main Dialog component (provider)
export function Dialog({ children, open, onOpenChange }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (newOpen) => {
        if (onOpenChange) {
            onOpenChange(newOpen);
        } else {
            setIsOpen(newOpen);
        }
    };

    const contextValue = {
        open: open !== undefined ? open : isOpen,
        onOpenChange: handleOpenChange,
    };

    return (
        <DialogContext.Provider value={contextValue}>
            {children}
        </DialogContext.Provider>
    );
}

// Dialog Trigger component
export function DialogTrigger({ children, asChild }) {
    const { onOpenChange } = useContext(DialogContext);

    const handleClick = () => {
        onOpenChange(true);
    };

    if (asChild) {
        return React.cloneElement(children, {
            onClick: handleClick,
        });
    }

    return (
        <button onClick={handleClick} type="button">
            {children}
        </button>
    );
}

// Dialog Overlay
function DialogOverlay({ className = "", ...props }) {
    return (
        <div
            className={`fixed inset-0 h-screen z-[10000] bg-black/50 backdrop-blur-sm transition-opacity ${className}`}
            {...props}
        />
    );
}

// Dialog Content component
export function DialogContent({
    children,
    className = "",
    showCloseButton = true,
    onEscapeKeyDown,
    onInteractOutside,
    ...props
}) {
    const { open, onOpenChange } = useContext(DialogContext);

    const handleClose = () => {
        onOpenChange(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            if (onEscapeKeyDown) {
                onEscapeKeyDown(e);
            } else {
                handleClose();
            }
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            if (onInteractOutside) {
                onInteractOutside(e);
            } else {
                handleClose();
            }
        }
    };

    if (!open) return null;

    return (
        <>
            <DialogOverlay onClick={handleOverlayClick} />
            <div
                className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                onKeyDown={handleKeyDown}
                onClick={handleOverlayClick}
            >
                <div
                    className={`relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg transition-all duration-200 animate-in fade-in-0 zoom-in-95 ${className}`}
                    {...props}
                >
                    {showCloseButton && (
                        <button
                            onClick={handleClose}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            aria-label="Close"
                        >
                            <Icon icon="lucide:x" className="h-4 w-4" />
                        </button>
                    )}
                    {children}
                </div>
            </div>
        </>
    );
}

// Dialog Header component
export function DialogHeader({ className = "", children, ...props }) {
    return (
        <div
            className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

// Dialog Title component
export function DialogTitle({ className = "", children, ...props }) {
    return (
        <h2
            className={`text-lg font-semibold leading-none tracking-tight ${className}`}
            {...props}
        >
            {children}
        </h2>
    );
}

// Dialog Description component
export function DialogDescription({ className = "", children, ...props }) {
    return (
        <p
            className={`text-sm text-muted-foreground ${className}`}
            {...props}
        >
            {children}
        </p>
    );
}

// Dialog Footer component
export function DialogFooter({ className = "", children, ...props }) {
    return (
        <div
            className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

// Dialog Close component (for custom close buttons)
export function DialogClose({ children, asChild, ...props }) {
    const { onOpenChange } = useContext(DialogContext);

    const handleClick = () => {
        onOpenChange(false);
    };

    if (asChild) {
        return React.cloneElement(children, {
            onClick: handleClick,
            ...props,
        });
    }

    return (
        <button onClick={handleClick} type="button" {...props}>
            {children}
        </button>
    );
}