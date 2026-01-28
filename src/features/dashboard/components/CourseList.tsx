import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CourseCard } from './CourseCard';
import { MOCK_COURSES } from '../api/mockData';
import { Loader2, AlertTriangle } from 'lucide-react';
import { CourseAssignment, TrainingCourse } from '@/types';

interface CourseListProps {
    courses?: (CourseAssignment & { course: TrainingCourse })[];
}

export const CourseList: React.FC<CourseListProps> = ({ courses: propCourses }) => {
    const { data: fetchedCourses, isLoading, isError } = useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 800));
            return MOCK_COURSES;
        },
        enabled: !propCourses // Only fetch if no props provided
    });

    const courses = propCourses || fetchedCourses;

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
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No courses assigned to you yet.</p>
            </div>
        );
    }

    // Sort courses: Overdue -> Nearest Deadline -> Newest
    const sortedCourses = [...courses].sort((a, b) => {
        const now = new Date().getTime();
        const aDeadline = new Date(a.deadline).getTime();
        const bDeadline = new Date(b.deadline).getTime();

        const aIsOverdue = a.status === 'overdue' || (a.status !== 'completed' && aDeadline < now);
        const bIsOverdue = b.status === 'overdue' || (b.status !== 'completed' && bDeadline < now);

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
                <div className="text-sm text-gray-500">
                    {sortedCourses.length} Assigned Course{sortedCourses.length !== 1 ? 's' : ''}
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
