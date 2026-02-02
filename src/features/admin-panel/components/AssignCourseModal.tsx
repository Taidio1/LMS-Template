import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, AdminCourseResponse } from '@/services/api';

interface AssignCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onCourseAssigned: () => void;
}

export const AssignCourseModal = ({ isOpen, onClose, userId, onCourseAssigned }: AssignCourseModalProps) => {
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [customDeadlines, setCustomDeadlines] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const queryClient = useQueryClient();

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setSelectedCourseIds([]);
            setCustomDeadlines({});
            setError(null);
            setSuccessMessage(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // Fetch available courses
    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['published-courses'],
        queryFn: async () => {
            const all = await api.courses.getAll();
            return all;
        },
        enabled: isOpen,
    });

    // Fetch user's current assignments to filter out already assigned courses
    const { data: userAssignments = [] } = useQuery({
        queryKey: ['admin-user-assignments', userId],
        queryFn: () => api.users.getAssignments(userId),
        enabled: isOpen && !!userId,
    });

    const assignedCourseIds = userAssignments.map(a => a.courseId);
    const availableCourses = (courses as AdminCourseResponse[]).filter(c => !assignedCourseIds.includes(c.id));

    const handleCourseToggle = (courseId: string) => {
        if (selectedCourseIds.includes(courseId)) {
            setSelectedCourseIds(prev => prev.filter(id => id !== courseId));
            // Optional: clean up deadline state
            const newDeadlines = { ...customDeadlines };
            delete newDeadlines[courseId];
            setCustomDeadlines(newDeadlines);
        } else {
            setSelectedCourseIds(prev => [...prev, courseId]);
            // Set default deadline logic if needed, currently we leave it empty/undefined until user inputs
        }
    };

    const handleDeadlineChange = (courseId: string, days: number) => {
        setCustomDeadlines(prev => ({
            ...prev,
            [courseId]: days
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCourseIds.length === 0) {
            setError('Select at least one course');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const promises = selectedCourseIds.map(courseId => {
                const deadlineDays = customDeadlines[courseId];
                return api.users.assignCourse(userId, {
                    courseId,
                    deadlineDays: deadlineDays, // Use customized or undefined (which falls back to backend default if simplified)
                    // Note: If user didn't type anything, deadlineDays is undefined.
                    // If we want to enforce the course default explicitly we could do it here,
                    // but the backend usually handles undefined by using course default.
                });
            });

            await Promise.all(promises);

            setSuccessMessage(`Successfully assigned ${selectedCourseIds.length} course(s).`);

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['admin-user-assignments', userId] });

            // Wait a moment before closing to show success
            setTimeout(() => {
                onCourseAssigned();
                onClose();
            }, 1500);

        } catch (err: any) {
            console.error('Failed to assign courses', err);
            // It's possible some succeeded and some failed. 
            // For a simple UI, we show the error. ideally we'd show partial success.
            setError(err.message || 'Failed to assign assignments');
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full mx-4 shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900">Assign Course(s)</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            {successMessage}
                        </div>
                    )}

                    <form id="assign-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select courses
                            </label>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                                </div>
                            ) : availableCourses.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <p className="text-sm">No available courses to assign</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableCourses.map((course) => {
                                        const isSelected = selectedCourseIds.includes(course.id);
                                        return (
                                            <div
                                                key={course.id}
                                                className={`p-3 rounded-lg border transition-colors ${isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-5 items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleCourseToggle(course.id)}
                                                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between">
                                                            <div
                                                                className="cursor-pointer"
                                                                onClick={() => handleCourseToggle(course.id)}
                                                            >
                                                                <p className="font-medium text-gray-900">{course.title}</p>
                                                                {course.description && (
                                                                    <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="mt-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                                <label className="text-sm text-gray-700 whitespace-nowrap">
                                                                    Avg completion days:
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    max={365}
                                                                    value={customDeadlines[course.id] || ''}
                                                                    onChange={(e) => handleDeadlineChange(course.id, parseInt(e.target.value) || 0)}
                                                                    placeholder={`${course.deadlineDays || 30}`}
                                                                    className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                <span className="text-xs text-gray-500">
                                                                    Default: {course.deadlineDays || 30} days
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        {selectedCourseIds.length} course{selectedCourseIds.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="assign-form"
                            disabled={isSubmitting || selectedCourseIds.length === 0 || !!successMessage}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                            {isSubmitting ? 'Assigning...' : 'Assign Courses'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
