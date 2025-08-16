import { useState, useEffect, createContext, useContext } from 'react';
import { Icon } from '@iconify/react';

const TOAST_TYPES = {
    success: {
        icon: 'solar:check-circle-bold',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        iconColor: 'text-green-500'
    },
    error: {
        icon: 'solar:close-circle-bold',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        iconColor: 'text-red-500'
    },
    warning: {
        icon: 'solar:info-circle-bold',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        iconColor: 'text-yellow-500'
    },
    info: {
        icon: 'solar:info-circle-bold',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        iconColor: 'text-blue-500'
    }
};

const ToastContext = createContext();

// Individual Toast Component
function Toast({ toast, onRemove }) {
    const typeConfig = TOAST_TYPES[toast.type] || TOAST_TYPES.info;

    useEffect(() => {
        if (toast.duration > 0) {
            const timer = setTimeout(() => {
                onRemove(toast.id);
            }, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div className={`
            flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm
            ${typeConfig.bg} ${typeConfig.border} ${typeConfig.text}
            animate-in slide-in-from-right-full duration-300
            max-w-md w-full
        `}>
            <Icon 
                icon={typeConfig.icon} 
                className={`size-5 mt-0.5 flex-shrink-0 ${typeConfig.iconColor}`} 
            />
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <p className="font-semibold text-sm mb-1">
                        {toast.title}
                    </p>
                )}
                <p className="text-sm opacity-90">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className={`
                    flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors
                    ${typeConfig.text}
                `}
            >
                <Icon icon="solar:close-linear" className="size-4" />
            </button>
        </div>
    );
}

// Toast Container
function ToastContainer({ toasts, onRemove }) {
    return (
        <div className="fixed top-4 right-4 z-[12000] space-y-3 pointer-events-none">
            <div className="space-y-3 pointer-events-auto">
                {toasts.map((toast) => (
                    <Toast 
                        key={toast.id} 
                        toast={toast} 
                        onRemove={onRemove} 
                    />
                ))}
            </div>
        </div>
    );
}

// Toast Provider Component
function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    let toastId = 0;

    const addToast = ({ 
        message, 
        title, 
        type = 'info', 
        duration = 5000 
    }) => {
        const id = ++toastId;
        const toast = { id, message, title, type, duration };
        
        setToasts(prev => [...prev, toast]);
        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const clearToasts = () => {
        setToasts([]);
    };

    // Convenience methods
    const toast = {
        success: (message, title) => addToast({ message, title, type: 'success' }),
        error: (message, title) => addToast({ message, title, type: 'error' }),
        warning: (message, title) => addToast({ message, title, type: 'warning' }),
        info: (message, title) => addToast({ message, title, type: 'info' }),
        custom: addToast
    };

    return (
        <ToastContext.Provider value={{ 
            toast, 
            removeToast, 
            clearToasts 
        }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// Hook to use toast - defined here to avoid fast refresh issues
function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { ToastProvider, useToast };
export default ToastProvider;
