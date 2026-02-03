import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLearnerTests } from '../../api/testApi';
import { TestCard } from './TestCard';
import { Loader2, AlertCircle } from 'lucide-react';

export const TestList: React.FC = () => {
    const { data: tests, isLoading, error } = useQuery({
        queryKey: ['learner-tests'],
        queryFn: getLearnerTests,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500">Loading your tests...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-red-600 bg-red-50 rounded-lg border border-red-100">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p>Failed to load tests. Please try again later.</p>
            </div>
        );
    }

    if (!tests || tests.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <h3 className="text-lg font-medium text-gray-900">No Tests Assigned</h3>
                <p className="text-gray-500 mt-1">You don't have any pending tests right now.</p>
            </div>
        );
    }

    // Filter and Sort tests
    const activeTests = tests.filter(t => t.status !== 'completed').sort((a, b) => {
        // Overdue check
        const aOverdue = a.status === 'overdue';
        const bOverdue = b.status === 'overdue';
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Deadline check (ascending - nearest first)
        const aDate = new Date(a.deadline).getTime();
        const bDate = new Date(b.deadline).getTime();
        return aDate - bDate;
    });

    const completedTests = tests.filter(t => t.status === 'completed').sort((a, b) => {
        // Most recent completed first
        // Assuming we might have completedAt or just use ID/deadline as proxy if date missing
        // Ideally we added completedAt to LearnerTest, but for now we rely on order or update API later.
        return 0; // Keep retrieval order or enhance later
    });

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    Active Assignments
                    <span className="text-sm font-normal text-gray-500">({activeTests.length})</span>
                </h2>

                {activeTests.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {activeTests.map((test) => (
                            <TestCard key={test.id} test={test} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">You don't have any pending tests right now.</p>
                    </div>
                )}
            </div>

            {completedTests.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                        Completed History
                        <span className="text-sm font-normal text-gray-500">({completedTests.length})</span>
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {completedTests.map((test) => (
                            <TestCard key={test.id} test={test} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

