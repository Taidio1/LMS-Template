import { LearnerUserResponse } from '@/services/api';

interface UserTableProps {
    users: LearnerUserResponse[];
    selectedUserId: string | null;
    onSelectUser: (id: string) => void;
    // New props for multi-select
    selectedUserIds?: string[];
    onToggleSelectUser?: (id: string) => void;
    onSelectAll?: (selected: boolean) => void;

    onDeactivate: (id: string) => void;
    onReactivate: (id: string) => void;
    onDelete: (id: string) => void;
}

export const UserTable = ({
    users,
    selectedUserId,
    onSelectUser,
    selectedUserIds = [],
    onToggleSelectUser,
    onSelectAll,
    onDeactivate,
    onReactivate,
    onDelete,
}: UserTableProps) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            inactive: 'bg-gray-100 text-gray-600',
            deleted: 'bg-red-100 text-red-700',
        };
        const labels = {
            active: 'Aktywny',
            inactive: 'Nieaktywny',
            deleted: 'Usunięty',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const allSelected = users.length > 0 && users.every(u => selectedUserIds.includes(u.id));
    const someSelected = users.some(u => selectedUserIds.includes(u.id));

    if (users.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500">Brak użytkowników spełniających kryteria wyszukiwania</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 w-4">
                            {onSelectAll && (
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={allSelected}
                                    ref={input => {
                                        if (input) {
                                            input.indeterminate = someSelected && !allSelected;
                                        }
                                    }}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                            )}
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Użytkownik
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Departament
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kursy
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ostatnie logowanie
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Akcje
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            onClick={() => onSelectUser(user.id)}
                            className={`cursor-pointer transition-colors ${selectedUserId === user.id
                                ? 'bg-blue-50'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                {onToggleSelectUser && (
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={() => onToggleSelectUser(user.id)}
                                    />
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                        {user.firstName[0]}{user.lastName[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {user.department || '-'}
                            </td>
                            <td className="px-6 py-4">
                                {getStatusBadge(user.status)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {user.assignedCoursesCount}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {formatDate(user.lastLoginAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {user.status === 'active' ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeactivate(user.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                            title="Dezaktywuj"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onReactivate(user.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Reaktywuj"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(user.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Usuń"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
