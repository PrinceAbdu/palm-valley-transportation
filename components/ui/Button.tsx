import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'md',
        isLoading,
        icon,
        iconPosition = 'left',
        children,
        disabled,
        ...props
    }, ref) => {
        const baseStyles = `
            inline-flex items-center justify-center font-semibold 
            transition-all duration-200 ease-out
            focus:outline-none focus:ring-2 focus:ring-offset-2 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            active:scale-[0.98] transform
        `;

        const variants = {
            primary: `
                bg-gradient-to-r from-primary-500 to-primary-600 text-white 
                hover:from-primary-600 hover:to-primary-700 
                focus:ring-primary-500 
                shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30
            `,
            secondary: `
                bg-gradient-to-r from-secondary-500 to-secondary-600 text-white 
                hover:from-secondary-600 hover:to-secondary-700 
                focus:ring-secondary-500 
                shadow-lg shadow-secondary-500/25 hover:shadow-xl hover:shadow-secondary-500/30
            `,
            outline: `
                border-2 border-primary-500 text-primary-600 bg-transparent
                hover:bg-primary-50 hover:border-primary-600
                focus:ring-primary-500
            `,
            ghost: `
                text-primary-600 bg-transparent
                hover:bg-primary-50 
                focus:ring-primary-500
            `,
            danger: `
                bg-gradient-to-r from-red-500 to-red-600 text-white 
                hover:from-red-600 hover:to-red-700 
                focus:ring-red-500
                shadow-lg shadow-red-500/25
            `,
            success: `
                bg-gradient-to-r from-green-500 to-green-600 text-white 
                hover:from-green-600 hover:to-green-700 
                focus:ring-green-500
                shadow-lg shadow-green-500/25
            `,
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
            md: 'px-5 py-2.5 text-base rounded-xl gap-2',
            lg: 'px-7 py-3.5 text-lg rounded-xl gap-2.5',
            xl: 'px-8 py-4 text-xl rounded-2xl gap-3',
        };

        const iconSizes = {
            sm: 'w-4 h-4',
            md: 'w-5 h-5',
            lg: 'w-6 h-6',
            xl: 'w-7 h-7',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg
                            className={cn("animate-spin", iconSizes[size])}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12" cy="12" r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {icon && iconPosition === 'left' && (
                            <span className={iconSizes[size]}>{icon}</span>
                        )}
                        {children}
                        {icon && iconPosition === 'right' && (
                            <span className={iconSizes[size]}>{icon}</span>
                        )}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
