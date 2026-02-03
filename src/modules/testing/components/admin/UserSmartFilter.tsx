import React, { useState, useEffect } from 'react';
import { Search, Calendar, Building2, X } from 'lucide-react';

export interface FilterState {
    searchQuery: string;
    dateFrom: string;
    dateTo: string;
    department: string;
}

interface UserSmartFilterProps {
    onFilterChange: (filters: FilterState) => void;
}

export const UserSmartFilter: React.FC<UserSmartFilterProps> = ({ onFilterChange }) => {
    const [filters, setFilters] = useState<FilterState>({
        searchQuery: '',
        dateFrom: '',
        dateTo: '',
        department: ''
    });

    const handleChange = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const cleared = { searchQuery: '', dateFrom: '', dateTo: '', department: '' };
        setFilters(cleared);
        onFilterChange(cleared);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Szukaj użytkownika..."
                        value={filters.searchQuery}
                        onChange={(e) => handleChange('searchQuery', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Date From */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleChange('dateFrom', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-600"
                    />
                </div>

                {/* Date To */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleChange('dateTo', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-600"
                    />
                </div>

                {/* Department (Mock Select) */}
                <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <select
                        value={filters.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-600 appearance-none bg-white"
                    >
                        <option value="">Wszystkie działy</option>
                        <option value="IT">IT / Development</option>
                        <option value="HR">Human Resources</option>
                        <option value="SALES">Sales & Marketing</option>
                        <option value="X">Logistics</option>
                    </select>
                </div>
            </div>

            {(filters.searchQuery || filters.dateFrom || filters.department) && (
                <div className="mt-3 flex justify-end">
                    <button
                        onClick={clearFilters}
                        className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                        <X size={14} /> Wyczyść filtry
                    </button>
                </div>
            )}
        </div>
    );
};
