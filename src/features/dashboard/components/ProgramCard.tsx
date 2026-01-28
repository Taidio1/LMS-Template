import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { ProgramResponse } from '@/services/api';

interface ProgramCardProps {
    program: ProgramResponse & { isOverdue?: boolean };
    onStart: (programId: string) => void;
}

export const ProgramCard = ({ program, onStart }: ProgramCardProps) => {
    const progressPercentage = program.progressPercentage || 0;
    const isComplete = progressPercentage === 100;
    const isOverdue = program.isOverdue;

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md">
            {/* Image Section */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img
                    src={program.image}
                    alt={program.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {isComplete && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Complete
                    </div>
                )}
                {!isComplete && isOverdue && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Overdue
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-xl text-slate-900 group-hover:text-sky-700 transition-colors">
                            {program.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {program.businessUnit}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{program.completedCourses} of {program.totalCourses} completed</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${isOverdue && !isComplete ? 'bg-red-500' : 'bg-sky-600'}`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                <div className="mt-4 border-b border-slate-100"></div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-500">
                        <BookOpen className="mr-2 h-4 w-4" />
                        {program.totalCourses} courses
                    </div>
                </div>

                <button
                    onClick={() => onStart(program.id)}
                    className={`mt-6 w-full rounded-lg py-3 text-sm font-semibold transition-colors ${isOverdue && !isComplete
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                        }`}
                >
                    {isComplete ? 'Review Courses' : 'Continue Learning'}
                </button>
            </div>
        </div>
    );
};
