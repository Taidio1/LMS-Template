import React from 'react';

interface VideoPlayerProps {
    content: any;
    onComplete: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ content, onComplete }) => {
    // In a real implementation, we would listen to video 'ended' events
    // For this demo, user clicks 'Next' or we simulate it.

    return (
        <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-8">
                {content.videoUrl ? (
                    <iframe
                        src={content.videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Course Video"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                        Video Unavailable
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onComplete}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-transform hover:scale-105"
                >
                    Mark as Watched & Continue
                </button>
            </div>
        </div>
    );
};
