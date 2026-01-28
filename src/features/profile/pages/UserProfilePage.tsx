import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TrainingJourneyMap } from '../components/TrainingJourneyMap';
import { ChangePasswordForm } from '../components/ChangePasswordForm';

export const UserProfilePage: React.FC = () => {
    const { user } = useAuth();

    // Generate avatar URL from user name
    const avatarUrl = user?.name
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D9488&color=fff`
        : 'https://ui-avatars.com/api/?name=User&background=0D9488&color=fff';

    // Format role for display
    const displayRole = user?.role === 'admin' ? 'Administrator' : 'Learner';

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row items-center md:items-start gap-6">
                <img
                    src={avatarUrl}
                    alt={user?.name || 'User'}
                    className="w-24 h-24 rounded-full border-4 border-slate-50"
                />
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-slate-800">{user?.name || 'User'}</h1>
                    <p className="text-slate-500 mb-4">{displayRole} • {user?.department || 'No department'}</p>

                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                            <span className="font-semibold">Email:</span>
                            <span>{user?.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-semibold">ID:</span>
                            <span>{user?.id || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors">
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Training Journey Map Section */}
            <section>
                <TrainingJourneyMap />
            </section>

            {/* Security Section */}
            <section>
                <ChangePasswordForm />
            </section>
        </div>
    );
};
