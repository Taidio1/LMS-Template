import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Slide } from '../../admin-panel/components/SlideBuilder';

interface SlideViewerProps {
    content: any;
    onComplete: () => void;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({ content, onComplete }) => {
    const slides: Slide[] = content.slides || [];
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [maxViewedIndex, setMaxViewedIndex] = useState(0);

    const currentSlide = slides[currentSlideIndex];
    const isLastSlide = currentSlideIndex === slides.length - 1;
    const canComplete = maxViewedIndex === slides.length - 1;

    useEffect(() => {
        if (currentSlideIndex > maxViewedIndex) {
            setMaxViewedIndex(currentSlideIndex);
        }
    }, [currentSlideIndex, maxViewedIndex]);

    const handleNext = () => {
        if (isLastSlide) {
            if (canComplete) onComplete();
        } else {
            setCurrentSlideIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
        }
    };

    if (slides.length === 0) return <div>No slides content.</div>;

    return (
        <div className="max-w-4xl mx-auto h-[600px] flex flex-col">
            {/* Slide Content */}
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 p-12 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />

                <h2 className="text-3xl font-bold text-gray-800 mb-8">{currentSlide.title}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="prose prose-lg text-gray-600">
                        {currentSlide.text}
                    </div>
                    {currentSlide.imageUrl && (
                        <div className="flex justify-center">
                            <img
                                src={currentSlide.imageUrl}
                                alt={currentSlide.title}
                                className="max-h-80 object-contain rounded-lg shadow-sm"
                            />
                        </div>
                    )}
                </div>

                <div className="absolute bottom-6 right-8 text-gray-300 font-mono text-xl">
                    {currentSlideIndex + 1} / {slides.length}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-8">
                <button
                    onClick={handlePrev}
                    disabled={currentSlideIndex === 0}
                    className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 font-medium transition-colors"
                >
                    <ChevronLeft size={24} />
                    <span>Previous</span>
                </button>

                <div className="flex space-x-2">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlideIndex
                                    ? 'w-8 bg-blue-500'
                                    : idx <= maxViewedIndex ? 'w-4 bg-blue-200' : 'w-2 bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold shadow-md transition-all ${isLastSlide
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {isLastSlide ? (
                        <>
                            <span>Complete Lesson</span>
                            <Check size={20} />
                        </>
                    ) : (
                        <>
                            <span>Next Slide</span>
                            <ChevronRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
