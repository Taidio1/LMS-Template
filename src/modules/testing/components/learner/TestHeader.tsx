import React from 'react';
import { Clock } from 'lucide-react';
import { useTestSession } from '../../context/TestSessionContext';

interface TestHeaderProps {
    totalQuestions: number;
}

export const TestHeader: React.FC<TestHeaderProps> = ({ totalQuestions }) => {
    const { timeLeft, answers, assignment } = useTestSession();

    const answeredCount = Object.keys(answers).length;
    const progress = Math.round(((answeredCount) / totalQuestions) * 100);

    // Format time MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const isLowTime = timeLeft < 120; // less than 2 minutes

    return (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-bold text-gray-800">
                    {assignment?.test?.title || 'Egzamin'}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>Pytanie {answeredCount < totalQuestions ? answeredCount + 1 : totalQuestions} z {totalQuestions}</span>
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold transition-colors
        ${isLowTime ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-700'}
      `}>
                <Clock size={20} />
                <span>{formattedTime}</span>
            </div>
        </div>
    );
};
