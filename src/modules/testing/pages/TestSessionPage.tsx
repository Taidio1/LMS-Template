import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TestSessionProvider, useTestSession } from '../context/TestSessionContext';
import { TestHeader } from '../components/learner/TestHeader';
import { QuizAdapter } from '../components/QuizAdapter';

// Inner component to access context
const TestSessionContent: React.FC = () => {
    const { assignment, startSession, isSessionActive, isLoading, error } = useTestSession();
    const { assignmentId } = useParams<{ assignmentId: string }>();

    const initializedRef = React.useRef(false);

    useEffect(() => {
        if (assignmentId && !isSessionActive && !isLoading && !assignment && !initializedRef.current) {
            initializedRef.current = true;
            startSession(assignmentId);
        }
    }, [assignmentId, isSessionActive, isLoading, assignment, startSession]);

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <h2 className="text-xl font-bold mb-2">Error Loading Session</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (isLoading || !assignment) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <TestHeader totalQuestions={assignment.test?.questions?.length || 0} />
            <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
                <QuizAdapter />
            </div>
        </div>
    );
};

export const TestSessionPage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();

    if (!assignmentId) {
        return <div>Invalid Test ID</div>;
    }

    return (
        <TestSessionProvider assignmentId={assignmentId}>
            <TestSessionContent />
        </TestSessionProvider>
    );
};
