import React from 'react';
import { Clock, Layers, Bookmark, Flag, Lock } from 'lucide-react';
import { ProgramCourseAssignment } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface ProgramCourseCardProps {
    assignment: ProgramCourseAssignment;
}

export const ProgramCourseCard: React.FC<ProgramCourseCardProps> = ({ assignment }) => {
    const navigate = useNavigate();
    const { course, status, isLocked } = assignment;

    // Calculate progress percentage (placeholder, would come from API)
    const progress = 0; // Default, since API doesn't send this yet

    // Helper to determine status badge
    const getStatusConfig = () => {
        if (isLocked) {
            return {
                label: 'Locked',
                icon: Lock,
                className: 'text-slate-400'
            };
        }
        if (status === 'completed') {
            return {
                label: '100% Completed',
                icon: Flag,
                className: 'text-slate-700'
            };
        } else if (status === 'in_progress') {
            return {
                label: `${progress}% Completion`,
                icon: Flag,
                className: 'text-slate-700'
            };
        } else {
            return {
                label: 'Not started',
                icon: Flag,
                className: 'text-slate-700'
            };
        }
    };

    const getButtonText = () => {
        if (isLocked) return 'Locked';
        if (status === 'completed') return 'View Training';
        if (status === 'in_progress') return 'Continue Training';
        return 'Take Training';
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    // Mock content count since mock data is empty
    const contentCount = 15;

    // Duration display
    const durationDisplay = course.deadlineDays ? `${course.deadlineDays} days` : 'N/A';

    return (
        <div className={`group flex flex-col bg-white rounded-none shadow-sm border border-slate-200 overflow-hidden h-full ${!isLocked ? 'hover:shadow-md' : 'opacity-75'} transition-shadow`}>
            {/* Image Section */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <div className="h-full w-full flex items-center justify-center bg-slate-200 text-slate-400">
                    <Layers className="h-12 w-12" />
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-sm shadow-sm">
                    <StatusIcon className={`h-4 w-4 ${statusConfig.className}`} />
                    <span className="text-xs font-semibold text-slate-700">{statusConfig.label}</span>
                </div>

                {/* Bookmark Button */}
                {!isLocked && (
                    <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-sm text-slate-400 hover:text-sky-600 transition-colors shadow-sm">
                        <Bookmark className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-grow p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 min-h-[3.5rem]">
                    {course.title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-xs text-slate-500 font-medium">
                        #{course.category || 'training'}
                    </span>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-6 mt-auto border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-sky-300" />
                        <span>{contentCount} Contents</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-sky-600" />
                        <span>{durationDisplay}</span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => !isLocked && navigate(`/courses/${course.id}`)}
                    disabled={isLocked}
                    className={`w-full py-2.5 px-4 text-sm font-semibold rounded-sm transition-colors ${isLocked
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-cyan-50 hover:bg-cyan-100 text-slate-700'
                        }`}
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
};
