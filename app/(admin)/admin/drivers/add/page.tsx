'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';

export default function AddDriverPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseExpiry: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        vehicleColor: '',
        vehiclePlateNumber: '',
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const driverData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                licenseNumber: formData.licenseNumber,
                licenseExpiry: formData.licenseExpiry,
                vehicleInfo: formData.vehicleMake ? {
                    make: formData.vehicleMake,
                    model: formData.vehicleModel,
                    year: parseInt(formData.vehicleYear) || new Date().getFullYear(),
                    color: formData.vehicleColor,
                    plateNumber: formData.vehiclePlateNumber,
                } : undefined,
                notes: formData.notes,
                status: 'active',
            };

            const token = localStorage.getItem('token');
            const res = await api('/api/drivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(driverData),
            });

            const data = await res.json();
            if (data.success) {
                router.push('/admin/drivers');
            } else {
                setError(data.error || 'Failed to add driver');
            }
        } catch (err) {
            setError('Failed to add driver. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
                >
                    ← Back to Drivers
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Add New Driver</h1>
                <p className="text-gray-600 mt-1">Enter the driver's details below</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
            )}

            <Card variant="elevated" padding="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mt-8">License Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="License Number"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="License Expiry Date"
                            type="date"
                            name="licenseExpiry"
                            value={formData.licenseExpiry}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mt-8">Vehicle Information (Optional)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Vehicle Make"
                            name="vehicleMake"
                            value={formData.vehicleMake}
                            onChange={handleChange}
                            placeholder="e.g., Toyota"
                        />
                        <Input
                            label="Vehicle Model"
                            name="vehicleModel"
                            value={formData.vehicleModel}
                            onChange={handleChange}
                            placeholder="e.g., Camry"
                        />
                        <Input
                            label="Vehicle Year"
                            type="number"
                            name="vehicleYear"
                            value={formData.vehicleYear}
                            onChange={handleChange}
                            placeholder="e.g., 2024"
                        />
                        <Input
                            label="Vehicle Color"
                            name="vehicleColor"
                            value={formData.vehicleColor}
                            onChange={handleChange}
                            placeholder="e.g., Black"
                        />
                        <Input
                            label="Plate Number"
                            name="vehiclePlateNumber"
                            value={formData.vehiclePlateNumber}
                            onChange={handleChange}
                            placeholder="e.g., ABC 1234"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Additional notes about the driver..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Adding Driver...' : 'Add Driver'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
