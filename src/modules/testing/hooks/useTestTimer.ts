import { useState, useEffect, useCallback } from 'react';

interface UseTestTimerProps {
    durationMinutes: number;
    startedAt: string | null;
    onTimeExpire?: () => void;
}

export const useTestTimer = ({ durationMinutes, startedAt, onTimeExpire }: UseTestTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!startedAt) {
            return;
        }

        const startTime = new Date(startedAt).getTime();
        const durationMs = durationMinutes * 60 * 1000;
        const endTime = startTime + durationMs;

        const tick = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

            setTimeLeft(remaining);

            if (remaining <= 0) {
                if (onTimeExpire) onTimeExpire();
            }
        };

        tick(); // Initial tick
        const intervalId = setInterval(tick, 1000);

        return () => clearInterval(intervalId);
    }, [durationMinutes, startedAt, onTimeExpire]);

    return { timeLeft };
};
