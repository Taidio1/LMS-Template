import React from 'react';
import { Trash2, Video, FileText, HelpCircle, File } from 'lucide-react';

export type ChapterType = 'video' | 'slide' | 'quiz' | 'document';

export interface Chapter {
    id: string;
    title: string;
    type: ChapterType;
    content: any;
    order: number;
}

interface ChapterListProps {
    chapters: Chapter[];
    selectedChapterId: string | null;
    onSelectChapter: (id: string) => void;
    onAddChapter: (type: ChapterType) => void;
    onDeleteChapter: (id: string) => void;
    onReorderChapters: (newOrder: Chapter[]) => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({
    chapters,
    selectedChapterId,
    onSelectChapter,
    onAddChapter,
    onDeleteChapter,
}) => {
    const getIcon = (type: ChapterType) => {
        switch (type) {
            case 'video': return <Video size={16} />;
            case 'slide': return <FileText size={16} />;
            case 'quiz': return <HelpCircle size={16} />;
            case 'document': return <File size={16} />;
        }
    };

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">Course Chapters</h3>
            </div>

            <div className="p-4 border-b border-gray-200 bg-white">
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">Add Chapter</p>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onAddChapter('video')}
                        className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded hover:bg-gray-50 hover:border-blue-300 transition-colors"
                        title="Add Video"
                    >
                        <Video size={16} className="text-blue-500 mb-1" />
                        <span className="text-[10px] text-gray-600">Video</span>
                    </button>
                    <button
                        onClick={() => onAddChapter('slide')}
                        className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded hover:bg-gray-50 hover:border-blue-300 transition-colors"
                        title="Add Slides"
                    >
                        <FileText size={16} className="text-green-500 mb-1" />
                        <span className="text-[10px] text-gray-600">Slides</span>
                    </button>
                    <button
                        onClick={() => onAddChapter('quiz')}
                        className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded hover:bg-gray-50 hover:border-blue-300 transition-colors"
                        title="Add Quiz"
                    >
                        <HelpCircle size={16} className="text-purple-500 mb-1" />
                        <span className="text-[10px] text-gray-600">Quiz</span>
                    </button>
                    <button
                        onClick={() => onAddChapter('document')}
                        className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded hover:bg-gray-50 hover:border-blue-300 transition-colors"
                        title="Add Document"
                    >
                        <File size={16} className="text-orange-500 mb-1" />
                        <span className="text-[10px] text-gray-600">Doc</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {chapters.map((chapter, index) => (
                    <div
                        key={chapter.id}
                        onClick={() => onSelectChapter(chapter.id)}
                        className={`p-3 rounded-md cursor-pointer flex items-center justify-between group transition-colors ${selectedChapterId === chapter.id
                            ? 'bg-white shadow-sm border border-blue-200'
                            : 'hover:bg-gray-100 border border-transparent'
                            }`}
                    >
                        <div className="flex items-center space-x-2 truncate">
                            <span className="text-gray-400 text-xs font-mono">{index + 1}</span>
                            <span className="text-gray-500">{getIcon(chapter.type)}</span>
                            <span className="text-sm font-medium text-gray-700 truncate">{chapter.title || 'Untitled'}</span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChapter(chapter.id);
                            }}
                            className="hidden group-hover:block p-1 text-gray-400 hover:text-red-500 rounded"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>


        </div>
    );
};
