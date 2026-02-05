import React from 'react';
import { Chapter } from './ChapterList';

interface VideoEditorProps {
    chapter: Chapter;
    onChange: (updatedChapter: Chapter) => void;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({ chapter, onChange }) => {
    const handleChange = (field: string, value: any) => {
        onChange({
            ...chapter,
            [field]: value,
        });
    };

    const handleContentChange = (field: string, value: any) => {
        onChange({
            ...chapter,
            content: {
                ...chapter.content,
                [field]: value,
            },
        });
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-sm rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                Edit Video Chapter
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chapter Title
                    </label>
                    <input
                        type="text"
                        value={chapter.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Introduction to Safety"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video URL (YouTube, Vimeo, or direct link)
                    </label>
                    <input
                        type="text"
                        value={chapter.content?.videoUrl || ''}
                        onChange={(e) => handleContentChange('videoUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Paste the full URL of the video resource.
                    </p>
                </div>

                {chapter.content?.videoUrl && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                            {/* Simple iframe for demo, production would need more robust embed handling */}
                            <iframe
                                src={chapter.content.videoUrl.replace('watch?v=', 'embed/')}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                                title="Video Preview"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
