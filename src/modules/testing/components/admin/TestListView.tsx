import React from 'react';
import { useQuery } from '@tanstack/react-query';
import * as testApi from '../../api/testApi';
import { Loader2, RefreshCw, FileText } from 'lucide-react';

export const TestListView: React.FC = () => {
    const { data: tests, isLoading, isError, refetch } = useQuery({
        queryKey: ['admin-tests'],
        queryFn: testApi.getTests
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
                <p>Nie udało się pobrać listy testów.</p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 text-sm font-medium bg-white border border-red-200 rounded hover:bg-gray-50"
                >
                    Spróbuj ponownie
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Baza Testów</h2>
                    <p className="text-gray-500">Przegląd wszystkich utworzonych testów w systemie.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                >
                    <RefreshCw size={16} />
                    Odśwież
                </button>
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                            <th className="px-6 py-4">Nazwa Testu</th>
                            <th className="px-6 py-4">Próg Zaliczenia</th>
                            <th className="px-6 py-4">Limit Czasu</th>
                            <th className="px-6 py-4">Data Utworzenia</th>
                            <th className="px-6 py-4 text-right">ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {tests && tests.length > 0 ? (
                            tests.map((test: any) => (
                                <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <FileText size={18} />
                                        </div>
                                        {test.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${Number(test.pass_threshold) >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {Number(test.pass_threshold)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {test.time_limit_minutes} min
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(test.created_at).toLocaleDateString('pl-PL', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-gray-400 font-mono">
                                        #{test.id}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    Brak testów w bazie. Utwórz pierwszy test w zakładce "Kreator Testów".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
