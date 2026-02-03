import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CourseCard } from '../components/CourseCard';
import { CourseFilterBar } from '../components/CourseFilterBar';
import { CourseProgressSummary } from '../components/CourseProgressSummary';
import { api, CourseAssignmentResponse } from '@/services/api';

// Helper type for course with assignment info
type EnrichedCourse = CourseAssignmentResponse & {
    isLocked: boolean;
    course: CourseAssignmentResponse['course'] & {
        tags?: string[];
        prerequisites?: string[];
    };
};

import { TestList } from '@/modules/testing/components/learner/TestList';
import { cn } from '@/lib/utils';

export const MyCoursesPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [activeMainTab, setActiveMainTab] = useState<'courses' | 'tests'>('courses');
    const [activeTab, setActiveTab] = useState<'assigned' | 'available' | 'completed'>('assigned');


    // Fetch courses from API
    const { data: apiCourses, isLoading, error } = useQuery({
        queryKey: ['my-courses'],
        queryFn: () => api.courses.getMyCourses(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Use API data if available, otherwise fallback to mock for development
    const rawCourses = apiCourses || [];

    // 1. Process courses to determine locked status and availability
    const allCourses: EnrichedCourse[] = useMemo(() => {
        return rawCourses.map(assignment => {
            // Use backend provided locking if available (EnrichedCourseAssignment)
            // Or fallback to existing logic if backend doesn't support it yet (though it does now)
            const isLocked = (assignment as any).isLocked ?? false;

            return {
                ...assignment,
                isLocked,
                course: {
                    ...assignment.course,
                    tags: [assignment.course.categoryName || assignment.course.category].filter(Boolean) as string[],
                    prerequisites: []
                }
            } as EnrichedCourse;
        });
    }, [rawCourses]);

    // 2. Extract available categories for filter
    const availableCategories = useMemo(() => {
        const categories = new Set<string>();
        allCourses.forEach(c => {
            if (c.course.tags) {
                c.course.tags.forEach(tag => categories.add(tag));
            }
            if (c.course.category) {
                categories.add(c.course.category);
            }
        });
        return Array.from(categories);
    }, [allCourses]);

    // 3. Calculate Progress Summary Data
    const progressData = useMemo(() => {
        const stats = new Map<string, { total: number; completed: number }>();

        allCourses.forEach(c => {
            // Use categoryName from backend or fallback to legacy/tag
            const catName = c.course.categoryName || c.course.category || 'Uncategorized';

            if (!stats.has(catName)) {
                stats.set(catName, { total: 0, completed: 0 });
            }
            const stat = stats.get(catName)!;
            stat.total++;
            if (c.status === 'completed') {
                stat.completed++;
            }
        });

        return Array.from(stats.entries()).map(([category, stat]) => ({
            category,
            total: stat.total,
            completed: stat.completed,
            percentage: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
        })).sort((a, b) => b.percentage - a.percentage);
    }, [allCourses]);

    const totalCompleted = allCourses.filter(c => c.status === 'completed').length;

    // 4. Filter Courses based on UI state
    const filteredCourses = useMemo(() => {
        return allCourses.filter((course) => {
            // Tab filtering
            if (activeTab === 'assigned') {
                if (course.status === 'completed') return false;
            } else if (activeTab === 'completed') {
                if (course.status !== 'completed') return false;
            } else if (activeTab === 'available') {
                if (course.isLocked) return false;
            }

            // Search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = course.course.title.toLowerCase().includes(query);
                const matchesDesc = course.course.description?.toLowerCase().includes(query);
                if (!matchesTitle && !matchesDesc) return false;
            }

            // Status filter
            if (statusFilter !== 'all') {
                if (statusFilter === 'locked') {
                    if (!course.isLocked) return false;
                } else {
                    if (course.status !== statusFilter) return false;
                }
            }

            // Category filter
            if (categoryFilter !== 'all') {
                // Check categoryName or legacy category/tags
                const courseCat = course.course.categoryName || course.course.category;
                if (courseCat !== categoryFilter && !course.course.tags?.includes(categoryFilter)) return false;
            }

            return true;
        });
    }, [allCourses, searchQuery, statusFilter, categoryFilter, activeTab]);

    // 5. Group Filtered Courses
    const groupedFilteredCourses = useMemo(() => {
        const groups: Record<string, EnrichedCourse[]> = {};

        filteredCourses.forEach(course => {
            const catName = course.course.categoryName || course.course.category || 'Pozostałe';
            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(course);
        });

        // Optional: Sort groups by predefined order if we had full category list here, 
        // but backend returns sorted list of courses, so if we iterate courses in order, groups form in order.
        // However, map/forEach might scramble if keys are unordered. 
        // Better to use Map for iteration order preservation or sort keys.
        return groups;
    }, [filteredCourses]);

    const handleStartCourse = (courseId: string, isLocked: boolean) => {
        if (!isLocked) {
            navigate(`/courses/${courseId}`);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Courses</h1>
                    <p className="text-slate-500">Loading your courses...</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Courses</h1>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Failed to load courses. Please try again later.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    My Courses
                </h1>
                <p className="text-slate-500">
                    Manage your assigned training and track your progress.
                </p>
            </div>

            <CourseProgressSummary
                progressData={progressData}
                totalCompleted={totalCompleted}
                totalCourses={allCourses.length}
            />

            <div className="flex flex-col space-y-4">
                {/* Main View Tabs */}
                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveMainTab('courses')}
                        className={cn(
                            "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
                            activeMainTab === 'courses'
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        My Courses
                    </button>
                    <button
                        onClick={() => setActiveMainTab('tests')}
                        className={cn(
                            "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
                            activeMainTab === 'tests'
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        My Tests
                    </button>
                </div>

                {activeMainTab === 'courses' ? (
                    <>
                        {/* Sub-Tabs for Courses */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                {[
                                    { id: 'assigned', name: 'Assigned to Me' },
                                    { id: 'available', name: 'Available' },
                                    { id: 'completed', name: 'Completed History' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`
                                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                            ${activeTab === tab.id
                                                ? 'border-sky-500 text-sky-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                        `}
                                    >
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <CourseFilterBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            categoryFilter={categoryFilter}
                            onCategoryFilterChange={setCategoryFilter}
                            availableCategories={availableCategories}
                        />

                        <div className="space-y-8">
                            {Object.keys(groupedFilteredCourses).length > 0 ? (
                                Object.entries(groupedFilteredCourses).map(([category, items]) => (
                                    <div key={category} className="space-y-4">
                                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                            {category}
                                            <span className="text-sm font-normal text-gray-500">({items.length})</span>
                                        </h2>
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleStartCourse(item.courseId, item.isLocked)}
                                                    className={!item.isLocked ? "cursor-pointer" : "cursor-not-allowed"}
                                                >
                                                    <CourseCard
                                                        assignment={{
                                                            id: item.id,
                                                            userId: item.userId,
                                                            courseId: item.courseId,
                                                            assignedAt: item.assignedAt,
                                                            deadline: item.deadline,
                                                            status: item.status,
                                                            completedAt: item.completedAt,
                                                            progress: 0 // TODO: Get from progress API
                                                        }}
                                                        courseTitle={item.course.title}
                                                        courseDescription={item.course.description}
                                                        isLocked={item.isLocked}
                                                        secondsRemaining={item.secondsRemaining}
                                                        isOverdue={item.isOverdue}
                                                        isUrgent={item.isUrgent}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    No courses found matching your criteria.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <TestList />
                )}
            </div>
        </div>
    );
};
