'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, feedback: string) => void;
    driverName?: string;
}

export default function RatingModal({
    isOpen,
    onClose,
    onSubmit,
    driverName = 'your driver',
}: RatingModalProps) {
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit(rating, feedback);
        setRating(5);
        setFeedback('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-2">Rate Your Ride</h2>
                <p className="text-gray-600 text-center mb-6">
                    How was your experience with {driverName}?
                </p>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="text-4xl transition transform hover:scale-110"
                        >
                            {star <= (hoveredRating || rating) ? '⭐' : '☆'}
                        </button>
                    ))}
                </div>

                {/* Rating Labels */}
                <p className="text-center text-gray-600 mb-4">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                </p>

                {/* Feedback */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Feedback (Optional)
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us more about your experience..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1">
                        Skip
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} className="flex-1">
                        Submit Rating
                    </Button>
                </div>
            </div>
        </div>
    );
}
