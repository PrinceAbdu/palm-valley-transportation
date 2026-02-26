'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    pageSize?: number;
}

export default function DataTable<T extends { _id?: string; id?: string }>({
    data,
    columns,
    onRowClick,
    emptyMessage = 'No data found',
    pageSize = 10,
}: DataTableProps<T>) {
    const [page, setPage] = useState(1);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDesc, setSortDesc] = useState(false);

    // Sort data
    const sortedData = [...data].sort((a, b) => {
        if (!sortKey) return 0;
        const aVal = (a as any)[sortKey];
        const bVal = (b as any)[sortKey];
        if (aVal < bVal) return sortDesc ? 1 : -1;
        if (aVal > bVal) return sortDesc ? -1 : 1;
        return 0;
    });

    // Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDesc(!sortDesc);
        } else {
            setSortKey(key);
            setSortDesc(false);
        }
    };

    const getValue = (item: T, key: string): any => {
        const keys = key.split('.');
        let value: any = item;
        for (const k of keys) {
            value = value?.[k];
        }
        return value;
    };

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key as string}
                                    className={`px-6 py-4 text-left text-sm font-semibold text-gray-600 ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                        }`}
                                    onClick={() => col.sortable && handleSort(col.key as string)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {col.sortable && sortKey === col.key && (
                                            <span>{sortDesc ? '↓' : '↑'}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {paginatedData.map((item, index) => (
                            <tr
                                key={item._id || item.id || index}
                                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((col) => (
                                    <td key={col.key as string} className="px-6 py-4">
                                        {col.render
                                            ? col.render(item)
                                            : getValue(item, col.key as string)?.toString() || '-'
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {data.length === 0 && (
                    <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                    <p className="text-sm text-gray-600">
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.length)} of {data.length}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
