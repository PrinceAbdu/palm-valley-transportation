'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface Vehicle {
    _id: string;
    name: string;
    type: string;
    licensePlate: string;
    capacity: number;
    basePrice: number;
    isActive: boolean;
    imageUrl?: string;
}

export default function FleetPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api('/api/admin/vehicles', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setVehicles(data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const vehicleTypes = ['sedan', 'suv', 'luxury', 'van'];

    const getVehiclesByType = (type: string) => vehicles.filter(v => v.type === type);
    const activeVehicles = vehicles.filter(v => v.isActive);
    const inactiveVehicles = vehicles.filter(v => !v.isActive);

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
                    <p className="text-gray-600 mt-2">Manage all vehicles in your fleet</p>
                </div>
                <Button variant="primary" onClick={() => window.location.href = '/admin/vehicles'}>
                    Manage Vehicles
                </Button>
            </div>

            {/* Fleet Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-primary-600">{vehicles.length}</p>
                        <p className="text-gray-600">Total Fleet</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{activeVehicles.length}</p>
                        <p className="text-gray-600">Active</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">{inactiveVehicles.length}</p>
                        <p className="text-gray-600">Inactive</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">
                            {getVehiclesByType('luxury').length}
                        </p>
                        <p className="text-gray-600">Luxury</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">
                            {vehicles.reduce((sum, v) => sum + v.capacity, 0)}
                        </p>
                        <p className="text-gray-600">Total Capacity</p>
                    </div>
                </Card>
            </div>

            {/* Filter */}
            <Card variant="elevated" padding="md" className="mb-6">
                <div className="flex gap-4">
                    <Button
                        variant={filter === 'all' ? 'primary' : 'secondary'}
                        onClick={() => setFilter('all')}
                    >
                        All ({vehicles.length})
                    </Button>
                    {vehicleTypes.map(type => (
                        <Button
                            key={type}
                            variant={filter === type ? 'primary' : 'secondary'}
                            onClick={() => setFilter(type)}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)} ({getVehiclesByType(type).length})
                        </Button>
                    ))}
                </div>
            </Card>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles
                    .filter(v => filter === 'all' || v.type === filter)
                    .map((vehicle) => (
                        <Card key={vehicle._id} variant="elevated" padding="md">
                            <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                {vehicle.imageUrl ? (
                                    <img
                                        src={vehicle.imageUrl}
                                        alt={vehicle.name}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <span className="text-6xl">🚗</span>
                                )}
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{vehicle.name}</h3>
                                    <p className="text-sm text-gray-500 capitalize">{vehicle.type}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${vehicle.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                    {vehicle.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                                <div>
                                    <span className="font-medium">License:</span> {vehicle.licensePlate}
                                </div>
                                <div>
                                    <span className="font-medium">Capacity:</span> {vehicle.capacity}
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium">Base Price:</span> ${vehicle.basePrice}
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" className="w-full">
                                View Details
                            </Button>
                        </Card>
                    ))}
            </div>

            {vehicles.length === 0 && (
                <Card padding="lg">
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">No vehicles in fleet</p>
                        <Button variant="primary" onClick={() => window.location.href = '/admin/vehicles'}>
                            Add First Vehicle
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
