import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ChapterNavigation } from '../components/ChapterNavigation';
import { VideoPlayer } from '../components/VideoPlayer';
import { PlayerChapter, courseService } from '@/lib/courseService';
import { SlideViewer } from '../components/SlideViewer';
import { QuizPlayer } from '../components/QuizPlayer';
import { DocumentViewer } from '../components/DocumentViewer';
import { Menu, ArrowLeft } from 'lucide-react';

export const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState<any>(null);
    const [chapters, setChapters] = useState<PlayerChapter[]>([]);
    const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isCourseFinished, setIsCourseFinished] = useState(false);

    useEffect(() => {
        if (courseId && user) {
            loadCourseData();
        }
    }, [courseId, user]);

    const loadCourseData = async () => {
        setLoading(true);
        try {
            if (!courseId || !user) return;

            // 1. Fetch Course Info
            const courseData = await courseService.getCourse(courseId);
            if (!courseData) throw new Error('Course not found');
            setCourse(courseData);

            // 2. Fetch Chapters
            const chaptersData = await courseService.getChapters(courseId);

            // 3. Fetch User Progress (returns map with status + answers)
            const progressData = await courseService.getUserProgress(user.id, courseId);

            // 4. Calculate Statuses
            const processedChapters: PlayerChapter[] = chaptersData.map((ch: any, index: number) => {
                const chapterProgress = progressData[ch.id];
                const status = chapterProgress ? chapterProgress.status : 'locked';

                // Logic to unlock:
                // If it is explicitly marked as 'completed' or 'unlocked', use that.
                // Otherwise, check previous chapter.

                // However, the service returns the status directly if we had a smarter backend.
                // For now, let's keep the frontend logic to "unlock" next chapters if previous is done,
                // in case the backend only stores "completed".

                let computedStatus = status;

                // First chapter is always unlocked if not completed
                if (index === 0 && status === 'locked') {
                    computedStatus = 'unlocked';
                }

                // If previous is completed, this one is unlocked (if not already completed)
                if (index > 0) {
                    const prevChapterId = chaptersData[index - 1].id;
                    const prevProgress = progressData[prevChapterId];
                    const prevStatus = prevProgress ? prevProgress.status : 'locked';

                    if (prevStatus === 'completed' && status === 'locked') {
                        computedStatus = 'unlocked';
                    }
                }

                // Attach saved answers to the chapter object in memory if needed, or we can look it up in render.
                // Let's attach it to 'content' effectively or keep it separate.
                // Ideally, we shouldn't mutate 'ch' like this if it's strict, but 'processedChapters' is PlayerChapter.
                // Let's add 'answers' to our local 'PlayerChapter' or just lookup in render.
                // Lookup in render is safer. We need to store 'progressData' in state? 
                // Or just map it here.
                return {
                    ...ch,
                    status: computedStatus,
                    savedAnswers: chapterProgress?.answers
                };
            });

            setChapters(processedChapters);

            // Set Initial Chapter (First Unlocked)
            if (!currentChapterId) {
                // Find first non-completed or last unlocked
                // Usually user wants to continue where they left off
                const firstIncomplete = processedChapters.find(c => c.status !== 'completed' && c.status !== 'locked');
                if (firstIncomplete) {
                    setCurrentChapterId(firstIncomplete.id);
                } else if (processedChapters.length > 0) {
                    // All completed, show first
                    setCurrentChapterId(processedChapters[0].id);
                }
            } else {
                // Re-verify current chapter is not locked (e.g. if we just loaded)
                const current = processedChapters.find(c => c.id === currentChapterId);
                if (current && current.status === 'locked') {
                    // Redirect to safe chapter
                    const firstIncomplete = processedChapters.find(c => c.status !== 'completed' && c.status !== 'locked');
                    setCurrentChapterId(firstIncomplete ? firstIncomplete.id : processedChapters[0].id);
                }
            }

        } catch (error) {
            console.error('Error loading course:', error);
            // Handle error
        } finally {
            setLoading(false);
        }
    };

    const handleChapterSave = async (score?: number, answers?: any[]) => {
        if (!currentChapterId || !user || !courseId) return;
        try {
            console.log('[CoursePlayerPage] handleChapterSave called with:', { score, answers });
            // Just update DB, don't trigger re-fetch or navigation yet
            await courseService.updateChapterProgress(user.id, courseId, currentChapterId, 'completed', score, answers);
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const handleChapterComplete = async (score?: number) => {
        if (!currentChapterId || !user || !courseId) return;

        try {
            // Update DB (idempotent, ensures it's saved if onSave wasn't called or failed)
            await courseService.updateChapterProgress(user.id, courseId, currentChapterId, 'completed', score);

            // Reload data to update locks
            await loadCourseData();

            // Auto-advance to next chapter if exists
            const currentIndex = chapters.findIndex(c => c.id === currentChapterId);
            if (currentIndex < chapters.length - 1) {
                const nextChapter = chapters[currentIndex + 1];
                // Local check: it SHOULD be unlocking now, but we just reloaded data so it should be fine.
                // We set current ID to next
                setCurrentChapterId(nextChapter.id);
            } else {
                // Course Last Chapter Finished
                // Instead of auto-completing, we set the state to show the manual finish button
                setIsCourseFinished(true);
                setCurrentChapterId(null); // Clear current chapter to show the finish screen
            }

        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const finishCourse = async () => {
        if (!user || !courseId) return;
        try {
            await courseService.updateCourseStatus(user.id, courseId, 'completed');
            if (confirm('Congratulations! You have completed the course. Return to dashboard?')) {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error finishing course:', error);
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Loading Course...</div>;
    }

    if (!course) {
        return <div className="h-screen flex items-center justify-center">Course not found.</div>;
    }

    const currentChapter = chapters.find(c => c.id === currentChapterId);

    // Find the raw content from the original fetch (we merged it in processedChapters but only kept specific fields in interface)
    // Actually, in step 2 I mapped 'chaptersData' which has 'content'.
    // `processedChapters` uses spread `...ch` so it HAS content.
    // I need to cast it or add content to PlayerChapter interface if I want TS safety, but JS runtime is fine.
    const activeContent = (currentChapter as any)?.content;

    return (
        <div className="flex h-screen bg-gray-50 flex-col">
            {/* Top Bar */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h1 className="font-bold text-gray-800 text-lg">{course.title}</h1>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-gray-100 rounded-md md:hidden"
                >
                    <Menu size={24} />
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block h-full z-10 transition-all`}>
                    <ChapterNavigation
                        chapters={chapters}
                        currentChapterId={currentChapterId || ''}
                        onSelectChapter={(id) => {
                            setIsCourseFinished(false);
                            setCurrentChapterId(id);
                        }}
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {isCourseFinished ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <div className="text-center space-y-4">
                                <h2 className="text-4xl font-bold text-gray-800">🎉 Course Completed!</h2>
                                <p className="text-xl text-gray-600 max-w-lg">
                                    You have finished all the chapters in this course. Click the button below to officially complete the course.
                                </p>
                            </div>
                            <button
                                onClick={finishCourse}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-xl shadow-lg transition-transform hover:scale-105"
                            >
                                End Course
                            </button>
                        </div>
                    ) : (
                        currentChapter ? (
                            <>
                                {/* Chapter Title Header inside content */}
                                {/* Player Components */}
                                {currentChapter.type === 'video' && (
                                    <VideoPlayer content={activeContent} onComplete={() => handleChapterComplete()} />
                                )}
                                {currentChapter.type === 'slide' && (
                                    <SlideViewer content={activeContent} onComplete={() => handleChapterComplete()} />
                                )}
                                {currentChapter.type === 'quiz' && (
                                    <QuizPlayer
                                        content={activeContent}
                                        onComplete={(score) => handleChapterComplete(score)}
                                        onSave={(score, answers) => handleChapterSave(score, answers)}
                                        initialAnswers={(currentChapter as any).savedAnswers}
                                    />
                                )}
                                {currentChapter.type === 'document' && (
                                    <DocumentViewer
                                        content={activeContent}
                                        onComplete={() => handleChapterComplete()}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Select a chapter to begin
                            </div>
                        )
                    )}
                </main>
            </div>
        </div>
    );
};

