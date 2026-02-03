import { useEffect } from 'react';
// import { useBlocker } from 'react-router-dom'; // Disabled for now as it depends on RR version

/**
 * Hook to guard the test session.
 * 
 * Responsibilities:
 * 1. Warn user on window refresh/close (onbeforeunload).
 * 2. Block internal navigation if session is active (returning execution to finalize logic).
 * 
 * Note: strict navigation blocking usually requires react-router-dom's useBlocker or Unstable_Blocker.
 * For this implementation, we will focus on the browser level block and a soft advice for internal routing.
 */
export const useTestSessionGuard = (isSessionActive: boolean, onInterrupt: () => void) => {

    // 1. Browser Refresh / Close Protection
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isSessionActive) return;

            const message = "Trwa sesja testowa. Odświeżenie strony nie zakończy testu, ale upewnij się, że masz stabilne połączenie. Wyjście z testu może zakończyć próbę.";
            e.returnValue = message;
            return message;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isSessionActive]);

    // 2. Navigation Blocking (Conceptual - requires RR integration)
    // In a real scenario with React Router v6.4+, we would use:
    // useBlocker(
    //   ({ currentLocation, nextLocation }) => {
    //     if (isSessionActive && currentLocation.pathname !== nextLocation.pathname) {
    //       // Allow navigation if it is to a "success" page or if user confirmed interruption
    //       // onInterrupt();
    //       // return true; 
    //     }
    //     return false;
    //   }
    // );

    // For now, we assume the guarding logic is triggered by the UI components (Start/Exit buttons)
    // and browser refresh is handled above.
};
