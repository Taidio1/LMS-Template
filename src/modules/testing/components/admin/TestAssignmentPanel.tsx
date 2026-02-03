import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as testApi from '../../api/testApi';
import api from '@/services/api';
import { Save, CalendarClock, Users, Loader2 } from 'lucide-react';
import { UserSmartFilter, FilterState } from './UserSmartFilter';

export const TestAssignmentPanel: React.FC = () => {
    const { data: tests, isLoading: isLoadingTests } = useQuery<any[]>({
        queryKey: ['admin-tests'],
        queryFn: async () => (await testApi.getTests()) as any[]
    });

    const [selectedTestId, setSelectedTestId] = useState<string>('');
    const [config, setConfig] = useState({
        maxAttempts: 1,
        periodicCycle: 'none', // none, days, weeks, months
        cycleValue: 30
    });

    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterState, setFilterState] = useState<FilterState>({
        searchQuery: '',
        dateFrom: '',
        dateTo: '',
        department: ''
    });

    const { data: users, isLoading: isLoadingUsers } = useQuery<any[]>({
        queryKey: ['admin-users'],
        queryFn: async () => (await api.users.getAll()) as any[]
    });

    // Handler for SmartFilter
    const handleFilterChange = (filters: FilterState) => {
        setFilterState(filters);
    };

    // Filter users locally
    const filteredUsers = users?.filter(user => {
        const matchesSearch = !filterState.searchQuery ||
            (user.firstName + ' ' + user.lastName + ' ' + user.email).toLowerCase().includes(filterState.searchQuery.toLowerCase());
        const matchesDepartment = !filterState.department || user.department === filterState.department;
        return matchesSearch && matchesDepartment;
    }) || [];

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedUsers(filteredUsers.map(u => u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleAssign = async () => {
        if (!selectedTestId) {
            alert('Proszę wybrać test do przypisania.');
            return;
        }

        if (selectedUsers.length === 0) {
            alert('Proszę wybrać przynajmniej jednego użytkownika.');
            return;
        }

        setIsSubmitting(true);
        setIsSubmitting(true);
        try {
            if (config.periodicCycle !== 'none' && config.cycleValue) {
                // Future: Calculate logic here
            }

            await testApi.assignTest({
                testId: selectedTestId,
                userIds: selectedUsers,
                maxAttempts: config.maxAttempts,
                deadline: undefined // Explicitly sending undefined for now as UI doesn't have a specific date picker for deadline yet
            });

            alert(`Pomyślnie przypisano test do ${selectedUsers.length} użytkowników!`);
            setSelectedUsers([]);
            setSelectedTestId('');
        } catch (error) {
            console.error('Failed to assign test', error);
            alert('Wystąpił błąd podczas przypisywania testu.');
        } finally {
            setIsSubmitting(false);
        }
        setSelectedUsers([]);
    };

    const selectedTest = tests?.find((t: any) => t.id === selectedTestId);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users className="text-blue-600" />
                Przypisz Test do Użytkowników
            </h2>

            {/* Step 1: Select Test */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Krok 1: Wybierz Test</h3>
                {isLoadingTests ? (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin" size={20} />
                        Ładowanie listy testów...
                    </div>
                ) : (
                    <div className="max-w-xl">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dostępne Testy
                        </label>
                        <select
                            value={selectedTestId}
                            onChange={(e) => setSelectedTestId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Wybierz test --</option>
                            {tests?.map((test: any) => (
                                <option key={test.id} value={test.id}>
                                    {test.title} (ID: {test.id})
                                </option>
                            ))}
                        </select>
                        {selectedTest && (
                            <div className="mt-3 p-3 bg-blue-50 text-blue-800 rounded text-sm">
                                <strong>Wybrano:</strong> {selectedTest.title} (Próg: {selectedTest.pass_threshold}%, Czas: {selectedTest.time_limit_minutes} min)
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedTestId && (
                <>
                    {/* Step 2: Filter Users */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 px-1">Krok 2: Wybierz Użytkowników</h3>
                        <UserSmartFilter onFilterChange={handleFilterChange} />

                        {/* User List with Checkboxes */}
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm mt-4">
                            <div className="bg-gray-50 px-6 py-3 border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Wybierz wszystkich ({filteredUsers.length})</span>
                                </div>
                                <span className="text-sm text-gray-500">Zaznaczono: {selectedUsers.length}</span>
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                                {isLoadingUsers ? (
                                    <div className="p-8 text-center text-gray-500 flex justify-center items-center gap-2">
                                        <Loader2 className="animate-spin" size={20} /> Ładowanie użytkowników...
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Nie znaleziono użytkowników spełniających kryteria.
                                    </div>
                                ) : (
                                    filteredUsers.map((user: any) => (
                                        <label key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors block">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-0.5"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {user.department || 'Brak działu'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        {/* Step 3: Configuration */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Krok 3: Konfiguracja Rygoru</h3>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Liczba prób (Max Attempts)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={config.maxAttempts}
                                    onChange={(e) => setConfig({ ...config, maxAttempts: parseInt(e.target.value) })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Domyślnie: 1 próba.</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Harmonogram cykliczny (Opcjonalne)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="w-24 border border-gray-300 rounded-lg px-3 py-2"
                                        value={config.cycleValue}
                                        onChange={(e) => setConfig({ ...config, cycleValue: parseInt(e.target.value) })}
                                        disabled={config.periodicCycle === 'none'}
                                    />
                                    <select
                                        value={config.periodicCycle}
                                        onChange={(e) => setConfig({ ...config, periodicCycle: e.target.value })}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="none">Jednorazowy</option>
                                        <option value="days">Dni</option>
                                        <option value="weeks">Tygodni</option>
                                        <option value="months">Miesięcy</option>
                                    </select>
                                </div>
                                {config.periodicCycle !== 'none' && (
                                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                                        <CalendarClock size={12} />
                                        Test odnowi się automatycznie co {config.cycleValue} {config.periodicCycle}.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Summary / Action */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Podsumowanie</h3>
                            <ul className="space-y-3 text-sm text-gray-600 mb-8">
                                <li className="flex justify-between">
                                    <span>Wybrany Test:</span>
                                    <span className="font-bold text-gray-900">{selectedTest ? selectedTest.title : '-'}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Wybranych użytkowników:</span>
                                    <span className="font-bold text-gray-900">{selectedUsers.length}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Limit prób:</span>
                                    <span className="font-bold text-gray-900">{config.maxAttempts}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Powtarzalność:</span>
                                    <span className="font-bold text-gray-900">
                                        {config.periodicCycle === 'none' ? 'Brak' : `Co ${config.cycleValue} ${config.periodicCycle}`}
                                    </span>
                                </li>
                            </ul>

                            <button
                                onClick={handleAssign}
                                disabled={isSubmitting || !selectedTestId}
                                className={`w-full font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 
                                    ${isSubmitting || !selectedTestId ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                                `}
                            >
                                {isSubmitting ? 'Przetwarzanie...' : (
                                    <>
                                        <Save size={20} />
                                        Przypisz Test
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
