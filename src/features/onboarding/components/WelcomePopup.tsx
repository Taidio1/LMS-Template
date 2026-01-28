import React from 'react';
import { X, ArrowRight } from 'lucide-react';

interface WelcomePopupProps {
    onClose: () => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Popup Content */}
            <div className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header Section with Image */}
                <div className="relative h-64 w-full bg-[#004e5f] overflow-hidden flex items-center justify-center">

                    {/* Close Button top-right */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-20"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="absolute top-6 left-0 right-0 text-center z-10 px-4">
                        <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
                            Welcome Aboard – Let's Start Learning!
                        </h2>
                    </div>

                    {/* Image */}
                    <img
                        src="/welcome-onboarding.png"
                        alt="Welcome"
                        className="h-full w-full object-cover opacity-90"
                    />
                </div>

                {/* Content Section */}
                <div className="p-8">
                    <div className="space-y-4 text-gray-700">
                        <p className="text-sm md:text-base leading-relaxed">
                            We are delighted to welcome you to our team! This system will guide you step by step through the process of onboarding and further development at [company name].
                        </p>

                        <div className="space-y-2">
                            <p className="font-semibold text-[#004e5f]">
                                Your educational path includes three mandatory stages:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
                                <li>Administrative training</li>
                                <li>Thematic training – Stage I</li>
                                <li>Thematic training – Stage II</li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 flex items-center justify-end border-t pt-6">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 rounded-md bg-[#e0f2f1] px-6 py-2.5 text-sm font-semibold text-[#00695c] hover:bg-[#b2dfdb] transition-colors"
                        >
                            NEXT <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
