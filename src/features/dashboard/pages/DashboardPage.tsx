import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProgramCard } from '../components/ProgramCard';
import { api, CourseAssignmentResponse, ProgramResponse } from '@/services/api'; // Imported types
import { Loader2 } from 'lucide-react';

// Interface for our grouped data, compatible with ProgramCard expectations
interface GroupedCategory extends ProgramResponse {
    isOverdue?: boolean;
}

export const DashboardPage = () => {
    const navigate = useNavigate();

    // Fetch courses instead of programs
    const { data: courses, isLoading, error } = useQuery({
        queryKey: ['my-courses'], // Changed queryKey
        queryFn: () => api.courses.getMyCourses(), // Changed fetch function
    });

    const handleStartProgram = (categoryId: string) => {
        // Navigating to program page with categoryId.
        // NOTE: ProgramDetailsPage might need adjustment if backend /programs/:id doesn't support categoryId
        navigate(`/program/${categoryId}`);
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        My Training
                    </h1>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        My Training
                    </h1>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    Failed to load courses. Please try again later.
                </div>
            </div>
        );
    }

    // Grouping Logic
    const groupedCategories: GroupedCategory[] = (courses || []).reduce((acc: GroupedCategory[], courseAssignment: CourseAssignmentResponse) => {
        const categoryId = courseAssignment.course.categoryId || 0; // Default to 0 or 'Uncategorized' if needed
        const categoryName = courseAssignment.course.categoryName || 'Uncategorized';

        // Find existing group
        let group = acc.find(g => g.id === String(categoryId));

        if (!group) {
            group = {
                id: String(categoryId),
                title: categoryName,
                businessUnit: categoryName, // Mapping category_name to businessUnit field as requested/implied
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Placeholder image
                totalCourses: 0,
                completedCourses: 0,
                progressPercentage: 0,
                isOverdue: false,
            } as GroupedCategory; // Casting to satisfy ProgramResponse if strictly typed, though we're building it
            acc.push(group);
        }

        // Aggregate counts
        group.totalCourses += 1;
        if (courseAssignment.status === 'completed') {
            group.completedCourses += 1;
        }

        // Check overdue status
        if (courseAssignment.status === 'overdue' || courseAssignment.isOverdue) {
            group.isOverdue = true;
        }

        // Recalculate percentage (simple aggregation)
        group.progressPercentage = Math.round((group.completedCourses / group.totalCourses) * 100);

        return acc;
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    My Training
                </h1>
                {/* Removed hardcoded Primary Care subtitle */}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {groupedCategories.length > 0 ? (
                    groupedCategories.map((category) => (
                        <ProgramCard
                            key={category.id}
                            program={category} // Passing our grouped category as a program
                            onStart={handleStartProgram}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No training assigned to you yet.
                    </div>
                )}
            </div>
        </div>
    );
};
