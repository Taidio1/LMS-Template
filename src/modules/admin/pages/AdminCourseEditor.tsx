import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '@/lib/courseService';
import { ChapterList, Chapter } from '../components/ChapterList';
import { VideoEditor } from '../components/VideoEditor';
import { SlideBuilder } from '../components/SlideBuilder';
import { QuizBuilder } from '../components/QuizBuilder';
import { DocumentBuilder } from '../components/DocumentBuilder';
import { Save, ArrowLeft, Layout } from 'lucide-react';

export const AdminCourseEditor: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [courseTitle, setCourseTitle] = useState('');
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

    useEffect(() => {
        if (courseId && courseId !== 'new') {
            fetchCourseData(courseId);
        }
    }, [courseId]);

    const fetchCourseData = async (id: string) => {
        setIsLoading(true);
        try {
            // Fetch Course Details
            const course = await courseService.getCourse(id);
            if (course) {
                setCourseTitle(course.title);
            }

            // Fetch Chapters
            const fetchedChapters = await courseService.getChapters(id);
            setChapters(fetchedChapters || []);
            if (fetchedChapters && fetchedChapters.length > 0) {
                setSelectedChapterId(fetchedChapters[0].id);
            }

        } catch (error) {
            console.error('Error fetching course:', error);
            alert('Failed to load course data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddChapter = (type: 'video' | 'slide' | 'quiz' | 'document') => {
        const newChapter: Chapter = {
            id: crypto.randomUUID(),
            title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            type,
            content: {},
            order: chapters.length,
        };
        setChapters([...chapters, newChapter]);
        setSelectedChapterId(newChapter.id);
    };

    const handleDeleteChapter = (id: string) => {
        if (!confirm('Are you sure you want to delete this chapter?')) return;
        setChapters(chapters.filter(c => c.id !== id));
        if (selectedChapterId === id) {
            setSelectedChapterId(null);
        }
    };

    const handleUpdateChapter = (updatedChapter: Chapter) => {
        setChapters(chapters.map(c => c.id === updatedChapter.id ? updatedChapter : c));
    };

    const saveCourse = async () => {
        if (!courseTitle.trim()) {
            alert('Please enter a course title');
            return;
        }
        setIsLoading(true);
        try {
            // 1. Save Course Metadata
            const savedCourse = await courseService.saveCourse({
                id: courseId !== 'new' ? courseId : undefined,
                title: courseTitle,
            });

            // 2. Save Chapters
            // In a real app we might optimize this, but full replace is fine for now
            const indexChapters = chapters.map((c, idx) => ({ ...c, order: idx }));
            await courseService.saveChapters(savedCourse.id, indexChapters);

            alert('Course saved successfully!');
            if (courseId === 'new') {
                navigate(`/admin/course-editor/${savedCourse.id}`);
            } else {
                fetchCourseData(savedCourse.id);
            }

        } catch (error: any) {
            console.error('Error saving course:', error);
            alert(`Failed to save course: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedChapter = chapters.find(c => c.id === selectedChapterId);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Course Editor</span>
                        <input
                            type="text"
                            value={courseTitle}
                            onChange={(e) => setCourseTitle(e.target.value)}
                            placeholder="Enter Course Title..."
                            className="text-lg font-bold text-gray-800 border-none focus:ring-0 p-0 placeholder-gray-300"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={saveCourse}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        <span>{isLoading ? 'Saving...' : 'Save Course'}</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <ChapterList
                    chapters={chapters}
                    selectedChapterId={selectedChapterId}
                    onSelectChapter={setSelectedChapterId}
                    onAddChapter={handleAddChapter}
                    onDeleteChapter={handleDeleteChapter}
                    onReorderChapters={setChapters}
                />

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                    {selectedChapter ? (
                        <>
                            {selectedChapter.type === 'video' && (
                                <VideoEditor chapter={selectedChapter} onChange={handleUpdateChapter} />
                            )}
                            {selectedChapter.type === 'slide' && (
                                <SlideBuilder chapter={selectedChapter} onChange={handleUpdateChapter} />
                            )}
                            {selectedChapter.type === 'quiz' && (
                                <QuizBuilder chapter={selectedChapter} onChange={handleUpdateChapter} />
                            )}
                            {selectedChapter.type === 'document' && (
                                <DocumentBuilder chapter={selectedChapter} onChange={handleUpdateChapter} />
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Layout size={64} className="mb-4 opacity-20" />
                            <p className="text-lg">Select a chapter to edit or create a new one.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
