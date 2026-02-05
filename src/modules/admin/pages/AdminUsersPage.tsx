import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, LearnerUserResponse } from '@/services/api';
import { UserTable } from '../components/UserTable';
import { UserDetailsPanel } from '../components/UserDetailsPanel';
import { AddUserModal } from '../components/AddUserModal';
import { AssignCourseModal } from '../components/AssignCourseModal';
import { BulkAssignModal } from '../components/BulkAssignModal';

export const AdminUsersPage = () => {
    const queryClient = useQueryClient();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isAssignCourseOpen, setIsAssignCourseOpen] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Fetch all learner users
    const { data: users = [], isLoading, error } = useQuery({
        queryKey: ['admin-users'],
        queryFn: api.users.getAll,
    });

    // Fetch selected user details
    const { data: selectedUser } = useQuery({
        queryKey: ['admin-user', selectedUserId],
        queryFn: () => api.users.getById(selectedUserId!),
        enabled: !!selectedUserId,
    });

    // Mutations
    const deactivateMutation = useMutation({
        mutationFn: api.users.deactivate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-user', selectedUserId] });
        },
    });

    const reactivateMutation = useMutation({
        mutationFn: api.users.reactivate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-user', selectedUserId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: api.users.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setSelectedUserId(null);
        },
    });

    const resetPasswordMutation = useMutation({
        mutationFn: api.users.resetPassword,
        onSuccess: (data) => {
            setGeneratedPassword(data.newPassword);
        },
    });

    // Filter users
    const filteredUsers = users.filter((user: LearnerUserResponse) => {
        const matchesSearch =
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

        let matchesDate = true;
        if (dateFrom || dateTo) {
            const userDate = new Date(user.createdAt).setHours(0, 0, 0, 0);

            if (dateFrom) {
                const fromDate = new Date(dateFrom).setHours(0, 0, 0, 0);
                matchesDate = matchesDate && userDate >= fromDate;
            }
            if (dateTo) {
                const toDate = new Date(dateTo).setHours(0, 0, 0, 0);
                matchesDate = matchesDate && userDate <= toDate;
            }
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    const handleUserCreated = (password: string) => {
        setGeneratedPassword(password);
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    };

    const handleCourseAssigned = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-user', selectedUserId] });
    };

    const handleCourseUnassigned = async (assignmentId: string) => {
        if (!selectedUserId) return;
        await api.users.unassignCourse(selectedUserId, assignmentId);
        queryClient.invalidateQueries({ queryKey: ['admin-user', selectedUserId] });
    };

    const handleBulkAssignSuccess = () => {
        setIsBulkAssignOpen(false);
        setSelectedUserIds([]);
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        // And refresh selected user if any
        if (selectedUserId) {
            queryClient.invalidateQueries({ queryKey: ['admin-user', selectedUserId] });
        }
    };

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    An error occurred while loading users
                </div>
            </div>
        );
    }



    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setDateFrom('');
        setDateTo('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {users.length} User • {users.filter((u: LearnerUserResponse) => u.status === 'active').length} Active
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {selectedUserIds.length > 0 && (
                        <button
                            onClick={() => setIsBulkAssignOpen(true)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Bulk Assign ({selectedUserIds.length})
                        </button>
                    )}
                    <button
                        onClick={() => setIsAddUserOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add User
                    </button>
                </div>
            </div>



            {/* Filters */}
            <div className="flex gap-4 mt-4">
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="From"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="To"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    title="Reset filters"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                </button>
            </div>


            {/* Content */}
            <div className="flex">
                {/* Users Table */}
                <div className={`flex-1 p-6 ${selectedUser ? 'w-2/3' : 'w-full'}`}>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <UserTable
                            users={filteredUsers}
                            selectedUserId={selectedUserId}
                            onSelectUser={setSelectedUserId}
                            selectedUserIds={selectedUserIds}
                            onToggleSelectUser={(id) => {
                                if (selectedUserIds.includes(id)) {
                                    setSelectedUserIds(selectedUserIds.filter(uid => uid !== id));
                                } else {
                                    setSelectedUserIds([...selectedUserIds, id]);
                                }
                            }}
                            onSelectAll={(selected) => {
                                if (selected) {
                                    setSelectedUserIds(filteredUsers.map(u => u.id));
                                } else {
                                    setSelectedUserIds([]);
                                }
                            }}
                            onDeactivate={(id) => deactivateMutation.mutate(id)}
                            onReactivate={(id) => reactivateMutation.mutate(id)}
                            onDelete={(id) => {
                                if (window.confirm('Are you sure you want to delete this user?')) {
                                    deleteMutation.mutate(id);
                                }
                            }}
                        />
                    )}
                </div>

                {/* Details Panel */}
                {selectedUser && (
                    <UserDetailsPanel
                        user={selectedUser}
                        onClose={() => setSelectedUserId(null)}
                        onAssignCourse={() => setIsAssignCourseOpen(true)}
                        onResetPassword={() => resetPasswordMutation.mutate(selectedUserId!)}
                        onToggleStatus={() => {
                            if (selectedUser.status === 'active') {
                                deactivateMutation.mutate(selectedUserId!);
                            } else {
                                reactivateMutation.mutate(selectedUserId!);
                            }
                        }}
                        onUnassignCourse={handleCourseUnassigned}
                        isResettingPassword={resetPasswordMutation.isPending}
                    />
                )}
            </div>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddUserOpen}
                onClose={() => setIsAddUserOpen(false)}
                onUserCreated={handleUserCreated}
            />

            {/* Assign Course Modal */}
            {
                selectedUserId && (
                    <AssignCourseModal
                        isOpen={isAssignCourseOpen}
                        onClose={() => setIsAssignCourseOpen(false)}
                        userId={selectedUserId}
                        onCourseAssigned={handleCourseAssigned}
                    />
                )
            }

            {/* Bulk Assign Modal */}
            <BulkAssignModal
                isOpen={isBulkAssignOpen}
                onClose={() => setIsBulkAssignOpen(false)}
                selectedUserIds={selectedUserIds}
                users={users}
                onSuccess={handleBulkAssignSuccess}
            />

            {/* Generated Password Modal */}
            {
                generatedPassword && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generated password</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Save this password - it cannot be displayed again
                                </p>
                                <div className="bg-gray-100 rounded-lg p-4 font-mono text-lg select-all">
                                    {generatedPassword}
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedPassword);
                                    }}
                                    className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700"
                                >
                                    Copy to clipboard
                                </button>
                            </div>
                            <button
                                onClick={() => setGeneratedPassword(null)}
                                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
