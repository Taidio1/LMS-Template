import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Home, ChevronRight, Loader2 } from 'lucide-react';
import { ProgramCourseCard } from '../components/ProgramCourseCard';
import { api } from '@/services/api';

export const ProgramDetailsPage = () => {
    const { programId } = useParams<{ programId: string }>();
    const navigate = useNavigate();

    const { data: courses, isLoading, error } = useQuery({
        queryKey: ['my-courses'],
        queryFn: () => api.courses.getMyCourses(),
    });

    const categoryCourses = (courses || []).filter(c =>
        String(c.course.categoryId) === programId ||
        // Fallback for string IDs if any, or if programId was actually a business unit name
        c.course.categoryName === programId ||
        c.course.category === programId
    );

    const categoryTitle = categoryCourses.length > 0
        ? (categoryCourses[0].course.categoryName || 'Category')
        : 'Program';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            </div>
        );
    }

    if (error || (!isLoading && categoryCourses.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold text-slate-800">Category Not Found</h2>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sky-600 hover:text-sky-800 font-medium"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 font-bold text-slate-700 hover:text-sky-700 transition-colors"
                >
                    <div className="p-1.5 bg-cyan-100 rounded-md text-cyan-700">
                        <Home className="h-4 w-4" />
                    </div>
                    <span className="text-lg">Home</span>
                </button>
                <span className="text-slate-300">|</span>
                <span className="text-cyan-500 font-medium text-lg">{categoryTitle}</span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
                <span className="text-slate-300 text-lg">...</span>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryCourses.map((assignment) => (
                    <ProgramCourseCard
                        key={assignment.id}
                        assignment={{ ...assignment, isLocked: false }} // Mocking isLocked as false or deriving it
                    />
                ))}
            </div>
        </div>
    );
};
