import React, { useState } from 'react';
import { TestAssignmentPanel } from '../components/admin/TestAssignmentPanel';
import { TestResultsView } from '../components/admin/TestResultsView';
import { TestBuilder } from '../components/admin/TestBuilder';
import { TestListView } from '../components/admin/TestListView';
import { LayoutList, BookOpenCheck, Edit3, Database } from 'lucide-react';

export const TestingAdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'assignments' | 'results' | 'builder'>('assignments');

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Zarządzanie Testami</h1>
                <p className="text-gray-500 mt-2">Przypisuj egzaminy i sprawdzaj wyniki pracowników.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
                <button
                    onClick={() => setActiveTab('assignments')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors
                        ${activeTab === 'assignments'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <BookOpenCheck size={18} />
                    Przydzielanie Testów
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors
                        ${activeTab === 'results'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <LayoutList size={18} />
                    Rapory i Wyniki
                </button>
                <button
                    onClick={() => setActiveTab('builder')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors
                        ${activeTab === 'builder'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Edit3 size={18} />
                    Kreator Testów
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors
                        ${activeTab === 'list'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Database size={18} />
                    Baza Testów
                </button>
            </div>

            {/* Content */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'assignments' && <TestAssignmentPanel />}
                {activeTab === 'results' && <TestResultsView />}
                {activeTab === 'builder' && <TestBuilder />}
                {activeTab === 'list' && <TestListView />}
            </div>
        </div>
    );
};
