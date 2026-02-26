import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'bordered' | 'elevated' | 'glass' | 'gradient' | 'hover';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        const baseStyles = 'rounded-2xl transition-all duration-300';

        const variants = {
            default: 'bg-white shadow-sm',
            bordered: 'bg-white border-2 border-gray-100',
            elevated: 'bg-white shadow-lg shadow-gray-200/50 hover:shadow-xl',
            glass: 'bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg',
            gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-100/50',
            hover: 'bg-white shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer',
        };

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
            xl: 'p-10',
        };

        return (
            <div
                ref={ref}
                className={cn(baseStyles, variants[variant], paddings[padding], className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export default Card;
