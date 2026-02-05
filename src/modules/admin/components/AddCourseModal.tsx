import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, CreateCourseRequest } from '@/services/api';
import { CategorySelect } from './CategorySelect';

interface AddCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCourseCreated: () => void;
}

export const AddCourseModal = ({ isOpen, onClose, onCourseCreated }: AddCourseModalProps) => {
    const [formData, setFormData] = useState<CreateCourseRequest>({
        title: '',
        description: '',
        categoryId: undefined,
        department: '',
        deadlineDays: 14,
        version: 'v1',
    });
    const [error, setError] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: api.courses.create,
        onSuccess: () => {
            onCourseCreated();
            resetForm();
        },
        onError: (err: Error) => {
            setError(err.message || 'Nie udało się utworzyć kursu');
        },
    });

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            categoryId: undefined,
            department: '',
            deadlineDays: 14,
            version: 'v1',
        });
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }
        setError(null);
        createMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'deadlineDays' ? parseInt(value) || 0 : value
        }));
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-lg w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Add course</h2>
                    <button
                        onClick={handleClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Course name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Course description"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <CategorySelect
                                selectedCategoryId={formData.categoryId}
                                onChange={(id) => setFormData(prev => ({ ...prev, categoryId: id }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="np. Marketing"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deadline (days)
                            </label>
                            <input
                                type="number"
                                name="deadlineDays"
                                value={formData.deadlineDays}
                                onChange={handleChange}
                                min={1}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Version
                            </label>
                            <input
                                type="text"
                                name="version"
                                value={formData.version}
                                onChange={handleChange}
                                placeholder="v1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                        <strong>Info:</strong> Course will be created as a draft. After adding content you will be able to publish it.
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
