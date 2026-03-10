'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { uploadImageFromBrowser } from '@/lib/supabaseStorage';

const INITIAL_FORM = {
    name: '',
    description: '',
    type: 'sedan',
    order: 0,
    registrationNumber: '',
    maxPassengers: 4,
    maxLuggage: 3,
    basePrice: 45,
    priceMultiplier: 1.0,
    features: '',
    imageUrl: '',
};

export default function AdminVehiclesPage() {
    const router = useRouter();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ ...INITIAL_FORM });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchVehicles(token);
    }, [router]);

    const fetchVehicles = async (token: string) => {
        try {
            const response = await api('/api/admin/vehicles', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setVehicles(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getVehicleEmoji = (type: string) => {
        switch (type) {
            case 'sedan': return '🚗';
            case 'suv': return '🚙';
            case 'van': return '🚐';
            case 'luxury': return '🚌';
            default: return '🚗';
        }
    };

    // ── Image upload ──
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        setUploading(true);

        try {
            const publicUrl = await uploadImageFromBrowser(file, 'vehicles');
            setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
        } catch (error: any) {
            const reason = error?.message ? `: ${error.message}` : '';
            alert(`Failed to upload image to Supabase${reason}`);
            setImagePreview(null);
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({ ...INITIAL_FORM });
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Edit ──
    const handleEdit = (vehicle: any) => {
        setShowAddForm(false);
        setFormData({
            name: vehicle.name,
            description: vehicle.description || '',
            type: vehicle.type,
            order: vehicle.order ?? 0,
            registrationNumber: vehicle.registrationNumber || '',
            maxPassengers: vehicle.maxPassengers,
            maxLuggage: vehicle.maxLuggage,
            basePrice: vehicle.basePrice,
            priceMultiplier: vehicle.priceMultiplier || 1.0,
            features: vehicle.features?.join(', ') || '',
            imageUrl: vehicle.imageUrl || '',
        });
        setImagePreview(vehicle.imageUrl || null);
        setEditingId(vehicle._id);
    };

    const handleCancel = () => {
        setEditingId(null);
        setShowAddForm(false);
        resetForm();
    };

    // ── Save (create or update) ──
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        setSaving(true);

        const payload = {
            ...formData,
            order: Number.isFinite(Number(formData.order)) ? Number(formData.order) : 0,
            features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        };

        try {
            const isEdit = !!editingId;
            const url = isEdit ? `/api/admin/vehicles/${editingId}` : '/api/admin/vehicles';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await api(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.success) {
                fetchVehicles(token!);
                setEditingId(null);
                setShowAddForm(false);
                resetForm();
            } else {
                alert(data.error || 'Failed to save vehicle');
            }
        } catch (error) {
            alert('Failed to save vehicle');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ──
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;
        const token = localStorage.getItem('token');

        try {
            const response = await api(`/api/admin/vehicles/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                fetchVehicles(token!);
            } else {
                alert(data.error || 'Failed to delete vehicle');
            }
        } catch {
            alert('Failed to delete vehicle');
        }
    };

    // ── Shared form JSX ──
    const renderForm = (title: string) => (
        <form onSubmit={handleSave} className="space-y-5">
            <h2 className="text-xl font-bold">{title}</h2>

            {/* Image upload area */}
            <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div
                        className="relative w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-primary-400 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {uploading ? (
                            <Spinner size="sm" />
                        ) : imagePreview || formData.imageUrl ? (
                            <img
                                src={imagePreview || formData.imageUrl}
                                alt="Vehicle"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center p-2">
                                <span className="text-3xl">📷</span>
                                <p className="text-xs text-gray-500 mt-1">Click to upload</p>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    {(imagePreview || formData.imageUrl) && (
                        <button
                            type="button"
                            className="text-xs text-danger-600 hover:underline"
                            onClick={() => {
                                setFormData(prev => ({ ...prev, imageUrl: '' }));
                                setImagePreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                        >
                            Remove image
                        </button>
                    )}
                </div>
                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Display Name *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Executive Sedan"
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium mb-1">Vehicle Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="sedan">Sedan</option>
                                <option value="suv">SUV</option>
                                <option value="van">Van</option>
                                <option value="luxury">Luxury</option>
                            </select>
                        </div>
                    </div>
                    <Input
                        label="Registration Number *"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        placeholder="e.g., ABC-1234"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={2}
                    placeholder="Brief description shown to customers"
                    required
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                    label="Base Price ($)"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                    required
                />
                <Input
                    label="Price Multiplier"
                    type="number"
                    step="0.1"
                    value={formData.priceMultiplier}
                    onChange={(e) => setFormData({ ...formData, priceMultiplier: parseFloat(e.target.value) })}
                    required
                />
                <Input
                    label="Max Passengers"
                    type="number"
                    value={formData.maxPassengers}
                    onChange={(e) => setFormData({ ...formData, maxPassengers: parseInt(e.target.value) })}
                    required
                />
                <Input
                    label="Max Luggage"
                    type="number"
                    value={formData.maxLuggage}
                    onChange={(e) => setFormData({ ...formData, maxLuggage: parseInt(e.target.value) })}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Order Number"
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value || '0', 10) })}
                    placeholder="0"
                />
            </div>

            <Input
                label="Features (comma-separated)"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="WiFi, Leather Seats, Premium Sound, USB Charging"
            />

            {/* Or paste an image URL directly */}
            <Input
                label="Or paste Image URL"
                value={formData.imageUrl}
                onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setImagePreview(e.target.value || null);
                }}
                placeholder="https://example.com/car-image.jpg"
            />

            <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" disabled={saving || uploading}>
                    {saving ? 'Saving...' : editingId ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
                    <p className="text-gray-600 mt-1">Add, edit, and manage your vehicle fleet</p>
                </div>
                {!showAddForm && !editingId && (
                    <Button
                        variant="primary"
                        onClick={() => {
                            resetForm();
                            setEditingId(null);
                            setShowAddForm(true);
                        }}
                    >
                        + Add Vehicle
                    </Button>
                )}
            </div>

            {/* Add Vehicle Form */}
            {showAddForm && (
                <Card padding="lg" className="mb-6">
                    {renderForm('Add New Vehicle')}
                </Card>
            )}

            {/* Vehicle List */}
            <div className="space-y-6">
                {vehicles.map((vehicle) => (
                    <Card key={vehicle._id} variant="bordered" padding="lg">
                        {editingId === vehicle._id ? (
                            renderForm(`Editing: ${vehicle.name}`)
                        ) : (
                            /* Display Mode */
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {vehicle.imageUrl ? (
                                        <img
                                            src={vehicle.imageUrl}
                                            alt={vehicle.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl">{getVehicleEmoji(vehicle.type)}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold truncate">{vehicle.name}</h3>
                                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full flex-shrink-0">
                                            {vehicle.type}
                                        </span>
                                        {!vehicle.isActive && (
                                            <span className="text-xs bg-danger-100 text-danger-700 px-2 py-0.5 rounded-full flex-shrink-0">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-0.5 truncate">{vehicle.description}</p>
                                    <div className="flex gap-4 text-sm text-gray-600 mt-2">
                                        <span>👥 {vehicle.maxPassengers} passengers</span>
                                        <span>🧳 {vehicle.maxLuggage} bags</span>
                                        <span className="font-semibold text-success-600">${vehicle.basePrice}</span>
                                        <span className="text-gray-500">Order: {vehicle.order ?? 0}</span>
                                        {vehicle.registrationNumber && (
                                            <span className="text-gray-400">#{vehicle.registrationNumber}</span>
                                        )}
                                    </div>
                                    {vehicle.features?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {vehicle.features.map((f: string, idx: number) => (
                                                <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                                        ✏️ Edit
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(vehicle._id)}>
                                        🗑️ Delete
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {vehicles.length === 0 && !showAddForm && (
                <Card padding="lg" className="text-center py-12">
                    <span className="text-5xl mb-4 block">🚗</span>
                    <p className="text-gray-500 text-lg mb-4">No vehicles added yet</p>
                    <Button variant="primary" onClick={() => { resetForm(); setShowAddForm(true); }}>
                        + Add Your First Vehicle
                    </Button>
                </Card>
            )}
        </div>
    );
}
