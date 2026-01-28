import { ReactNode, useState, useEffect } from 'react';
import { TopMenu } from './components/TopMenu';
import { WelcomePopup } from '@/features/onboarding/components/WelcomePopup';
import { useAuth } from '@/hooks/useAuth';

interface LearnerLayoutProps {
    children: ReactNode;
}

export const LearnerLayout = ({ children }: LearnerLayoutProps) => {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const hasSeen = localStorage.getItem(`lms_onboarding_seen_${user.id}`);
            if (!hasSeen) {
                setShowOnboarding(true);
            }
        }
    }, [user]);

    const handleCloseOnboarding = () => {
        if (user) {
            localStorage.setItem(`lms_onboarding_seen_${user.id}`, 'true');
            setShowOnboarding(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <TopMenu />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
            {showOnboarding && <WelcomePopup onClose={handleCloseOnboarding} />}
        </div>
    );
};
