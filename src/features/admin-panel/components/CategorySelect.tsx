import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CategoryResponse } from '@/services/api';

interface CategorySelectProps {
    selectedCategoryId?: number;
    onChange: (categoryId: number | undefined) => void;
}

export const CategorySelect = ({ selectedCategoryId, onChange }: CategorySelectProps) => {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: api.categories.getAll,
    });

    const createMutation = useMutation({
        mutationFn: api.categories.create,
        onSuccess: (newCategory) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            onChange(newCategory.id);
            setIsCreating(false);
            setNewCategoryName('');
            setError(null);
        },
        onError: () => {
            setError('Nie udało się utworzyć kategorii');
        },
    });

    const handleCreate = () => {
        if (!newCategoryName.trim()) return;
        createMutation.mutate(newCategoryName);
    };

    if (isLoading) return <div className="h-10 bg-gray-100 rounded animate-pulse" />;

    return (
        <div className="space-y-2">
            {!isCreating ? (
                <div className="flex gap-2">
                    <select
                        value={selectedCategoryId || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'new') {
                                setIsCreating(true);
                            } else {
                                onChange(val ? parseInt(val) : undefined);
                            }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">-- Wybierz kategorię --</option>
                        {categories.map((cat: CategoryResponse) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                        <option value="new" className="font-semibold text-blue-600">
                            + Dodaj nową kategorię
                        </option>
                    </select>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nazwa nowej kategorii"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={!newCategoryName.trim() || createMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            Dodaj
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreating(false);
                                setNewCategoryName('');
                                setError(null);
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Anuluj
                        </button>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
            )}
        </div>
    );
};
