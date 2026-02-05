import { AdminCourseResponse } from '@/services/api';

interface CourseTableProps {
    courses: AdminCourseResponse[];
    selectedCourseId: string | null;
    onSelectCourse: (id: string | null) => void;
    onPublish: (id: string) => void;
    onArchive: (id: string) => void;
    onRestore: (id: string) => void;
    onDelete: (id: string) => void;
}

const StatusBadge = ({ status }: { status: AdminCourseResponse['status'] }) => {
    const styles = {
        draft: 'bg-yellow-100 text-yellow-800',
        published: 'bg-green-100 text-green-800',
        archived: 'bg-gray-100 text-gray-800',
    };

    const labels = {
        draft: 'Szkic',
        published: 'Opublikowany',
        archived: 'Zarchiwizowany',
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

export const CourseTable = ({
    courses,
    selectedCourseId,
    onSelectCourse,
    onPublish,
    onArchive,
    onRestore,
    onDelete,
}: CourseTableProps) => {
    if (courses.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-500">Brak kursów do wyświetlenia</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nazwa kursu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kategoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Termin (dni)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Przypisania
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Akcje
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {courses.map((course) => (
                        <tr
                            key={course.id}
                            onClick={() => onSelectCourse(course.id)}
                            className={`cursor-pointer transition-colors ${selectedCourseId === course.id
                                ? 'bg-blue-50'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                                        {course.title.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{course.title}</div>
                                        <div className="text-sm text-gray-500">{course.version}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {course.category || '-'}
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={course.status} />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {course.deadlineDays} dni
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {course.assignmentCount}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    {course.status === 'draft' && (
                                        <button
                                            onClick={() => onPublish(course.id)}
                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Opublikuj"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    )}
                                    {course.status === 'archived' && (
                                        <button
                                            onClick={() => onRestore(course.id)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Przywróć"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </button>
                                    )}
                                    {course.status === 'published' && (
                                        <button
                                            onClick={() => onArchive(course.id)}
                                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Archiwizuj"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                            </svg>
                                        </button>
                                    )}
                                    {course.assignmentCount === 0 && (
                                        <button
                                            onClick={() => onDelete(course.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Usuń"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
