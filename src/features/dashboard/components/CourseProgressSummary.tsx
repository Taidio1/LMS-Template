import React from 'react';
import { PieChart, ListChecks } from 'lucide-react';

interface CategoryProgress {
    category: string;
    total: number;
    completed: number;
    percentage: number;
}

interface CourseProgressSummaryProps {
    progressData: CategoryProgress[];
    totalCompleted: number;
    totalCourses: number;
}

export const CourseProgressSummary: React.FC<CourseProgressSummaryProps> = ({
    progressData,
    totalCompleted,
    totalCourses,
}) => {
    const overallPercentage = totalCourses > 0 ? Math.round((totalCompleted / totalCourses) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Overall Progress Card */}
            <div className="bg-gradient-to-br from-sky-900 to-sky-800 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between">
                <div>
                    <h3 className="text-sky-100 font-semibold mb-2 flex items-center">
                        <PieChart className="w-5 h-5 mr-2" />
                        Overall Progress
                    </h3>
                    <div className="text-4xl font-bold mb-1">{overallPercentage}%</div>
                    <p className="text-sky-200 text-sm">
                        {totalCompleted} / {totalCourses} courses completed
                    </p>
                </div>
                <div className="w-full bg-sky-950/50 rounded-full h-2 mt-4">
                    <div
                        className="bg-sky-400 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${overallPercentage}%` }}
                    />
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <ListChecks className="w-5 h-5 mr-2 text-sky-600" />
                    Progress by Category
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {progressData.slice(0, 4).map((item) => (
                        <div key={item.category} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium text-gray-700">{item.category}</span>
                                <span className="text-xs font-semibold text-gray-500">
                                    {item.completed}/{item.total}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-grow bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-500 ${item.percentage === 100 ? 'bg-green-500' : 'bg-sky-500'
                                            }`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-600 w-8 text-right">{item.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
