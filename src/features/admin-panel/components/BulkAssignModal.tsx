import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, AdminCourseResponse, LearnerUserResponse } from '@/services/api';

interface BulkAssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedUserIds: string[];
    users: LearnerUserResponse[]; // To display user names if needed
    onSuccess: () => void;
}

export const BulkAssignModal = ({ isOpen, onClose, selectedUserIds, onSuccess }: BulkAssignModalProps) => {
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [deadlineDays, setDeadlineDays] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ summary: any, skipped: any[] } | null>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setSelectedCourses([]);
            setDeadlineDays('');
            setError(null);
            setResult(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // Fetch all courses
    const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
        queryKey: ['admin-courses'],
        queryFn: api.courses.getAll,
        enabled: isOpen,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedCourses.length === 0) {
            setError('Please select at least one course');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await api.users.bulkAssignCourses(
                selectedUserIds,
                selectedCourses,
                deadlineDays === '' ? undefined : Number(deadlineDays)
            );

            setResult({
                summary: response.summary,
                skipped: response.skipped
            });

            // If completely successful or mixed, we don't close immediately to show result
            // onSuccess(); // We might want to refresh the parent list anyway

        } catch (err: any) {
            console.error('Bulk assign error:', err);
            setError(err.message || 'Failed to bulk assign courses');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (result) {
            onSuccess(); // Refresh parent only if we actually did something
        }
        onClose();
    };

    if (!isOpen) return null;

    // Filter only published courses
    const publishedCourses = courses.filter((c: AdminCourseResponse) => c.status === 'published');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Bulk Assign Courses
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {!result ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-2">
                                Assigning courses to <span className="font-semibold">{selectedUserIds.length} selected users</span>.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Courses
                            </label>
                            {isLoadingCourses ? (
                                <div className="text-sm text-gray-500">Loading courses...</div>
                            ) : (
                                <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto p-2">
                                    {publishedCourses.length === 0 ? (
                                        <div className="text-sm text-gray-500 p-2">No published courses available</div>
                                    ) : (
                                        publishedCourses.map(course => (
                                            <label key={course.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    checked={selectedCourses.includes(course.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedCourses([...selectedCourses, course.id]);
                                                        } else {
                                                            setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                                                        }
                                                    }}
                                                />
                                                <span className="ml-3 text-sm text-gray-900">{course.title}</span>
                                                <span className="ml-auto text-xs text-gray-500">v{course.version}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Selected: {selectedCourses.length}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deadline (Days)
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Default from course settings"
                                value={deadlineDays}
                                onChange={(e) => setDeadlineDays(e.target.value === '' ? '' : parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty to use each course's default deadline setting.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || selectedCourses.length === 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                )}
                                Assign Selected
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-lg font-medium">Assignment Processed</span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                <p>Requested: <span className="font-medium">{result.summary.requested}</span> assignments</p>
                                <p className="text-green-600">Successfully Assigned: <span className="font-medium">{result.summary.assigned}</span></p>
                                <p className="text-orange-600">Skipped (Duplicates): <span className="font-medium">{result.summary.skipped}</span></p>
                            </div>
                        </div>

                        {result.skipped.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Skipped Details:</h4>
                                <div className="bg-gray-50 rounded-lg p-2 max-h-40 overflow-y-auto text-xs text-gray-600">
                                    {result.skipped.map((skip: any, idx: number) => (
                                        <div key={idx} className="py-1 border-b border-gray-100 last:border-0">
                                            User ID {skip.userId} - Course ID {skip.courseId}: {skip.reason}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Close & Refresh
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
