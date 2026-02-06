import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CourseCard } from './CourseCard';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { CourseAssignment, TrainingCourse } from '@/types';

interface CourseListProps {
    courses?: (CourseAssignment & { course: TrainingCourse })[];
}

export const CourseList: React.FC<CourseListProps> = ({ courses: propCourses }) => {
    const queryClient = useQueryClient();
    const queryKey = ['courses', 'assigned'];

    const {
        data: fetchedCourses,
        isLoading,
        isError,
        isFetching,
        refetch
    } = useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 800));
        },
        enabled: !propCourses, // Only fetch if no props provided
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const courses = propCourses || fetchedCourses;

    const handleRefresh = async () => {
        // Invalidate queries to ensure fresh data from strict source of truth
        // This triggers a refetch in the background
        await queryClient.invalidateQueries({ queryKey });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
                <p>Loading your courses...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
                <AlertTriangle className="w-10 h-10 mb-3" />
                <p className="font-medium">Failed to load courses</p>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {isFetching ? 'Retrying...' : 'Try Again'}
                </button>
            </div>
        );
    }

    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No courses assigned to you yet.</p>
                <button
                    onClick={handleRefresh}
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-2 mx-auto"
                >
                    <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh List
                </button>
            </div>
        );
    }

    // Sort courses: Overdue -> Nearest Deadline -> Newest
    const sortedCourses = [...courses].sort((a, b) => {
        const now = new Date().getTime();
        // Handle undefined deadlines by treating them as far future (or handle as preferred)
        const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;

        const aIsOverdue = a.status === 'overdue' || (a.status !== 'completed' && a.deadline && aDeadline < now);
        const bIsOverdue = b.status === 'overdue' || (b.status !== 'completed' && b.deadline && bDeadline < now);

        // 1. Overdue first
        if (aIsOverdue && !bIsOverdue) return -1;
        if (!aIsOverdue && bIsOverdue) return 1;

        // 2. Nearest Deadline
        if (aDeadline !== bDeadline) return aDeadline - bDeadline;

        // 3. Newest (Assigned Date Descending)
        return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Your Training</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRefresh}
                        disabled={isFetching}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                        title="Refresh courses"
                    >
                        <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="text-sm text-gray-500">
                        {sortedCourses.length} Assigned Course{sortedCourses.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCourses.map((assignment) => (
                    <CourseCard
                        key={assignment.id}
                        assignment={assignment}
                        courseTitle={assignment.course.title}
                        courseDescription={assignment.course.description}
                    />
                ))}
            </div>
        </div>
    );
};
