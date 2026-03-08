'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface Notification {
    _id: string;
    type: 'ride' | 'payment' | 'promo' | 'system';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    link?: string;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchNotifications(token);
    }, [router]);

    const fetchNotifications = async (token: string) => {
        try {
            const response = await api('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (data.success) {
                setNotifications(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await api(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await api('/api/notifications/read-all', {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await markAsRead(notification._id);
        }

        if (notification.link) {
            router.push(notification.link);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ride': return '🚗';
            case 'payment': return '💳';
            case 'promo': return '🎉';
            case 'system': return '⚙️';
            default: return '📌';
        }
    };

    const filteredNotifications = notifications.filter(n =>
        filter === 'all' ||
        (filter === 'unread' && !n.read) ||
        n.type === filter
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <main className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[300px] flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            </main>
        );
    }

    return (
        <main className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-600 mt-1">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="secondary" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'unread', 'ride', 'payment', 'promo', 'system'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === f
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                        <Card
                            key={notification._id}
                            variant={notification.read ? 'default' : 'elevated'}
                            padding="md"
                            className={`cursor-pointer transition ${!notification.read ? 'border-l-4 border-l-primary-500' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                        {notification.message}
                                    </p>
                                    {!notification.read && (
                                        <span className="inline-block mt-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                                            New
                                        </span>
                                    )}
                                    {notification.link && (
                                        <p className="text-xs text-primary-600 mt-2 font-medium">Tap to view booking details</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}

                    {filteredNotifications.length === 0 && (
                        <Card padding="lg">
                            <div className="text-center py-12">
                                <p className="text-4xl mb-4">📭</p>
                                <p className="text-gray-500">No notifications to show</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    );
}
