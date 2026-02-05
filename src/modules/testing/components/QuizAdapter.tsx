import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestSession } from '../context/TestSessionContext';
import { QuizPlayer } from './shared/QuizPlayer';

export const QuizAdapter: React.FC = () => {
    const navigate = useNavigate();
    const {
        assignment,
        isSessionActive,
        answers,
        submitAnswer,
        finalizeSession,
        isLoading,
        startSession
    } = useTestSession();

    if (isLoading) {
        return <div>Loading test...</div>;
    }

    if (!isSessionActive || !assignment?.test?.questions) {
        // This is a safeguard. Normally QuizAdapter is rendered inside a specific SessionContainer
        // that handles the 'Start' state.
        // If rendered directly, we might show a placeholder or nothing.
        return (
            <div className="p-8 text-center">
                <p>Test session not active or content missing.</p>
                {/* Temporary debug button */}
                {!isSessionActive && (
                    <button onClick={() => startSession('mock-assignment-id')}>
                        Start Debug Session
                    </button>
                )}
            </div>
        );
    }

    const { questions } = assignment.test;

    // Transform answers for QuizPlayer initialAnswers if needed
    // QuizPlayer expects { questionIndex: number, selectedOptionIndex: number }[]
    // But QuizPlayer also reconstructs from its props if we match the shape.
    // Actually QuizPlayer's initialAnswers prop logic is a bit complex matching by index.
    // Since we are the 'Adapter', we should just pass the current answers state if we were reloading.
    // But for now, we rely on context holding the truth.

    // Construct initialAnswers from context answers for hydration
    const initialAnswers = Object.entries(answers).map(([qId, ansIndex]) => {
        const qIndex = questions.findIndex((q: any) => q.id === qId);
        return {
            questionIndex: qIndex,
            selectedOptionIndex: ansIndex
        };
    }).filter(a => a.questionIndex !== -1);

    return (
        <div className="test-session-adapter">
            <QuizPlayer
                content={{ questions }}
                onComplete={async (score) => {
                    await finalizeSession(); // In real app, we might pass score
                    navigate('/courses');
                }}
                onAnswerChange={(qId, idx) => {
                    submitAnswer(qId, idx);
                }}
                initialAnswers={initialAnswers}
            />
        </div>
    );
};
