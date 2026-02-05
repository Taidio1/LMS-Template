import React from 'react';
import { CheckCircle, Lock, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { PlayerChapter } from '@/lib/courseService';

interface ChapterNavigationProps {
    chapters: PlayerChapter[];
    currentChapterId: string;
    onSelectChapter: (id: string) => void;
}

export const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
    chapters,
    currentChapterId,
    onSelectChapter,
}) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle size={16} />;
            case 'slide': return <FileText size={16} />;
            case 'quiz': return <HelpCircle size={16} />;
            default: return <FileText size={16} />;
        }
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-lg">Course Content</h3>
                <p className="text-xs text-gray-400 mt-1">{chapters.filter(c => c.status === 'completed').length} / {chapters.length} Completed</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                {chapters.map((chapter) => {
                    const isActive = currentChapterId === chapter.id;
                    const isLocked = chapter.status === 'locked';

                    return (
                        <button
                            key={chapter.id}
                            disabled={isLocked}
                            onClick={() => onSelectChapter(chapter.id)}
                            className={`w-full flex items-center p-4 border-l-4 transition-all text-left group ${isActive
                                ? 'bg-blue-50 border-blue-500'
                                : 'border-transparent hover:bg-gray-50'
                                } ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                            <div className={`mr-3 ${isActive ? 'text-blue-500' : 'text-gray-400'
                                }`}>
                                {chapter.status === 'completed' ? (
                                    <CheckCircle size={20} className="text-green-500" />
                                ) : isLocked ? (
                                    <Lock size={20} />
                                ) : (
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-blue-500' : 'border-gray-300'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-transparent'}`} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-700'
                                    }`}>
                                    {chapter.title}
                                </p>
                                <div className="flex items-center mt-1 space-x-2">
                                    <div className="flex items-center text-xs text-gray-500 space-x-1">
                                        {getIcon(chapter.type)}
                                        <span className="capitalize">{chapter.type}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div >
    );
};
