import React from 'react';
import { Download, FileText } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { getTestResults } from '../../api/testApi';

// Type matching the API response
interface TestResultRow {
    id: string;
    userId: string;
    email: string;
    testName: string;
    score: number;
    attemptNumber: number;
    date: string; // ISO
    status: 'passed' | 'failed' | 'interrupted';
}

export const TestResultsView: React.FC = () => {

    // React Query hook to fetch real data
    const { data: results, isLoading, error } = useQuery({
        queryKey: ['testResults'],
        queryFn: getTestResults,
        initialData: []
    });

    const handleExport = () => {
        // Use real results for export
        const dataToExport = results.length > 0 ? results : [];

        const headers = ["User ID,Email,Test Name,Score,Attempt #,Date,Status"];
        const rows = dataToExport.map((r: TestResultRow) =>
            `${r.userId},${r.email},"${r.testName}",${r.score},${r.attemptNumber},${r.date},${r.status}`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);

        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "test_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return <div className="p-6 text-center">Loading report...</div>;
    if (error) return <div className="p-6 text-center text-red-600">Error loading report</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="text-blue-600" />
                    Raport Wyników Testów
                </h2>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                >
                    <Download size={18} />
                    Eksportuj do .csv
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pracownik</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Próba</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wynik</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {results.map((row: TestResultRow) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{row.email}</div>
                                    <div className="text-xs text-gray-500">ID: {row.userId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {row.testName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {row.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                                    {row.attemptNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    {row.score}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${row.status === 'passed' ? 'bg-green-100 text-green-800' :
                                            row.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {row.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
