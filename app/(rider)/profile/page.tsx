'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

interface SavedAddress {
    id: string;
    label: string;
    address: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
        { id: '1', label: 'Home', address: '123 Main St, Jacksonville, FL 32099' },
        { id: '2', label: 'Work', address: '456 Business Ave, Jacksonville, FL 32099' },
    ]);
    const [notifications, setNotifications] = useState({
        email: true,
        sms: true,
        push: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newAddress, setNewAddress] = useState({ label: '', address: '' });
    const [showAddAddress, setShowAddAddress] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            router.push('/login');
            return;
        }

        if (userData) {
            setProfile(JSON.parse(userData));
        }
        setLoading(false);
    }, [router]);

    const handleProfileChange = (field: keyof UserProfile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profile),
            });

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(profile));
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const addAddress = () => {
        if (newAddress.label && newAddress.address) {
            setSavedAddresses([
                ...savedAddresses,
                { id: Date.now().toString(), ...newAddress }
            ]);
            setNewAddress({ label: '', address: '' });
            setShowAddAddress(false);
        }
    };

    const removeAddress = (id: string) => {
        setSavedAddresses(savedAddresses.filter(a => a.id !== id));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <main className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account information</p>
                </div>

                <div className="grid gap-6">
                    {/* Personal Information */}
                    <Card variant="elevated" padding="lg">
                        <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                value={profile.firstName}
                                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                            />
                            <Input
                                label="Last Name"
                                value={profile.lastName}
                                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={profile.email}
                                onChange={(e) => handleProfileChange('email', e.target.value)}
                            />
                            <Input
                                label="Phone"
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => handleProfileChange('phone', e.target.value)}
                            />
                        </div>
                        <div className="mt-6">
                            <Button variant="primary" onClick={handleSave} isLoading={saving}>
                                Save Changes
                            </Button>
                        </div>
                    </Card>

                    {/* Saved Addresses */}
                    <Card variant="elevated" padding="lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Saved Addresses</h2>
                            <Button variant="secondary" size="sm" onClick={() => setShowAddAddress(true)}>
                                + Add Address
                            </Button>
                        </div>

                        {showAddAddress && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Input
                                        label="Label"
                                        placeholder="e.g., Home"
                                        value={newAddress.label}
                                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Address"
                                            placeholder="Full address"
                                            value={newAddress.address}
                                            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="primary" size="sm" onClick={addAddress}>Save</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {savedAddresses.map((address) => (
                                <div key={address.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-900">{address.label}</p>
                                        <p className="text-sm text-gray-600">{address.address}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeAddress(address.id)}>
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            {savedAddresses.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No saved addresses</p>
                            )}
                        </div>
                    </Card>

                    {/* Notification Preferences */}
                    {/* <Card variant="elevated" padding="lg">
                        <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                                <div>
                                    <p className="font-medium text-gray-900">Email Notifications</p>
                                    <p className="text-sm text-gray-500">Receive booking confirmations and updates</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                    className="w-5 h-5"
                                />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                                <div>
                                    <p className="font-medium text-gray-900">SMS Notifications</p>
                                    <p className="text-sm text-gray-500">Receive ride reminders via text</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifications.sms}
                                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                                    className="w-5 h-5"
                                />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                                <div>
                                    <p className="font-medium text-gray-900">Push Notifications</p>
                                    <p className="text-sm text-gray-500">Browser notifications for updates</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifications.push}
                                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                                    className="w-5 h-5"
                                />
                            </label>
                        </div>
                    </Card> */}

                    {/* Danger Zone */}
                    <Card variant="bordered" padding="lg" className="border-red-200">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Sign Out</p>
                                <p className="text-sm text-gray-500">Sign out of your account</p>
                            </div>
                            <Button variant="ghost" onClick={handleLogout} className="text-red-600">
                                Sign Out
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}
