'use client';

interface StatsWidgetProps {
    title: string;
    value: string | number;
    icon: string;
    change?: number;
    changeLabel?: string;
    color?: 'primary' | 'green' | 'blue' | 'red' | 'purple' | 'yellow';
}

const colorClasses = {
    primary: 'text-primary-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
};

export default function StatsWidget({
    title,
    value,
    icon,
    change,
    changeLabel,
    color = 'primary',
}: StatsWidgetProps) {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className={`text-3xl font-bold mt-2 ${colorClasses[color]}`}>
                        {value}
                    </p>
                    {change !== undefined && (
                        <div className="flex items-center mt-2 text-sm">
                            <span className={isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}>
                                {isPositive && '+'}
                                {change}%
                            </span>
                            {changeLabel && (
                                <span className="text-gray-400 ml-1">{changeLabel}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );
}
