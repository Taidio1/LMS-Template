export interface Question {
    id: string;
    type: 'single-choice' | 'open';
    text: string;
    options?: string[]; // Only for single-choice
    correctOptionIndex?: number; // Only for single-choice
    correctAnswerText?: string; // Optional model answer for open questions
}

export interface TestAssignment {
    id: string;
    testId: string;
    courseId: string;
    userId: string;
    maxAttempts: number;
    periodicCycle?: 'days' | 'weeks' | 'months';
    assignedAt: string; // ISO date string
    deadlineDate: string; // ISO date string
    test?: {
        title: string;
        passingScore: number;
        durationMinutes: number;
        questionsCount: number;
        questions?: Question[];
    };
}

export interface TestAttempt {
    id: string;
    assignmentId: string;
    attemptNumber: number;
    status: 'started' | 'in_progress' | 'completed' | 'interrupted' | 'expired';
    startedAt: string;
    finishedAt?: string;
    score?: number;
    answers: Record<string, any>; // questionId -> answer
}

export interface TestSessionState {
    isLoading: boolean;
    isSessionActive: boolean;
    currentAttempt: TestAttempt | null;
    assignment: TestAssignment | null;
    timeLeft: number; // in seconds
    answers: Record<string, any>;
    error: string | null;
}

export type TestSessionAction =
    | { type: 'INIT_SESSION'; payload: { attempt: TestAttempt; assignment: TestAssignment } }
    | { type: 'UPDATE_ANSWER'; payload: { questionId: string; answer: any } }
    | { type: 'SYNC_ANSWERS_SUCCESS' }
    | { type: 'TICK_TIMER' }
    | { type: 'FINISH_TEST'; payload: { result: any } } // result type TBD based on API
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'INTERRUPT_SESSION' };
