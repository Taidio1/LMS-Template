import { useState, useEffect } from 'react';

export const useTimer = (deadline: string) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        isExpired: boolean;
    }>({ days: 0, hours: 0, minutes: 0, isExpired: false });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const diff = new Date(deadline).getTime() - new Date().getTime();

            if (diff <= 0) {
                return { days: 0, hours: 0, minutes: 0, isExpired: true };
            }

            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                isExpired: false,
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [deadline]);

    return timeLeft;
};
