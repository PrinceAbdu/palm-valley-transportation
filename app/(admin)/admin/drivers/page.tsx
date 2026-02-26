'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface Driver {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry: string;
    vehicleInfo?: {
        make: string;
        model: string;
        year: number;
        color: string;
        plateNumber: string;
    };
    status: string;
    isAvailable: boolean;
    rating: number;
    totalRides: number;
    createdAt: string;
}

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api('/api/admin/drivers', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setDrivers(data.data);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDriverStatus = async (driverId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const token = localStorage.getItem('token');
            const res = await api(`/api/admin/drivers/${driverId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                fetchDrivers();
            }
        } catch (error) {
            console.error('Error updating driver:', error);
        }
    };

    const deleteDriver = async (driverId: string) => {
        if (!confirm('Are you sure you want to delete this driver?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await api(`/api/admin/drivers/${driverId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                fetchDrivers();
            }
        } catch (error) {
            console.error('Error deleting driver:', error);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
                    <p className="text-gray-600 mt-1">{drivers.length} driver{drivers.length !== 1 ? 's' : ''} registered</p>
                </div>
                <Link href="/admin/drivers/add">
                    <Button>+ Add Driver</Button>
                </Link>
            </div>

            {drivers.length === 0 ? (
                <Card variant="elevated" padding="lg" className="text-center">
                    <p className="text-gray-500 text-lg">No drivers added yet.</p>
                    <p className="text-gray-400 mt-1">Click "Add Driver" to add your first driver.</p>
                </Card>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Driver</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">License</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vehicle</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {drivers.map((driver) => (
                                    <tr key={driver._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{driver.firstName} {driver.lastName}</p>
                                                <p className="text-sm text-gray-500">⭐ {driver.rating.toFixed(1)} · {driver.totalRides} rides</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{driver.email}</p>
                                            <p className="text-sm text-gray-500">{driver.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{driver.licenseNumber}</p>
                                            <p className="text-sm text-gray-500">Exp: {new Date(driver.licenseExpiry).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {driver.vehicleInfo ? (
                                                <div>
                                                    <p className="text-sm text-gray-900">{driver.vehicleInfo.year} {driver.vehicleInfo.make} {driver.vehicleInfo.model}</p>
                                                    <p className="text-sm text-gray-500">{driver.vehicleInfo.color} · {driver.vehicleInfo.plateNumber}</p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">No vehicle</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${driver.status === 'active' ? 'bg-green-100 text-green-700' :
                                                driver.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleDriverStatus(driver._id, driver.status)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${driver.status === 'active'
                                                        ? 'text-orange-700 bg-orange-50 hover:bg-orange-100'
                                                        : 'text-green-700 bg-green-50 hover:bg-green-100'
                                                        }`}
                                                >
                                                    {driver.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => deleteDriver(driver._id)}
                                                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
