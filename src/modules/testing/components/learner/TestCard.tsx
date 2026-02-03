import React, { useState } from 'react';
import { LearnerTest } from '../../api/testApi';
import { formatDistanceToNow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle, PlayCircle, Lock, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface TestCardProps {
    test: LearnerTest;
}

export const TestCard: React.FC<TestCardProps> = ({ test }) => {
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);

    // Logic Checks
    const isCompleted = test.status === 'completed';
    const isOverdue = test.status === 'overdue' || (test.deadline && isPast(new Date(test.deadline)) && !isCompleted);
    const attemptsExhausted = test.attemptCount >= test.maxAttempts;

    // Default to true if undefined (backward compatibility), else check strict false
    const prereqsMet = test.prerequisitesMet !== false;

    // Determine if locked
    const isLocked = !isCompleted && (
        !prereqsMet ||
        attemptsExhausted ||
        isOverdue
    );

    const handleStartClick = () => {
        if (!isLocked && !isCompleted) {
            setShowConfirm(true);
        }
    };

    const handleConfirmStart = () => {
        navigate(`/testing/session/${test.id}`);
    };

    const getStatusColor = () => {
        if (isCompleted) return 'bg-green-100 text-green-700 border-green-200';
        if (isOverdue) return 'bg-red-100 text-red-700 border-red-200';
        if (test.status === 'in_progress') return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusLabel = () => {
        if (isCompleted) return 'Completed';
        if (isOverdue) return 'Overdue';
        if (test.status === 'in_progress') return 'In Progress';
        return 'Not Started';
    };

    const getButtonLabel = () => {
        if (isCompleted) return 'Results';
        if (isOverdue) return 'Overdue';
        if (attemptsExhausted) return 'No Attempts';
        if (!prereqsMet) return 'Prereqs Missing';
        if (test.status === 'in_progress') return 'Resume';
        return 'Start Test';
    };

    return (
        <>
            <div className={cn(
                "bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all hover:shadow-md flex flex-col h-full",
                isOverdue && "border-red-300"
            )}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium border",
                                test.type === 'periodic' ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            )}>
                                {test.type === 'periodic' ? 'Periodic Test' : 'Course Test'}
                            </span>
                            {test.courseTitle && (
                                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                    • {test.courseTitle}
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2" title={test.title}>
                            {test.title}
                        </h3>
                    </div>
                    <div className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap", getStatusColor())}>
                        {getStatusLabel()}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="flex flex-col gap-2 text-sm text-gray-600 mb-6 flex-grow">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                            {test.deadline ? (
                                isOverdue ?
                                    <span className="text-red-600 font-medium">Ended {formatDistanceToNow(new Date(test.deadline))} ago</span> :
                                    <span>{formatDistanceToNow(new Date(test.deadline))} left</span>
                            ) : 'No deadline'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold border",
                            attemptsExhausted ? "border-red-400 text-red-600 bg-red-50" : "border-gray-400 text-gray-600"
                        )}>
                            #
                        </div>
                        <span className={attemptsExhausted ? "text-red-600" : ""}>
                            Attempt {test.attemptCount} / {test.maxAttempts}
                        </span>
                    </div>

                    {!prereqsMet && (
                        <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-2 rounded-md mt-1">
                            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="text-xs">
                                {test.prerequisiteDetail || "Please complete course materials first."}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="text-sm">
                        {test.score !== undefined && (
                            <span className={cn(
                                "font-semibold flex items-center gap-1.5",
                                test.passed ? "text-green-600" : "text-red-600"
                            )}>
                                {test.passed ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                Score: {test.score}%
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleStartClick}
                        disabled={isLocked || isCompleted}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                            (isLocked || isCompleted)
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
                        )}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                {getButtonLabel()}
                            </>
                        ) : isLocked ? (
                            <>
                                <Lock className="w-4 h-4" />
                                {getButtonLabel()}
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-4 h-4" />
                                {getButtonLabel()}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmStart}
                title="Start Assessment"
                message="Are you sure you want to start this assessment? Once started, the timer will begin and leaving the session may count as an attempt."
                confirmLabel="Start Test"
                cancelLabel="Cancel"
            />
        </>
    );
};
