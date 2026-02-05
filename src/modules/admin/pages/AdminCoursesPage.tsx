import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, AdminCourseResponse, CategoryResponse } from '@/services/api';
import { CourseTable } from '../components/CourseTable';
import { CourseDetailsPanel } from '../components/CourseDetailsPanel';
import { AddCourseModal } from '../components/AddCourseModal';
import { ManageCategoriesModal } from '../components/ManageCategoriesModal';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

export const AdminCoursesPage = () => {
    const queryClient = useQueryClient();
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch all courses
    const { data: courses = [], isLoading: isLoadingCourses, error: coursesError } = useQuery({
        queryKey: ['admin-courses'],
        queryFn: api.courses.getAll,
    });

    // Fetch categories
    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: api.categories.getAll,
    });

    const isLoading = isLoadingCourses || isLoadingCategories;

    // Find selected course
    const selectedCourse = courses.find((c: AdminCourseResponse) => c.id === selectedCourseId);

    // Mutations
    const publishMutation = useMutation({
        mutationFn: api.courses.publish,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
        },
    });

    const archiveMutation = useMutation({
        mutationFn: api.courses.archive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
        },
    });

    const restoreMutation = useMutation({
        mutationFn: api.courses.restore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: api.courses.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            setSelectedCourseId(null);
            setSuccessMessage('The course has been successfully deleted..');
            setShowSuccessModal(true);
        },
    });

    // Filter courses
    const filteredCourses = courses.filter((course: AdminCourseResponse) => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (course.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (course.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false); // Legacy check

        const matchesStatus = statusFilter === 'all' || course.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleCourseCreated = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
        setIsAddCourseOpen(false);
        setSuccessMessage('The course has been successfully created.');
        setShowSuccessModal(true);
    };

    const handleCourseUpdated = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    };

    // Group courses by Category
    const groupedCourses = (() => {
        const groups: Record<string, AdminCourseResponse[]> = {};
        const categoryMap = new Map<number, CategoryResponse>();
        categories.forEach(c => categoryMap.set(c.id, c));

        // Initialize groups for known categories (to preserve order)
        categories.forEach(cat => {
            groups[cat.name] = [];
        });
        groups['Without category'] = [];

        filteredCourses.forEach(course => {
            let catName = 'Without category';
            if (course.categoryId && categoryMap.has(course.categoryId)) {
                catName = categoryMap.get(course.categoryId)!.name;
            } else if (course.category) {
                // Fallback to string category if categoryId not set but string is
                // Check if string matches any category name
                const match = categories.find(c => c.name === course.category);
                if (match) catName = match.name;
                else catName = course.category; // Ad-hoc category
            }

            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(course);
        });

        // Filter out empty groups if using search/filter, OR keep them to allow dropping? 
        // For now, only show groups with courses or explicit categories if empty
        return Object.entries(groups).filter(([_, list]) => list.length > 0 || (searchQuery === '' && statusFilter === 'all'));
    })();

    // Stats
    const stats = {
        total: courses.length,
        draft: courses.filter((c: AdminCourseResponse) => c.status === 'draft').length,
        published: courses.filter((c: AdminCourseResponse) => c.status === 'published').length,
        archived: courses.filter((c: AdminCourseResponse) => c.status === 'archived').length,
    };

    if (coursesError) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    An error occurred while loading courses
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Course Library</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {stats.total} courses • {stats.published} published • {stats.draft} drafts
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsManageCategoriesOpen(true)}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            Categories
                        </button>
                        <button
                            onClick={() => setIsAddCourseOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add course
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mt-4">
                    <div className="flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search course..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All statuses</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="flex">
                {/* Courses Table */}
                <div className={`flex-1 p-6 ${selectedCourse ? 'w-2/3' : 'w-full'} space-y-8`}>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        groupedCourses.map(([categoryName, groupCourses]) => (
                            <div key={categoryName} className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                                    {categoryName}
                                    <span className="text-sm font-normal text-gray-500">({groupCourses.length})</span>
                                </h3>
                                <CourseTable
                                    courses={groupCourses}
                                    selectedCourseId={selectedCourseId}
                                    onSelectCourse={setSelectedCourseId}
                                    onPublish={(id: string) => publishMutation.mutate(id)}
                                    onArchive={(id: string) => archiveMutation.mutate(id)}
                                    onRestore={(id: string) => restoreMutation.mutate(id)}
                                    onDelete={(id: string) => {
                                        setCourseToDelete(id);
                                    }}
                                />
                            </div>
                        ))
                    )}

                    {!isLoading && groupedCourses.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No courses found matching the search criteria.
                        </div>
                    )}
                </div>

                {/* Details Panel */}
                {selectedCourse && (
                    <CourseDetailsPanel
                        course={selectedCourse}
                        onClose={() => setSelectedCourseId(null)}
                        onUpdate={handleCourseUpdated}
                        onPublish={() => publishMutation.mutate(selectedCourseId!)}
                        onArchive={() => archiveMutation.mutate(selectedCourseId!)}
                    />
                )}
            </div>

            {/* Add Course Modal */}
            <AddCourseModal
                isOpen={isAddCourseOpen}
                onClose={() => setIsAddCourseOpen(false)}
                onCourseCreated={handleCourseCreated}
            />

            <ManageCategoriesModal
                isOpen={isManageCategoriesOpen}
                onClose={() => setIsManageCategoriesOpen(false)}
            />

            <ConfirmationModal
                isOpen={!!courseToDelete}
                onClose={() => setCourseToDelete(null)}
                onConfirm={() => {
                    if (courseToDelete) deleteMutation.mutate(courseToDelete);
                }}
                title="Delete course"
                message="Are you sure you want to delete this course?"
                isDestructive={true}
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Success"
                message={successMessage}
            />
        </div>
    );
};
