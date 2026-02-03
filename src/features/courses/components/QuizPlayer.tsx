import React, { useState, useEffect } from 'react';
import { Question } from '../../admin-panel/components/QuizBuilder';
import { Check, X } from 'lucide-react';

interface QuizPlayerProps {
    content: any;
    onComplete: (score: number) => void;
    onSave?: (score: number, answers?: any[]) => Promise<void>;
    onAnswerChange?: (questionId: string, optionIndex: number) => void;
    initialAnswers?: any[];
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ content, onComplete, onSave, onAnswerChange, initialAnswers }) => {
    const questions: Question[] = content.questions || [];

    // Initialize state from potential saved answers
    const [userAnswers, setUserAnswers] = useState<Record<string, number>>(() => {
        if (initialAnswers && initialAnswers.length > 0) {
            const initialMap: Record<string, number> = {};
            // Map our saved answer format back to the local state format
            initialAnswers.forEach((ans) => {
                // We need the question ID. 
                // Problem: saved answers rely on 'questionIndex' because JSON questions don't always have stable IDs if edited (or maybe they do).
                // But QuizPlayer uses `questions[index].id` as key.
                // Let's safe-guard by index if available.
                const question = questions[ans.questionIndex];
                if (question) {
                    initialMap[question.id] = ans.selectedOptionIndex;
                }
            });
            return initialMap;
        }
        return {};
    });

    // Determine if we should start in submitted state
    // If we have answers for all questions or specific flag?
    // Let's assume if we have as many answers as questions, it is submitted.
    // Or simpler: pass 'isCompleted' or similar prop? 
    // Actually, if initialAnswers are passed, it implies we are reloading a state.
    // Let's infer 'isSubmitted' if we have answers.
    const hasPriorState = initialAnswers && initialAnswers.length > 0;
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Effect to set submitted state and calculate score if loading from save
    useEffect(() => {
        if (hasPriorState && !isSubmitted) {
            setIsSubmitted(true);
            // Calculate score for display
            let correctCount = 0;
            questions.forEach((q, _idx) => {
                // Find answer by ID or index
                // We reconstructed userAnswers map above so we can use it, but state updates might be async in effect?
                // No, we initialized state. So userAnswers is ready.
                // Wait, accessing state in effect that runs once? 
                // We should rather calculate it purely from initialAnswers to be safe.
                // But let's use the same logic as render.
                const ansIndex = userAnswers[q.id];
                if (ansIndex === q.correctOptionIndex) {
                    correctCount++;
                }
            });
            const calculatedScore = Math.round((correctCount / questions.length) * 100);
            setScore(calculatedScore);
        }
    }, []); // Run once on mount

    const [score, setScore] = useState(0);

    const handleSelectOption = (questionId: string, optionIndex: number) => {
        if (isSubmitted) return;
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
        if (onAnswerChange) {
            onAnswerChange(questionId, optionIndex);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(userAnswers).length < questions.length) {
            alert('Please answer all questions before submitting.');
            return;
        }

        let correctCount = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] === q.correctOptionIndex) {
                correctCount++;
            }
        });

        const calculatedScore = Math.round((correctCount / questions.length) * 100);
        setScore(calculatedScore);

        if (onSave) {
            const resultAnswers = questions.map((q, index) => ({
                questionIndex: index,
                selectedOptionIndex: userAnswers[q.id],
                isCorrect: userAnswers[q.id] === q.correctOptionIndex
            }));
            console.log('[QuizPlayer] Saving answers:', resultAnswers);
            await onSave(calculatedScore, resultAnswers as any);
        }

        setIsSubmitted(true);
        // onComplete(calculatedScore); // Wait for user to click continue
    };

    const handleContinue = () => {
        onComplete(score);
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-800">Knowledge Check</h2>
                <p className="text-gray-500 mt-2">Answer the following questions to complete this lesson.</p>
            </div>

            {/* Questions */}
            <div className="space-y-8">
                {questions.map((q, index) => {
                    const userAnswer = userAnswers[q.id];

                    return (
                        <div key={q.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-lg text-gray-800 mb-4">
                                <span className="text-blue-500 mr-2">{index + 1}.</span>
                                {q.question}
                            </h3>

                            <div className="space-y-3">
                                {q.options.map((opt, optIdx) => {
                                    const isSelected = userAnswer === optIdx;
                                    let optionClass = "border-gray-200 hover:bg-gray-50";

                                    if (isSubmitted) {
                                        if (optIdx === q.correctOptionIndex) {
                                            optionClass = "bg-green-50 border-green-500 text-green-700";
                                        } else if (isSelected && optIdx !== q.correctOptionIndex) {
                                            optionClass = "bg-red-50 border-red-300 text-red-700";
                                        } else {
                                            optionClass = "opacity-50";
                                        }
                                    } else if (isSelected) {
                                        optionClass = "bg-blue-50 border-blue-500 text-blue-700 shadow-sm";
                                    }

                                    return (
                                        <button
                                            key={optIdx}
                                            onClick={() => handleSelectOption(q.id, optIdx)}
                                            disabled={isSubmitted}
                                            className={`w-full text-left p-4 rounded-md border transition-all flex items-center justify-between ${optionClass}`}
                                        >
                                            <span>{opt}</span>
                                            {isSubmitted && optIdx === q.correctOptionIndex && (
                                                <Check size={18} className="text-green-600" />
                                            )}
                                            {isSubmitted && isSelected && optIdx !== q.correctOptionIndex && (
                                                <X size={18} className="text-red-600" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer / Submit */}
            <div className="mt-12 flex flex-col items-center space-y-4">
                {isSubmitted && (
                    <div className={`text-xl font-bold ${score >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                        You scored {score}%
                    </div>
                )}

                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
                    >
                        Submit Answers
                    </button>
                ) : (
                    <button
                        onClick={handleContinue}
                        className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
                    >
                        <span>Continue</span>
                        <Check size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};
