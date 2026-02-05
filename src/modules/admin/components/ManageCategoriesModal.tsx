
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CategoryResponse } from '@/services/api';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface ManageCategoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ManageCategoriesModal = ({ isOpen, onClose }: ManageCategoriesModalProps) => {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: api.categories.getAll,
    });

    const createMutation = useMutation({
        mutationFn: api.categories.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setNewCategoryName('');
            setIsCreating(false);
            setError(null);
        },
        onError: () => setError('Nie udało się utworzyć kategorii'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, name }: { id: number; name: string }) =>
            api.categories.update(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setEditingId(null);
            setEditName('');
            setError(null);
        },
        onError: () => setError('Nie udało się zaktualizować kategorii'),
    });

    const deleteMutation = useMutation({
        mutationFn: api.categories.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setError(null);
            setShowSuccessModal(true);
        },
        onError: () => setError('Nie udało się usunąć kategorii'),
    });

    const handleDelete = (id: number) => {
        setCategoryToDelete(id);
    };

    const handleUpdate = (id: number) => {
        if (!editName.trim()) return;
        updateMutation.mutate({ id, name: editName });
    };

    const handleCreate = () => {
        if (!newCategoryName.trim()) return;
        createMutation.mutate(newCategoryName);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Zarządzaj Kategoriami</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Add New Category */}
                    <div className="mb-6">
                        {!isCreating ? (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Utwórz nową kategorię
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Nazwa kategorii"
                                    className="flex-1 px-3 py-2 border border-blue-500 rounded-lg focus:outline-none"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                />
                                <button
                                    onClick={handleCreate}
                                    disabled={!newCategoryName.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Dodaj
                                </button>
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Anuluj
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Category List */}
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {categories.map((category: CategoryResponse) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                                >
                                    {editingId === category.id ? (
                                        <div className="flex gap-2 flex-1 mr-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdate(category.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                            <button
                                                onClick={() => handleUpdate(category.id)}
                                                className="text-green-600 hover:text-green-700 p-1"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="text-gray-400 hover:text-gray-600 p-1"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="font-medium text-gray-700">{category.name}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(category.id);
                                                        setEditName(category.name);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Edytuj"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Usuń"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {categories.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    Brak utworzonych kategorii
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Zamknij
                    </button>
                </div>
            </div>


            <ConfirmationModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={() => {
                    if (categoryToDelete) deleteMutation.mutate(categoryToDelete);
                }}
                title="Usuwanie kategorii"
                message="Czy na pewno chcesz usunąć tę kategorię? Kursy przypisane do niej stracą przypisanie."
                isDestructive={true}
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Sukces"
                message="Kategoria została pomyślnie usunięta."
            />
        </div >
    );
};
