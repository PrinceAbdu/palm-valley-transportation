import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    helpText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, icon, iconPosition = 'left', type, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            `w-full px-4 py-3 border-2 rounded-xl bg-white
                            transition-all duration-200 ease-out
                            placeholder:text-gray-400
                            hover:border-gray-300
                            focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none`,
                            error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                : 'border-gray-200',
                            icon && iconPosition === 'left' && 'pl-12',
                            icon && iconPosition === 'right' && 'pr-12',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {icon && iconPosition === 'right' && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p className="mt-2 text-sm text-gray-500">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
