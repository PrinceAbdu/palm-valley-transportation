'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';

interface Settings {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    taxRate: number;
    cancellationWindowHours: number;
    minAdvanceBookingHours: number;
    maxAdvanceBookingDays: number;
    serviceAreaRadiusMiles: number;
    notificationsEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        companyName: 'Palm Valley Transportation',
        companyEmail: 'info@palmvalleytrans.com',
        companyPhone: '(904) 555-0100',
        companyAddress: 'Jacksonville, Florida',
        taxRate: 7,
        cancellationWindowHours: 24,
        minAdvanceBookingHours: 2,
        maxAdvanceBookingDays: 90,
        serviceAreaRadiusMiles: 50,
        notificationsEnabled: true,
        smsEnabled: true,
        emailEnabled: true,
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleChange = (field: keyof Settings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Settings saved successfully!');
        setSaving(false);
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
                <p className="text-gray-600 mt-2">Configure your platform settings</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Company Information */}
                <Card variant="elevated" padding="lg">
                    <h3 className="text-xl font-bold mb-6">Company Information</h3>
                    <div className="space-y-4">
                        <Input
                            label="Company Name"
                            value={settings.companyName}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={settings.companyEmail}
                            onChange={(e) => handleChange('companyEmail', e.target.value)}
                        />
                        <Input
                            label="Phone"
                            value={settings.companyPhone}
                            onChange={(e) => handleChange('companyPhone', e.target.value)}
                        />
                        <Input
                            label="Address"
                            value={settings.companyAddress}
                            onChange={(e) => handleChange('companyAddress', e.target.value)}
                        />
                    </div>
                </Card>
                {/* Service Area */}
                <Card variant="elevated" padding="lg">
                    <h3 className="text-xl font-bold mb-6">Service Area</h3>
                    <div className="space-y-4">
                        <Input
                            label="Service Radius (miles)"
                            type="number"
                            value={settings.serviceAreaRadiusMiles}
                            onChange={(e) => handleChange('serviceAreaRadiusMiles', parseInt(e.target.value))}
                        />
                        <p className="text-sm text-gray-500">
                            The service area is centered on Jacksonville, FL (30.3322, -81.6557).
                            Bookings outside this radius will show a warning.
                        </p>
                        <div className="bg-gray-100 rounded-lg p-4 text-center">
                            <p className="text-gray-600">📍 Jacksonville, FL</p>
                            <p className="text-2xl font-bold text-primary-600 mt-2">
                                {settings.serviceAreaRadiusMiles} mile radius
                            </p>
                        </div>
                    </div>
                </Card>

        

              
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSave}
                    isLoading={saving}
                >
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
