import React from 'react';
import { Clock, AlertCircle, FileText, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { CourseAssignment } from '@/types';
import { useCourseTimer } from '@/hooks/useCourseTimer';

interface CourseCardProps {
    assignment: CourseAssignment;
    courseTitle: string;
    courseDescription?: string;
    isLocked?: boolean;
    // New props from API
    secondsRemaining?: number;
    isOverdue?: boolean;
    isUrgent?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
    assignment,
    courseTitle,
    courseDescription,
    isLocked,
    secondsRemaining,
    isOverdue: apiIsOverdue,
    isUrgent: apiIsUrgent
}) => {
    // Use the enhanced timer hook with API-provided seconds if available
    const timer = useCourseTimer(assignment.deadline || new Date(), secondsRemaining);

    // Use API-provided values if available, otherwise calculate from timer
    const isOverdue = apiIsOverdue ?? (assignment.status === 'overdue' || timer.isOverdue);
    const isUrgent = apiIsUrgent ?? timer.isUrgent;

    const getStatusColor = () => {
        if (isLocked) return 'bg-gray-100 text-gray-500 border-gray-200';
        if (assignment.status === 'completed') return 'bg-green-100 text-green-700 border-green-200';
        if (isOverdue) return 'bg-red-100 text-red-700 border-red-200';
        if (isUrgent) return 'bg-orange-100 text-orange-700 border-orange-200';
        if (assignment.status === 'in_progress') return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusText = () => {
        if (isLocked) return 'Locked';
        if (assignment.status === 'completed') return 'Completed';
        if (isOverdue) return 'Overdue';
        if (isUrgent) return 'Due Soon';
        if (assignment.status === 'in_progress') return 'In Progress';
        return 'Not Started';
    };

    const getIcon = () => {
        if (isLocked) return <Lock className="w-5 h-5 text-gray-400" />;
        if (assignment.status === 'completed') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        if (isOverdue) return <AlertCircle className="w-5 h-5 text-red-500" />;
        if (isUrgent) return <AlertTriangle className="w-5 h-5 text-orange-500" />;

        return (
            <div className="text-sm font-medium text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {timer.formattedTime}
            </div>
        );
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 flex flex-col h-full ${isLocked ? 'opacity-75 bg-gray-50' : ''}`}>
            <div className="flex justify-between items-start mb-3">
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
                    {getStatusText()}
                </div>
                {getIcon()}
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{courseTitle}</h3>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                {courseDescription || 'No description available.'}
            </p>

            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                <div className="flex items-center text-gray-500">
                    <FileText className="w-4 h-4 mr-1.5" />
                    <span>Course Content</span>
                </div>
                {assignment.status !== 'completed' && !isOverdue && !isLocked && (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${isUrgent
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-600 bg-gray-50'
                        }`}>
                        {isUrgent ? `Urgent: ${timer.formattedTime}` : `Due in ${timer.days}d`}
                    </span>
                )}
            </div>
        </div>
    );
};
