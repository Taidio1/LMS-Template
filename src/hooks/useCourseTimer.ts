import { useState, useEffect, useCallback } from 'react';

interface CourseTimerResult {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
    isUrgent: boolean; // < 48 hours remaining
    totalSecondsRemaining: number;
    formattedTime: string;
}

/**
 * Enhanced hook for course deadline countdown with overdue status
 * @param deadline - ISO date string or Date object
 * @param initialSecondsRemaining - Optional pre-calculated seconds from API
 */
export const useCourseTimer = (
    deadline: string | Date,
    initialSecondsRemaining?: number
): CourseTimerResult => {
    const calculateTimeLeft = useCallback((): CourseTimerResult => {
        let diffInSeconds: number;

        if (initialSecondsRemaining !== undefined && initialSecondsRemaining >= 0) {
            diffInSeconds = initialSecondsRemaining;
        } else {
            const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
            diffInSeconds = Math.floor((deadlineDate.getTime() - Date.now()) / 1000);
        }

        const isOverdue = diffInSeconds <= 0;
        const isUrgent = !isOverdue && diffInSeconds < 48 * 60 * 60; // < 48 hours

        if (isOverdue) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isOverdue: true,
                isUrgent: false,
                totalSecondsRemaining: 0,
                formattedTime: 'Overdue'
            };
        }

        const days = Math.floor(diffInSeconds / (24 * 60 * 60));
        const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
        const seconds = diffInSeconds % 60;

        // Format time string
        let formattedTime = '';
        if (days > 0) {
            formattedTime = `${days}d ${hours}h`;
        } else if (hours > 0) {
            formattedTime = `${hours}h ${minutes}m`;
        } else {
            formattedTime = `${minutes}m ${seconds}s`;
        }

        return {
            days,
            hours,
            minutes,
            seconds,
            isOverdue,
            isUrgent,
            totalSecondsRemaining: diffInSeconds,
            formattedTime
        };
    }, [deadline, initialSecondsRemaining]);

    const [timeLeft, setTimeLeft] = useState<CourseTimerResult>(calculateTimeLeft);

    useEffect(() => {
        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Update every second for more accurate countdown
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.isOverdue) {
                    clearInterval(timer);
                    return prev;
                }

                // Decrement by 1 second for smooth countdown
                const newSeconds = prev.totalSecondsRemaining - 1;

                if (newSeconds <= 0) {
                    return {
                        days: 0,
                        hours: 0,
                        minutes: 0,
                        seconds: 0,
                        isOverdue: true,
                        isUrgent: false,
                        totalSecondsRemaining: 0,
                        formattedTime: 'Overdue'
                    };
                }

                const days = Math.floor(newSeconds / (24 * 60 * 60));
                const hours = Math.floor((newSeconds % (24 * 60 * 60)) / (60 * 60));
                const minutes = Math.floor((newSeconds % (60 * 60)) / 60);
                const seconds = newSeconds % 60;

                let formattedTime = '';
                if (days > 0) {
                    formattedTime = `${days}d ${hours}h`;
                } else if (hours > 0) {
                    formattedTime = `${hours}h ${minutes}m`;
                } else {
                    formattedTime = `${minutes}m ${seconds}s`;
                }

                return {
                    days,
                    hours,
                    minutes,
                    seconds,
                    isOverdue: false,
                    isUrgent: newSeconds < 48 * 60 * 60,
                    totalSecondsRemaining: newSeconds,
                    formattedTime
                };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    return timeLeft;
};

export default useCourseTimer;
