import { cn } from '@/lib/utils';
import { BOOKING_STATUS, BookingStatus } from '@/lib/constants';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-success-100 text-success-700',
        warning: 'bg-warning-100 text-warning-700',
        danger: 'bg-danger-100 text-danger-700',
        info: 'bg-primary-100 text-primary-700',
    };

    return (
        <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
}

// Status-specific badge for booking statuses
export function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
        [BOOKING_STATUS.DRAFT]: { label: 'Draft', variant: 'default' },
        [BOOKING_STATUS.PENDING_PAYMENT]: { label: 'Pending Payment', variant: 'warning' },
        [BOOKING_STATUS.PAID_PENDING_CONFIRMATION]: { label: 'Awaiting Confirmation', variant: 'info' },
        [BOOKING_STATUS.CONFIRMED]: { label: 'Confirmed', variant: 'success' },
        [BOOKING_STATUS.DRIVER_ASSIGNED]: { label: 'Driver Assigned', variant: 'success' },
        [BOOKING_STATUS.EN_ROUTE]: { label: 'En Route', variant: 'info' },
        [BOOKING_STATUS.ARRIVED]: { label: 'Driver Arrived', variant: 'info' },
        [BOOKING_STATUS.PICKED_UP]: { label: 'In Progress', variant: 'info' },
        [BOOKING_STATUS.COMPLETED]: { label: 'Completed', variant: 'success' },
        [BOOKING_STATUS.DECLINED]: { label: 'Declined', variant: 'danger' },
        [BOOKING_STATUS.CANCELLED_BY_RIDER]: { label: 'Cancelled', variant: 'danger' },
        [BOOKING_STATUS.CANCELLED_BY_ADMIN]: { label: 'Cancelled', variant: 'danger' },
        [BOOKING_STATUS.NO_SHOW]: { label: 'No Show', variant: 'danger' },
        [BOOKING_STATUS.REFUNDED]: { label: 'Refunded', variant: 'warning' },
        [BOOKING_STATUS.PARTIAL_REFUND]: { label: 'Partially Refunded', variant: 'warning' },
    };

    const config = statusConfig[status] || { label: status, variant: 'default' };

    return <Badge variant={config.variant}>{config.label}</Badge>;
}
