import React, { useState } from 'react';
import { TestSessionProvider } from '../context/TestSessionContext';
import { TestLobby } from '../components/learner/TestLobby';
import { TestHeader } from '../components/learner/TestHeader';
import { QuizAdapter } from '../components/QuizAdapter';

// Demo wrapper to simulate routing parameter
export const TestingLearnerPage: React.FC = () => {
    // In real app, this comes from URL params (e.g., /test/:assignmentId)
    const MOCK_ASSIGNMENT_ID = "demo-assignment-123";

    // In real app, this 'hasStarted' state is managed by the SessionProvider status 
    // or checks if attempt exists. For this demo page, we lift it up to toggle views.
    const [hasStarted, setHasStarted] = useState(false);

    // Mock props that would come from API/Course context
    const mockProps = {
        testTitle: "BHP & Safety Procedures 2024",
        attemptsLeft: 1,
        contentViewed: true, // Simulate that user has viewed PDF
        passingScore: 80
    };

    if (!hasStarted) {
        return (
            <TestLobby
                {...mockProps}
                onStart={() => setHasStarted(true)}
            />
        );
    }

    return (
        <TestSessionProvider assignmentId={MOCK_ASSIGNMENT_ID}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* 
                   Note: TestHeader needs access to Context, so it must be INSIDE Provider.
                   Usually Layout wraps everything, but here we specific composition.
                */}
                <TestSessionProviderContentWrapper />
            </div>
        </TestSessionProvider>
    );
};

// Internal component to consume context for the Header
const TestSessionProviderContentWrapper: React.FC = () => {
    // We could use useTestSession here to get question count dynamically?
    // Or we hardcode for demo. 
    // Ideally TestHeader reads from Context directly.
    return (
        <>
            <TestHeader totalQuestions={20} />
            <div className="flex-1 p-6">
                <QuizAdapter />
            </div>
        </>
    );
};
