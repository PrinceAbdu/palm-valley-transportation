'use client';

import { useState } from 'react';

interface ServiceAreaWarningProps {
    pickupDistance?: number;
    dropoffDistance?: number;
    maxRadius?: number;
}

export default function ServiceAreaWarning({
    pickupDistance,
    dropoffDistance,
    maxRadius = 50
}: ServiceAreaWarningProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const pickupOutside = pickupDistance && pickupDistance > maxRadius;
    const dropoffOutside = dropoffDistance && dropoffDistance > maxRadius;

    if (!pickupOutside && !dropoffOutside) return null;

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                    <h4 className="font-semibold text-yellow-800 mb-1">
                        Service Area Notice
                    </h4>
                    <p className="text-sm text-yellow-700 mb-2">
                        {pickupOutside && (
                            <>
                                Your pickup location is approximately <strong>{pickupDistance?.toFixed(1)} miles</strong> from our service center.
                                {' '}
                            </>
                        )}
                        {dropoffOutside && (
                            <>
                                Your drop-off location is approximately <strong>{dropoffDistance?.toFixed(1)} miles</strong> from our service center.
                                {' '}
                            </>
                        )}
                        Our standard service area covers {maxRadius} miles from Jacksonville.
                    </p>
                    <p className="text-sm text-yellow-700">
                        <strong>Note:</strong> Additional fees may apply for rides outside our primary service area.
                        Please contact us at <a href="tel:+19045550100" className="underline">904-555-0100</a> to confirm availability.
                    </p>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-yellow-600 hover:text-yellow-800"
                    aria-label="Dismiss warning"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
