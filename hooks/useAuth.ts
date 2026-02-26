'use client';

import { useState, useEffect } from 'react';

interface User {
    _id?: string;
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const userData = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            if (userData && token) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return { user, loading, logout };
}
