import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, AdminCourseResponse } from '@/services/api';

interface AssignCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onCourseAssigned: () => void;
}

export const AssignCourseModal = ({ isOpen, onClose, userId, onCourseAssigned }: AssignCourseModalProps) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [customDeadline, setCustomDeadline] = useState<number | undefined>(undefined);
    const [useCustomDeadline, setUseCustomDeadline] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const selectedCourse = (courses as AdminCourseResponse[]).find(c => c.id === selectedCourseId);

    const assignMutation = useMutation({
        mutationFn: () => api.users.assignCourse(userId, {
            courseId: selectedCourseId,
            deadlineDays: useCustomDeadline ? customDeadline : undefined,
        }),
        onSuccess: () => {
            onCourseAssigned();
            onClose();
            setSelectedCourseId('');
            setCustomDeadline(undefined);
            setUseCustomDeadline(false);
            setError(null);
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseId) {
            setError('Select a course');
            return;
        }
        assignMutation.mutate();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-lg w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Assign course</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select course
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
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {availableCourses.map((course) => (
                                    <label
                                        key={course.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedCourseId === course.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="course"
                                            value={course.id}
                                            checked={selectedCourseId === course.id}
                                            onChange={() => setSelectedCourseId(course.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900">{course.title}</p>
                                            {course.description && (
                                                <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                                {course.category && <span>{course.category}</span>}
                                                <span>Default deadline: {course.deadlineDays || 30} days</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Custom Deadline */}
                    {selectedCourse && (
                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useCustomDeadline}
                                    onChange={(e) => setUseCustomDeadline(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Set custom deadline</span>
                            </label>

                            {useCustomDeadline && (
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Number of days to complete
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={365}
                                        value={customDeadline || ''}
                                        onChange={(e) => setCustomDeadline(parseInt(e.target.value) || undefined)}
                                        placeholder={`Domyślnie: ${selectedCourse.deadlineDays || 30}`}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            disabled={assignMutation.isPending || !selectedCourseId}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {assignMutation.isPending ? 'Przypisywanie...' : 'Przypisz kurs'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
