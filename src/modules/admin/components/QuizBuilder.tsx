import React from 'react';
import { Chapter } from './ChapterList';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface QuizBuilderProps {
    chapter: Chapter;
    onChange: (updatedChapter: Chapter) => void;
}

import { Question } from '../../../shared/types/quiz';


export const QuizBuilder: React.FC<QuizBuilderProps> = ({ chapter, onChange }) => {
    const questions: Question[] = chapter.content?.questions || [];

    const handleUpdate = (updatedContent: any) => {
        onChange({
            ...chapter,
            content: updatedContent,
        });
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            id: crypto.randomUUID(),
            question: 'New Question',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctOptionIndex: 0,
        };
        handleUpdate({ ...chapter.content, questions: [...questions, newQuestion] });
    };

    const removeQuestion = (id: string) => {
        handleUpdate({ ...chapter.content, questions: questions.filter(q => q.id !== id) });
    };

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        handleUpdate({
            ...chapter.content,
            questions: questions.map(q => q.id === id ? { ...q, [field]: value } : q),
        });
    };

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        const newOptions = [...question.options];
        newOptions[optionIndex] = value;
        updateQuestion(questionId, 'options', newOptions);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Quiz Chapter</h2>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chapter Title (Quiz Name)
                </label>
                <input
                    type="text"
                    value={chapter.title}
                    onChange={(e) => onChange({ ...chapter, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="space-y-8">
                {questions.map((q, index) => (
                    <div key={q.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50 relative">
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => removeQuestion(q.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Question {index + 1}</h4>

                        <div className="mb-4">
                            <input
                                type="text"
                                value={q.question}
                                onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                                className="w-full px-4 py-2 text-lg font-medium border-0 bg-transparent border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 placeholder-gray-400"
                                placeholder="Enter your question here..."
                            />
                        </div>

                        <div className="space-y-3 pl-4">
                            {q.options.map((opt, i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    <button
                                        onClick={() => updateQuestion(q.id, 'correctOptionIndex', i)}
                                        className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${q.correctOptionIndex === i
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-gray-300 text-transparent hover:border-gray-400'
                                            }`}
                                    >
                                        <CheckCircle2 size={14} />
                                    </button>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updateOption(q.id, i, e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={`Option ${i + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add New Question</span>
                </button>
            </div>
        </div>
    );
};
