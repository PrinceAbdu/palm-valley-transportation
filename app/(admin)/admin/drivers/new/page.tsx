'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
}

interface Vehicle {
    _id: string;
    name: string;
    type: string;
    licensePlate: string;
}

export default function AddDriverPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        userId: '',
        licenseNumber: '',
        licenseExpiryDate: '',
        vehicleId: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch users who are not already drivers
            const usersRes = await api('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const usersData = await usersRes.json();
            if (usersData.success) {
                // Filter to only show riders (not already drivers/admins)
                setUsers(usersData.data.filter((u: User) => u.role === 'rider'));
            }

            // Fetch vehicles
            const vehiclesRes = await api('/api/admin/vehicles', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const vehiclesData = await vehiclesRes.json();
            if (vehiclesData.success) {
                setVehicles(vehiclesData.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await api('/api/admin/drivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/admin/drivers');
            } else {
                setError(data.error || 'Failed to create driver');
            }
        } catch (error) {
            setError('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Add New Driver</h1>
                <p className="text-gray-600 mt-2">Create a new driver profile</p>
            </div>

            <Card variant="elevated" padding="lg" className="max-w-2xl">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Select User */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select User <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.userId}
                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="">Select a user...</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.firstName} {user.lastName} ({user.email})
                                </option>
                            ))}
                        </select>
                        {users.length === 0 && (
                            <p className="text-sm text-yellow-600 mt-1">
                                No eligible users found. Users must register first.
                            </p>
                        )}
                    </div>

                    {/* License Number */}
                    <Input
                        label="Driver's License Number"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        placeholder="FL-DRV-123456"
                        required
                    />

                    {/* License Expiry */}
                    <Input
                        label="License Expiry Date"
                        type="date"
                        value={formData.licenseExpiryDate}
                        onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                        required
                    />

                    {/* Assign Vehicle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assign Vehicle (Optional)
                        </label>
                        <select
                            value={formData.vehicleId}
                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">No vehicle assigned</option>
                            {vehicles.map((vehicle) => (
                                <option key={vehicle._id} value={vehicle._id}>
                                    {vehicle.name} - {vehicle.licensePlate} ({vehicle.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <Button type="submit" variant="primary" isLoading={submitting}>
                            Create Driver
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.push('/admin/drivers')}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Instructions */}
            <Card variant="bordered" padding="md" className="max-w-2xl mt-6">
                <h3 className="font-bold text-gray-900 mb-2">📋 How it works:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>1. Select an existing user from the dropdown</li>
                    <li>2. Enter their driver's license information</li>
                    <li>3. Optionally assign a vehicle</li>
                    <li>4. The user's role will be changed to "driver"</li>
                    <li>5. They can then log in and access the driver portal</li>
                </ul>
            </Card>
        </div>
    );
}
