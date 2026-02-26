'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchUsers(token);
    }, [router, roleFilter]);

    const fetchUsers = async (token: string) => {
        try {
            const url = roleFilter === 'all'
                ? '/api/admin/users'
                : `/api/admin/users?role=${roleFilter}`;

            const response = await api(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Management</h1>

            {/* Role Filter */}
            <div className="flex gap-4 mb-6">
                {['all', 'rider', 'admin'].map((role) => (
                    <button
                        key={role}
                        onClick={() => setRoleFilter(role)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${roleFilter === role
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                ))}
            </div>

            {/* Users Table */}
            <Card padding="lg">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4">Name</th>
                                <th className="text-left py-3 px-4">Email</th>
                                <th className="text-left py-3 px-4">Phone</th>
                                <th className="text-left py-3 px-4">Role</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-600">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium">
                                            {user.firstName} {user.lastName}
                                        </td>
                                        <td className="py-3 px-4">{user.email}</td>
                                        <td className="py-3 px-4">{user.phone || 'N/A'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'driver' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${user.isActive ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
                                                }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
