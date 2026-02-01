import React, { useState } from 'react';
import { api, ApiError } from '../../../services/api';
import { SuccessModal } from '../../../components/ui/SuccessModal';

export const ChangePasswordForm: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    // Form errors
    const [errors, setErrors] = useState<{
        current?: string;
        new?: string;
        confirm?: string;
    }>({});

    const validate = () => {
        const newErrors: { current?: string; new?: string; confirm?: string } = {};

        if (!currentPassword) {
            newErrors.current = 'Current password is required';
        }

        if (newPassword.length < 8) {
            newErrors.new = 'Password must be at least 8 characters long';
        }

        if (newPassword !== confirmPassword) {
            newErrors.confirm = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!validate()) return;

        setIsLoading(true);

        try {
            await api.auth.changePassword(currentPassword, newPassword);
            setSuccessModalOpen(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            if (error instanceof ApiError && error.data && typeof error.data === 'object') {
                const data = error.data as { error?: string };
                setErrorMessage(data.error || 'Failed to change password');
            } else {
                setErrorMessage('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Security Settings</h3>

            {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${errors.current ? 'border-red-500' : 'border-slate-300'
                            }`}
                        placeholder="Enter current password"
                    />
                    {errors.current && <p className="mt-1 text-xs text-red-500">{errors.current}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${errors.new ? 'border-red-500' : 'border-slate-300'
                            }`}
                        placeholder="Enter new password"
                    />
                    {errors.new && <p className="mt-1 text-xs text-red-500">{errors.new}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${errors.confirm ? 'border-red-500' : 'border-slate-300'
                            }`}
                        placeholder="Confirm new password"
                    />
                    {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
                </div>
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2 bg-teal-600 text-white rounded-md font-medium hover:bg-teal-700 transition-colors flex items-center justify-center min-w-[140px] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </div>
            </form>

            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                title="Success"
                message="Your password has been changed successfully."
            />
        </div>
    );
};
