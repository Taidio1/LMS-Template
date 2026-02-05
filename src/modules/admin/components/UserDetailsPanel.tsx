import { LearnerUserDetailResponse } from '@/services/api';

interface UserDetailsPanelProps {
    user: LearnerUserDetailResponse;
    onClose: () => void;
    onAssignCourse: () => void;
    onResetPassword: () => void;
    onToggleStatus: () => void;
    onUnassignCourse: (assignmentId: string) => void;
    isResettingPassword: boolean;
}

export const UserDetailsPanel = ({
    user,
    onClose,
    onAssignCourse,
    onResetPassword,
    onToggleStatus,
    onUnassignCourse,
    isResettingPassword,
}: UserDetailsPanelProps) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            not_started: 'bg-gray-100 text-gray-600',
            in_progress: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            overdue: 'bg-red-100 text-red-700',
        };
        const labels: Record<string, string> = {
            not_started: 'Not started',
            in_progress: 'In progress',
            completed: 'Completed',
            overdue: 'Overdue',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getDaysRemaining = (deadline: string) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return <span className="text-red-600">Overdue by {Math.abs(diff)} days</span>;
        if (diff === 0) return <span className="text-orange-600">Last day</span>;
        if (diff <= 3) return <span className="text-orange-600">{diff} days</span>;
        return <span className="text-gray-600">{diff} days</span>;
    };

    return (
        <div className="w-96 bg-white border-l border-gray-200 h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Status badge */}
                <div className="mt-4 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    {user.department && (
                        <span className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
                            {user.department}
                        </span>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Information</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Business Unit</span>
                        <span className="text-gray-900">{user.businessUnit || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Created at</span>
                        <span className="text-gray-900">{formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Last login</span>
                        <span className="text-gray-900">{formatDate(user.lastLoginAt)}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Actions</h3>
                <div className="space-y-2">
                    <button
                        onClick={onAssignCourse}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Assign course
                    </button>
                    <button
                        onClick={onResetPassword}
                        disabled={isResettingPassword}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        {isResettingPassword ? 'Resetting...' : 'Reset password'}
                    </button>
                    <button
                        onClick={onToggleStatus}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        {user.status === 'active' ? (
                            <>
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Deactivate user
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Reactivate user
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Assigned Courses */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Assigned courses ({user.assignments?.length || 0})
                    </h3>
                </div>

                {!user.assignments || user.assignments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-sm">No assigned courses</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {user.assignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {assignment.course.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getStatusBadge(assignment.status)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to remove this course assignment?')) {
                                                onUnassignCourse(assignment.id);
                                            }
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors flex-shrink-0"
                                        title="Remove assignment"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Assigned:</span>
                                        <span>{formatDate(assignment.assignedAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Deadline:</span>
                                        <span>{formatDate(assignment.deadline)}</span>
                                    </div>
                                    {assignment.status !== 'completed' && (
                                        <div className="flex justify-between">
                                            <span>Remaining:</span>
                                            {getDaysRemaining(assignment.deadline)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
