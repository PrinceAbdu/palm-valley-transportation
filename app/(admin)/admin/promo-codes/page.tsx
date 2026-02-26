'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface PromoCode {
    _id: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minimumOrder: number;
    maxUses: number;
    usedCount: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
}

export default function PromoCodesPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newCode, setNewCode] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrder: 0,
        maxUses: 0,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api('/api/admin/promo-codes', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setPromoCodes(data.data);
            }
        } catch (error) {
            console.error('Error fetching promo codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const createPromoCode = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api('/api/admin/promo-codes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newCode),
            });

            if (response.ok) {
                fetchPromoCodes();
                setShowForm(false);
                setNewCode({
                    code: '',
                    description: '',
                    discountType: 'percentage',
                    discountValue: 10,
                    minimumOrder: 0,
                    maxUses: 0,
                    validFrom: new Date().toISOString().split('T')[0],
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                });
            }
        } catch (error) {
            console.error('Error creating promo code:', error);
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Promo Codes</h1>
                    <p className="text-gray-600 mt-2">Manage discount codes and promotions</p>
                </div>
                <Button variant="primary" onClick={() => setShowForm(true)}>
                    + Create Promo Code
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-primary-600">{promoCodes.length}</p>
                        <p className="text-gray-600">Total Codes</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {promoCodes.filter(p => p.isActive).length}
                        </p>
                        <p className="text-gray-600">Active</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">
                            {promoCodes.reduce((sum, p) => sum + p.usedCount, 0)}
                        </p>
                        <p className="text-gray-600">Times Used</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">
                            {promoCodes.filter(p => new Date(p.validUntil) < new Date()).length}
                        </p>
                        <p className="text-gray-600">Expired</p>
                    </div>
                </Card>
            </div>

            {/* Create Form */}
            {showForm && (
                <Card variant="elevated" padding="lg" className="mb-6">
                    <h3 className="text-lg font-bold mb-4">Create New Promo Code</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input
                            label="Code"
                            value={newCode.code}
                            onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                            placeholder="SUMMER20"
                        />
                        <Input
                            label="Description"
                            value={newCode.description}
                            onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                            placeholder="Summer discount"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount Type
                            </label>
                            <select
                                value={newCode.discountType}
                                onChange={(e) => setNewCode({ ...newCode, discountType: e.target.value as 'percentage' | 'fixed' })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed ($)</option>
                            </select>
                        </div>
                        <Input
                            label={`Discount Value ${newCode.discountType === 'percentage' ? '(%)' : '($)'}`}
                            type="number"
                            value={newCode.discountValue}
                            onChange={(e) => setNewCode({ ...newCode, discountValue: parseFloat(e.target.value) })}
                        />
                        <Input
                            label="Valid From"
                            type="date"
                            value={newCode.validFrom}
                            onChange={(e) => setNewCode({ ...newCode, validFrom: e.target.value })}
                        />
                        <Input
                            label="Valid Until"
                            type="date"
                            value={newCode.validUntil}
                            onChange={(e) => setNewCode({ ...newCode, validUntil: e.target.value })}
                        />
                        <Input
                            label="Min Order ($)"
                            type="number"
                            value={newCode.minimumOrder}
                            onChange={(e) => setNewCode({ ...newCode, minimumOrder: parseFloat(e.target.value) })}
                        />
                        <Input
                            label="Max Uses (0=unlimited)"
                            type="number"
                            value={newCode.maxUses}
                            onChange={(e) => setNewCode({ ...newCode, maxUses: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="flex gap-4 mt-4">
                        <Button variant="primary" onClick={createPromoCode}>Create Code</Button>
                        <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                </Card>
            )}

            {/* Promo Codes List */}
            <Card variant="elevated" padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Code</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Discount</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Usage</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Valid Period</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {promoCodes.map((code) => {
                                const isExpired = new Date(code.validUntil) < new Date();
                                const isExhausted = code.maxUses > 0 && code.usedCount >= code.maxUses;

                                return (
                                    <tr key={code._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-mono font-bold text-gray-900">{code.code}</p>
                                                <p className="text-sm text-gray-500">{code.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-green-600">
                                                {code.discountType === 'percentage'
                                                    ? `${code.discountValue}%`
                                                    : `$${code.discountValue}`
                                                }
                                            </span>
                                            {code.minimumOrder > 0 && (
                                                <p className="text-xs text-gray-500">Min: ${code.minimumOrder}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium">{code.usedCount}</span>
                                            {code.maxUses > 0 && (
                                                <span className="text-gray-500"> / {code.maxUses}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <p>{new Date(code.validFrom).toLocaleDateString()}</p>
                                            <p className="text-gray-500">to {new Date(code.validUntil).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isExpired
                                                    ? 'bg-gray-100 text-gray-600'
                                                    : isExhausted
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : code.isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                }`}>
                                                {isExpired ? 'Expired' : isExhausted ? 'Exhausted' : code.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button variant="secondary" size="sm">Edit</Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {promoCodes.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No promo codes yet. Create your first one!
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
