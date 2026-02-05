import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { TestSessionState, TestSessionAction } from '../types/types';
import * as testApi from '../api/testApi';
import { useTestTimer } from '../hooks/useTestTimer';
import { useTestSessionGuard } from '../hooks/useTestSessionGuard';

const initialState: TestSessionState = {
    isLoading: false,
    isSessionActive: false,
    currentAttempt: null,
    assignment: null,
    timeLeft: 0,
    answers: {},
    error: null,
};

const testSessionReducer = (state: TestSessionState, action: TestSessionAction): TestSessionState => {
    switch (action.type) {
        case 'INIT_START':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'INIT_SESSION':
            return {
                ...state,
                isLoading: false,
                isSessionActive: true,
                currentAttempt: action.payload.attempt,
                assignment: action.payload.assignment,
                answers: action.payload.attempt.answers || {},
                error: null,
            };
        case 'UPDATE_ANSWER':
            return {
                ...state,
                answers: {
                    ...state.answers,
                    [action.payload.questionId]: action.payload.answer,
                },
            };
        case 'FINISH_TEST':
            return {
                ...state,
                isSessionActive: false,
                timeLeft: 0,
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'INTERRUPT_SESSION':
            return { ...state, isSessionActive: false };
        case 'TICK_TIMER':
            // Timer is handled by hook, but we could sync here if needed.
            // For now, we rely on the hook's value passed to context.
            return state;
        default:
            return state;
    }
};

interface TestSessionContextValue extends TestSessionState {
    startSession: (assignmentId: string) => Promise<void>;
    submitAnswer: (questionId: string, answer: any) => void;
    finalizeSession: () => Promise<void>;
}

const TestSessionContext = createContext<TestSessionContextValue | null>(null);

export const useTestSession = () => {
    const context = useContext(TestSessionContext);
    if (!context) {
        throw new Error('useTestSession must be used within a TestSessionProvider');
    }
    return context;
};

export const TestSessionProvider: React.FC<{ children: React.ReactNode; assignmentId: string }> = ({
    children,
    // assignmentId,
}) => {
    const [state, dispatch] = useReducer(testSessionReducer, initialState);

    // Timer Hook
    const { timeLeft } = useTestTimer({
        durationMinutes: state.assignment?.test?.durationMinutes || 0,
        startedAt: state.currentAttempt?.startedAt || null,
        onTimeExpire: () => {
            if (state.isSessionActive) {
                finalizeSession();
            }
        },
    });

    // Session Guard
    useTestSessionGuard(state.isSessionActive, () => {
        // onInterrupt logic
        finalizeSession();
    });

    const startSession = useCallback(async (assId: string) => {
        // Prevent concurrent generic calls if already loading
        // Note: We can't easily access current state 'isLoading' inside useCallback without adding it to dependency,
        // which might restart logic. But dispatch is safe.
        // Better: The caller (Page) checks isLoading.

        dispatch({ type: 'INIT_START', payload: {} });

        try {
            const assignment = await testApi.getAssignment(assId);
            // Use the resolved testId from the assignment to start the attempt
            const attempt = await testApi.startAttempt(assignment.testId);

            // Fix up the assignmentId in the attempt object since the API doesn't know it contextually
            attempt.assignmentId = assId;

            dispatch({
                type: 'INIT_SESSION',
                payload: { assignment, attempt }
            });
        } catch (err) {
            console.error(err);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to start session. ' + (err instanceof Error ? err.message : '') });
        }
    }, []);

    const submitAnswer = useCallback((questionId: string, answer: any) => {
        dispatch({ type: 'UPDATE_ANSWER', payload: { questionId, answer } });

        // Autosave trigger (debounce recommended in real impl)
        if (state.currentAttempt) {
            testApi.syncAnswers(state.currentAttempt.id, {
                ...state.answers,
                [questionId]: answer
            });
        }
    }, [state.answers, state.currentAttempt]);

    const finalizeSession = useCallback(async () => {
        if (!state.currentAttempt) return;
        try {
            // Pass state to finalizeAttempt as required by api signature
            await testApi.finalizeAttempt(state.currentAttempt.id, state);
            dispatch({ type: 'FINISH_TEST', payload: { result: {} } });
        } catch (e) {
            console.error("Failed to finalize", e);
        }
    }, [state.currentAttempt, state]);

    // Initial load or restore could happen here
    // For now, we wait for explicit startSession call from Lobby

    const value = {
        ...state,
        timeLeft, // Override state timeLeft with hook value
        startSession,
        submitAnswer,
        finalizeSession,
    };

    return (
        <TestSessionContext.Provider value={value}>
            {children}
        </TestSessionContext.Provider>
    );
};
