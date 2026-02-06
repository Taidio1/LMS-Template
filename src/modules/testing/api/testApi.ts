import api from '@/services/api';
import { TestAssignment, TestAttempt, TestSessionState, Question } from '../types/types';

// Real API implementation
// Note: Some backend endpoints might need adjustment to match these exact signatures.

// 1. Get Assignment/Test
// For now, we simulate an assignment by fetching the Test definition directly if no assignment ID exists yet,
// or fetching the assignment if we have one.
// The backend 'getTest' returns Questions.
export const getAssignment = async (assignmentId: string): Promise<TestAssignment> => {
    // 1. Fetch all assignments to find the correct Test ID
    const learnerTests = await getLearnerTests();
    const assignment = learnerTests.find(t => t.id === assignmentId);

    if (!assignment) {
        // Fallback or error if not found. Attempt to use as direct ID if numeric?
        // For now, strict check.
        console.warn(`Assignment ${assignmentId} not found in learner list.`);
        // If it looks like a raw ID (e.g. from previous generic calls), try it, but likely fails if it's "direct_1"
    }

    const realTestId = assignment ? assignment.testId : assignmentId;

    // 2. Fetch Test Details using real Test ID
    const testData = await api.get<any>(`/tests/${realTestId}`);

    // 3. Construct TestAssignment
    return {
        id: assignmentId,
        testId: realTestId,
        courseId: assignment?.courseId || "N/A",
        userId: "current-user",
        maxAttempts: assignment?.maxAttempts || 1,
        assignedAt: new Date().toISOString(), // In real app, from assignment record
        deadlineDate: assignment?.deadline ? new Date(assignment.deadline).toISOString() : undefined,
        test: {
            title: testData.title,
            passingScore: testData.passingScore,
            durationMinutes: testData.durationMinutes,
            questionsCount: testData.questions?.length || 0,
            questions: testData.questions
        }
    };
};

export const startAttempt = async (testId: string): Promise<TestAttempt> => {
    // Call backend to create a record in 'test_attempts'
    const response = await api.post<any>('/tests/attempt/start', { testId });
    // Note: We don't have assignmentId here if we only pass testId, 
    // but the return type expects it. We might need to adjust or pass it through.
    // For now we assume the caller handles matching the attempt to assignment if needed contextually.

    return {
        id: response.attemptId,
        assignmentId: "pending-link", // The context will override this with known assignmentId
        attemptNumber: 1,
        startedAt: new Date().toISOString(),
        status: 'in_progress',
        answers: {}
    };
};

export const syncAnswers = async (attemptId: string, responses: Record<string, string | string[]>) => {
    // Auto-save progress
    try {
        await api.post(`/tests/attempt/${attemptId}/save`, { answers: responses });
    } catch (error) {
        console.error('[AutoSave] Failed', error);
    }
};

export const finalizeAttempt = async (attemptId: string, state: TestSessionState): Promise<{ passed: boolean; score: number }> => {
    // Send answers to backend for final calculation and storage
    const response = await api.post<{ passed: boolean, score: number }>(`/tests/attempt/${attemptId}/finalize`, {
        answers: state.answers
    });

    return {
        passed: response.passed,
        score: response.score
    };
};

// Builder: Create Test
export const createTest = async (testData: any) => {
    return await api.post('/tests', testData);
};

// Admin: List Tests
export const getTests = async (): Promise<any[]> => {
    return await api.get('/tests');
};

// Admin: Get Test Results Report
export const getTestResults = async (): Promise<any[]> => {
    return await api.get('/tests/results');
};
// Learner: Get Assigned Tests
export interface LearnerTest {
    id: string; // Assignment ID
    testId: string;
    title: string;
    type: 'periodic' | 'course';
    deadline: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    attemptCount: number;
    maxAttempts: number;
    score?: number;
    passed?: boolean;
    courseId?: string; // If linked to course
    courseTitle?: string;
    durationMinutes: number;
    prerequisitesMet?: boolean; // For course tests (e.g., must view PDF)
    prerequisiteDetail?: string; // Message to show if prereqs not met
}

export const getLearnerTests = async (): Promise<LearnerTest[]> => {
    // Fetch from real API
    // Endpoint corresponds to backend/src/controllers/testController.js -> getLearnerTests
    // Mounted at /api/tests/learner
    return await api.get<LearnerTest[]>('/tests/learner');
};

export interface AssignTestParams {
    testId: string;
    userIds: string[];
    deadline?: string;
    maxAttempts?: number;
}

export const assignTest = async (params: AssignTestParams): Promise<void> => {
    return await api.post('/tests/assign', params);
};
