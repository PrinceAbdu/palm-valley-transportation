'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

export default function ProfilePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchProfile(token);
    }, [router]);

    const fetchProfile = async (token: string) => {
        try {
            const response = await api('/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setFormData({
                    firstName: data.data.firstName || '',
                    lastName: data.data.lastName || '',
                    email: data.data.email || '',
                    phone: data.data.phone || '',
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        const token = localStorage.getItem('token');
        try {
            const response = await api('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                // Update localStorage
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...user, ...data.data }));
                setMessage('Profile updated successfully!');
            } else {
                setMessage('Failed to update profile');
            }
        } catch (error) {
            setMessage('An error occurred');
        } finally {
            setSaving(false);
        }
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
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
                        {message}
                    </div>
                )}

                <Card padding="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
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
                        </div>

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            helpText="Email cannot be changed"
                        />

                        <Input
                            label="Phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(904) 555-0123"
                        />

                        <div className="flex gap-4">
                            <Button type="submit" variant="primary" isLoading={saving}>
                                Save Changes
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Notification Preferences */}
                <Card padding="lg" className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-gray-600">Receive booking confirmations and updates</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                            <div>
                                <p className="font-medium">SMS Notifications</p>
                                <p className="text-sm text-gray-600">Get text alerts for ride status</p>
                            </div>
                        </label>
                    </div>
                </Card>
            </div>
        </main>
    );
}
