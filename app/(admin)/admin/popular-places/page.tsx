'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { uploadImageFromBrowser } from '@/lib/supabaseStorage';

interface PopularPlace {
    _id: string;
    name: string;
    description: string;
    icon: string;
    imageUrl?: string;
    mapLink?: string;
    isActive: boolean;
    order: number;
}

const INITIAL_FORM = {
    name: '',
    description: '',
    icon: '📍',
    imageUrl: '',
    mapLink: '',
    order: 0,
    isActive: true,
};

export default function PopularPlacesPage() {
    const [places, setPlaces] = useState<PopularPlace[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ ...INITIAL_FORM });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchPlaces();
    }, []);

    const fetchPlaces = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api('/api/admin/popular-places', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                const sorted = [...(data.data || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                setPlaces(sorted);
            }
        } catch (error) {
            console.error('Error fetching places:', error);
        } finally {
            setLoading(false);
        }
    };

    // ── Image upload ──
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        setUploading(true);

        try {
            const publicUrl = await uploadImageFromBrowser(file, 'popular-places');
            setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
        } catch (error: any) {
            const reason = error?.message ? `: ${error.message}` : '';
            alert(`Failed to upload image to Supabase${reason}`);
            setImagePreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const url = editingId
                ? `/api/admin/popular-places/${editingId}`
                : '/api/admin/popular-places';
            const method = editingId ? 'PUT' : 'POST';

            const res = await api(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, order: Number(formData.order) || 0 }),
            });

            const data = await res.json();
            if (data.success) {
                fetchPlaces();
                resetForm();
            }
        } catch (error) {
            console.error('Error saving place:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (place: PopularPlace) => {
        setEditingId(place._id);
        setFormData({
            name: place.name,
            description: place.description,
            icon: place.icon,
            imageUrl: place.imageUrl || '',
            mapLink: place.mapLink || '',
            order: place.order,
            isActive: place.isActive,
        });
        setImagePreview(place.imageUrl || null);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this place?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await api(`/api/admin/popular-places/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                fetchPlaces();
            }
        } catch (error) {
            console.error('Error deleting place:', error);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ ...INITIAL_FORM });
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const icons = ['📍', '✈️', '🚢', '🏖️', '🏙️', '🏢', '🎉', '🏟️', '🏨', '🎭', '🛍️', '⛪', '🏛️', '🌳', '🎪'];

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Popular Places</h1>
                    <p className="text-gray-600 mt-1">Manage popular destinations displayed on the homepage</p>
                </div>
                {!showForm && (
                    <Button onClick={() => { resetForm(); setShowForm(true); }}>
                        + Add Place
                    </Button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <Card variant="elevated" padding="lg" className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        {editingId ? 'Edit Place' : 'Add New Place'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Image upload + name row */}
                        <div className="flex items-start gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="relative w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-primary-400 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {uploading ? (
                                        <Spinner size="sm" />
                                    ) : imagePreview || formData.imageUrl ? (
                                        <img
                                            src={imagePreview || formData.imageUrl}
                                            alt="Place"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-2">
                                            <span className="text-3xl">🖼️</span>
                                            <p className="text-xs text-gray-500 mt-1">Upload image</p>
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
                                        className="text-xs text-red-600 hover:underline"
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
                                <Input
                                    label="Place Name *"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., JAX Airport"
                                />
                                <Input
                                    label="Or paste Image URL"
                                    value={formData.imageUrl}
                                    onChange={(e) => {
                                        setFormData({ ...formData, imageUrl: e.target.value });
                                        setImagePreview(e.target.value || null);
                                    }}
                                    placeholder="https://example.com/place-image.jpg"
                                />
                            </div>
                        </div>

                        {/* Icon picker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                            <div className="flex flex-wrap gap-2">
                                {icons.map((icon) => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon })}
                                        className={`w-10 h-10 text-xl rounded-lg border-2 flex items-center justify-center transition ${formData.icon === icon
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={2}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Brief description of this place"
                            />
                        </div>

                        {/* Map Link */}
                        <Input
                            label="Google Maps Link"
                            value={formData.mapLink}
                            onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                            placeholder="https://maps.google.com/..."
                        />

                        {/* Order + Active */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Order Number"
                                type="number"
                                value={formData.order.toString()}
                                min="0"
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                            />
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-primary-600 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active (visible on homepage)</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={saving || uploading}>
                                {saving ? 'Saving...' : editingId ? 'Update Place' : 'Add Place'}
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Places List */}
            {places.length === 0 ? (
                <Card variant="elevated" padding="lg" className="text-center">
                    <span className="text-5xl mb-4 block">📍</span>
                    <p className="text-gray-500 text-lg">No popular places added yet.</p>
                    <p className="text-gray-400 mt-1 mb-4">Click "Add Place" to get started.</p>
                    <Button onClick={() => { resetForm(); setShowForm(true); }}>
                        + Add Your First Place
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {places.map((place) => (
                        <Card key={place._id} variant="elevated" padding="md">
                            {/* Image */}
                            {place.imageUrl && (
                                <div className="w-full h-36 rounded-lg overflow-hidden mb-3 bg-gray-100">
                                    <img
                                        src={place.imageUrl}
                                        alt={place.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{place.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{place.name}</h3>
                                        <p className="text-sm text-gray-600">{place.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">Order #{place.order ?? 0}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${place.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {place.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {place.mapLink && (
                                <a
                                    href={place.mapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-2"
                                >
                                    🗺️ View on Map
                                </a>
                            )}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleEdit(place)}
                                    className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(place._id)}
                                    className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
