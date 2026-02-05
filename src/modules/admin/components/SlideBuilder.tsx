import React from 'react';
import { Chapter } from './ChapterList';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface SlideBuilderProps {
    chapter: Chapter;
    onChange: (updatedChapter: Chapter) => void;
}

import { Slide } from '../../../shared/types/slide';

export const SlideBuilder: React.FC<SlideBuilderProps> = ({ chapter, onChange }) => {
    const slides: Slide[] = chapter.content?.slides || [];

    const handleUpdate = (updatedContent: any) => {
        onChange({
            ...chapter,
            content: updatedContent,
        });
    };

    const addSlide = () => {
        const newSlide: Slide = {
            id: crypto.randomUUID(),
            title: `Slide ${slides.length + 1}`,
            text: '',
        };
        handleUpdate({ ...chapter.content, slides: [...slides, newSlide] });
    };

    const removeSlide = (id: string) => {
        handleUpdate({ ...chapter.content, slides: slides.filter(s => s.id !== id) });
    };

    const updateSlide = (id: string, field: keyof Slide, value: string) => {
        handleUpdate({
            ...chapter.content,
            slides: slides.map(s => s.id === id ? { ...s, [field]: value } : s),
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Slides Chapter</h2>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chapter Title
                </label>
                <input
                    type="text"
                    value={chapter.title}
                    onChange={(e) => onChange({ ...chapter, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="space-y-8">
                {slides.map((slide, index) => (
                    <div key={slide.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50 relative">
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => removeSlide(slide.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Slide {index + 1}</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Slide Title</label>
                                    <input
                                        type="text"
                                        value={slide.title}
                                        onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Content Text</label>
                                    <textarea
                                        value={slide.text}
                                        onChange={(e) => updateSlide(slide.id, 'text', e.target.value)}
                                        rows={5}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL (Optional)</label>
                                    <input
                                        type="text"
                                        value={slide.imageUrl || ''}
                                        onChange={(e) => updateSlide(slide.id, 'imageUrl', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 mb-2"
                                        placeholder="https://..."
                                    />
                                    {slide.imageUrl ? (
                                        <div className="w-full h-40 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                                            <img src={slide.imageUrl} alt="Preview" className="h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-40 bg-gray-100 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400">
                                            <ImageIcon size={24} className="mb-2" />
                                            <span className="text-xs">No image provided</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addSlide}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add New Slide</span>
                </button>
            </div>
        </div>
    );
};
