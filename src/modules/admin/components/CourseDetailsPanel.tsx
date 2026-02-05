import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, AdminCourseResponse, UpdateCourseRequest } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { CategorySelect } from './CategorySelect';

interface CourseDetailsPanelProps {
    course: AdminCourseResponse;
    onClose: () => void;
    onUpdate: () => void;
    onPublish: () => void;
    onArchive: () => void;
}

export const CourseDetailsPanel = ({
    course,
    onClose,
    onUpdate,
    onPublish,
    onArchive,
}: CourseDetailsPanelProps) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateCourseRequest>({
        title: course.title,
        description: course.description || '',
        categoryId: course.categoryId,
        department: course.department || '',
        deadlineDays: course.deadlineDays,
        version: course.version,
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateCourseRequest) => api.courses.update(course.id, data),
        onSuccess: () => {
            onUpdate();
            setIsEditing(false);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'deadlineDays' ? parseInt(value) || 0 : value
        }));
    };

    return (
        <div className="w-96 bg-white border-l border-gray-200 h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Szczegóły kursu</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Course Avatar */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                        {course.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500">{course.version}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mb-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${course.status === 'published' ? 'bg-green-100 text-green-800' :
                        course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {course.status === 'published' ? 'Opublikowany' :
                            course.status === 'draft' ? 'Szkic' : 'Zarchiwizowany'}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mb-6">
                    {course.status === 'draft' && (
                        <button
                            onClick={onPublish}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                            Opublikuj
                        </button>
                    )}
                    {course.status === 'published' && (
                        <button
                            onClick={onArchive}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                            Archiwizuj
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/admin/course-editor/${course.id}`)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        Edytuj zawartość
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tytuł
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opis
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kategoria
                        </label>
                        {isEditing ? (
                            <CategorySelect
                                selectedCategoryId={formData.categoryId}
                                onChange={(id) => setFormData(prev => ({ ...prev, categoryId: id }))}
                            />
                        ) : (
                            <input
                                type="text"
                                disabled
                                value={course.categoryName || course.category || '-'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dział
                        </label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Termin na ukończenie (dni)
                        </label>
                        <input
                            type="number"
                            name="deadlineDays"
                            value={formData.deadlineDays}
                            onChange={handleChange}
                            disabled={!isEditing}
                            min={0}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Wersja
                        </label>
                        <input
                            type="text"
                            name="version"
                            value={formData.version}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>

                    {/* Edit/Save buttons */}
                    <div className="flex gap-2 pt-4">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            title: course.title,
                                            description: course.description || '',
                                            categoryId: course.categoryId,
                                            department: course.department || '',
                                            deadlineDays: course.deadlineDays,
                                            version: course.version,
                                        });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {updateMutation.isPending ? 'Zapisywanie...' : 'Zapisz'}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Edytuj dane
                            </button>
                        )}
                    </div>
                </form>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Statystyki</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Przypisania:</span>
                            <span className="font-medium text-gray-900">{course.assignmentCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Utworzony przez:</span>
                            <span className="font-medium text-gray-900">{course.owner || 'Nieznany'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Utworzono:</span>
                            <span className="font-medium text-gray-900">
                                {new Date(course.createdAt).toLocaleDateString('pl-PL')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
