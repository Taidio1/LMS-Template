import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, CourseAssignmentResponse } from '@/services/api';
import { Book, GraduationCap, School, Library, Loader2, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
    intro: GraduationCap,
    book: Book,
    books: Library,
    university: School,
};

// Interface for grouped category data
interface GroupedJourneyStage {
    id: string;
    title: string;
    description?: string;
    businessUnit?: string;
    totalCourses: number;
    completedCourses: number;
    progressPercentage: number;
}

export const TrainingJourneyMap: React.FC = () => {
    // Fetch courses instead of programs
    const { data: courses, isLoading } = useQuery({
        queryKey: ['my-courses'],
        queryFn: () => api.courses.getMyCourses(),
    });

    // Grouping Logic
    const groupedStages = useMemo(() => {
        if (!courses) return [];

        const groups: GroupedJourneyStage[] = courses.reduce((acc: GroupedJourneyStage[], courseAssignment: CourseAssignmentResponse) => {
            const categoryId = courseAssignment.course.categoryId || 0;
            const categoryName = courseAssignment.course.categoryName || 'Uncategorized';

            // Find existing group
            let group = acc.find(g => g.id === String(categoryId));

            if (!group) {
                group = {
                    id: String(categoryId),
                    title: categoryName,
                    businessUnit: categoryName,
                    totalCourses: 0,
                    completedCourses: 0,
                    progressPercentage: 0,
                };
                acc.push(group);
            }

            // Aggregate counts
            group.totalCourses += 1;
            if (courseAssignment.status === 'completed') {
                group.completedCourses += 1;
            }

            // Recalculate percentage
            group.progressPercentage = Math.round((group.completedCourses / group.totalCourses) * 100);

            return acc;
        }, []);

        // Sort groups if needed (e.g., by ID or specific order)
        // For now, assuming API returns courses in a way that reduce keeps a stable-ish order, 
        // or we sort by ID to be deterministic.
        return groups.sort((a, b) => a.title.localeCompare(b.title)); // Sorting by title for now
    }, [courses]);

    if (isLoading) {
        return (
            <div className="w-full flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
            </div>
        );
    }

    // Transform grouped data into journey stages with locking logic
    const journeyStages = groupedStages.map((stage, index) => {
        const isCompleted = stage.progressPercentage === 100;
        // Lock if previous stage is not 100% complete
        const isLocked = index > 0 && groupedStages[index - 1].progressPercentage < 100;

        return {
            id: stage.id,
            title: stage.title,
            iconType: index === 0 ? 'intro' : index === 1 ? 'book' : index === 2 ? 'books' : 'university',
            status: isLocked ? 'locked' : isCompleted ? 'completed' : 'in_progress',
            completedCount: stage.completedCourses,
            totalCount: stage.totalCourses,
            progressPercentage: stage.progressPercentage,
            footerText: stage.businessUnit,
            actionLabel: isLocked ? 'Locked' : isCompleted ? 'Review' : 'Continue',
        };
    });

    if (journeyStages.length === 0) {
        return (
            <div className="w-full text-center py-8 text-slate-500">
                No training programs assigned yet.
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-7l-2-2"></path><path d="M17 15h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v-4Z"></path><path d="M7 15H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v-4Z"></path><path d="M5 15V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10"></path></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Training Journey Map</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {journeyStages.map((stage) => {
                    const Icon = iconMap[stage.iconType] || Book;
                    const isLocked = stage.status === 'locked';
                    const isCompleted = stage.status === 'completed';

                    return (
                        <div
                            key={stage.id}
                            className={`flex flex-col bg-white rounded-lg shadow-sm overflow-hidden border ${isLocked ? 'opacity-70' : 'opacity-100'}`}
                        >
                            {/* Header with Icon */}
                            <div className="bg-slate-200 h-40 flex items-center justify-center">
                                <Icon size={64} className="text-teal-600" />
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="font-bold text-lg text-slate-800 mb-4 h-14 line-clamp-2">
                                    {stage.title}
                                </h3>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>{stage.completedCount} of {stage.totalCount} Completed</span>
                                        <span>{stage.progressPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-teal-600 h-2.5 rounded-full"
                                            style={{ width: `${stage.progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-6">
                                    <span className={`w-2 h-2 rounded-full ${isLocked ? 'bg-slate-400' : 'bg-teal-500'}`}></span>
                                    <span className="text-xs text-slate-500">{stage.footerText}</span>
                                </div>

                                <div className="mt-auto">
                                    <button
                                        className={`w-full py-2 px-4 rounded font-medium text-sm transition-colors
                            ${isCompleted
                                                ? 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                                                : isLocked
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                                            }`}
                                        disabled={isLocked}
                                    >
                                        {stage.actionLabel}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
