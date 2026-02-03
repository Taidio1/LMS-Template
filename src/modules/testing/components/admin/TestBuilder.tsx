import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, FileText, Save, Clock, Trophy, Loader2 } from 'lucide-react';
import { Question } from '../../types/types';
import { useNavigate } from 'react-router-dom';
import * as testApi from '../../api/testApi';

export const TestBuilder: React.FC = () => {
    const [testConfig, setTestConfig] = useState({
        title: 'Nowy Test Wiedzy',
        durationMinutes: 15,
        passingScore: 80
    });

    const [questions, setQuestions] = useState<Question[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const addQuestion = (type: 'single-choice' | 'open') => {
        const newQ: Question = {
            id: crypto.randomUUID(),
            type,
            text: 'Nowe pytanie...',
            // Initialize based on type
            ...(type === 'single-choice' ? {
                options: ['Opcja 1', 'Opcja 2'],
                correctOptionIndex: 0
            } : {})
        };
        setQuestions([...questions, newQ]);
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    // Helper to update specific option in single-choice
    const updateOption = (qId: string, idx: number, val: string) => {
        const q = questions.find(qu => qu.id === qId);
        if (q && q.options) {
            const newOpts = [...q.options];
            newOpts[idx] = val;
            updateQuestion(qId, { options: newOpts });
        }
    };

    const addOption = (qId: string) => {
        const q = questions.find(qu => qu.id === qId);
        if (q && q.options) {
            updateQuestion(qId, { options: [...q.options, `Opcja ${q.options.length + 1}`] });
        }
    };

    const handleSave = async () => {
        if (!testConfig.title.trim()) {
            alert('Proszę podać tytuł testu.');
            return;
        }
        if (questions.length === 0) {
            alert('Test musi zawierać przynajmniej jedno pytanie.');
            return;
        }

        try {
            setIsSaving(true);
            await testApi.createTest({
                ...testConfig,
                questions
            });
            // Redirect to list
            navigate('/admin/tests');
        } catch (error) {
            console.error('Failed to save test', error);
            alert('Wystąpił błąd podczas zapisywania testu.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 min-h-[600px]">
            {/* Header Configuration */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FileText className="text-blue-600" />
                    Konfiguracja Testu
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tytuł Testu</label>
                        <input
                            type="text"
                            value={testConfig.title}
                            onChange={e => setTestConfig({ ...testConfig, title: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Clock size={16} /> Limit Czasu (min)
                        </label>
                        <input
                            type="number"
                            value={testConfig.durationMinutes}
                            onChange={e => setTestConfig({ ...testConfig, durationMinutes: parseInt(e.target.value) || 0 })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Trophy size={16} /> Próg Zaliczenia (%)
                        </label>
                        <input
                            type="number"
                            value={testConfig.passingScore}
                            onChange={e => setTestConfig({ ...testConfig, passingScore: parseInt(e.target.value) || 0 })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative group animate-in fade-in slide-in-from-bottom-2">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => removeQuestion(q.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded text-sm">
                                Pytanie {idx + 1}
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 border border-gray-200 px-2 py-0.5 rounded">
                                {q.type === 'single-choice' ? 'Wielokrotnego wyboru' : 'Otwarte'}
                            </span>
                        </div>

                        {/* Question Text */}
                        <div className="mb-4">
                            <input
                                type="text"
                                value={q.text}
                                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                className="w-full text-lg border-0 border-b-2 border-gray-100 focus:border-blue-500 focus:ring-0 px-0 py-2 placeholder-gray-300 transition-colors bg-transparent"
                                placeholder="Wpisz treść pytania..."
                            />
                        </div>

                        {/* Editors based on Type */}
                        {q.type === 'single-choice' && (
                            <div className="pl-4 space-y-3 border-l-2 border-gray-100">
                                {q.options?.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuestion(q.id, { correctOptionIndex: optIdx })}
                                            className={`p-1 rounded-full border transition-colors ${q.correctOptionIndex === optIdx
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'border-gray-300 text-transparent hover:border-gray-400'
                                                }`}
                                        >
                                            <CheckCircle2 size={14} />
                                        </button>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                            className="flex-1 text-sm border border-gray-200 rounded px-2 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => addOption(q.id)}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2"
                                >
                                    <Plus size={12} /> Dodaj opcję
                                </button>
                            </div>
                        )}

                        {q.type === 'open' && (
                            <div className="pl-4 border-l-2 border-gray-100">
                                <textarea
                                    disabled
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-500 cursor-not-allowed resize-none"
                                    rows={3}
                                    placeholder="Pole tekstowe dla uczestnika pojawi się tutaj..."
                                />
                                <div className="mt-3">
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Wzorcowa odpowiedź (dla sprawdzającego)</label>
                                    <input
                                        type="text"
                                        value={q.correctAnswerText || ''}
                                        onChange={(e) => updateQuestion(q.id, { correctAnswerText: e.target.value })}
                                        className="w-full text-sm border border-gray-200 rounded px-3 py-2"
                                        placeholder="Opcjonalnie: wpisz kluczowe słowa lub poprawną odpowiedź"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Buttons */}
            <div className="mt-8 flex gap-4 justify-center">
                <button
                    onClick={() => addQuestion('single-choice')}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-transform active:scale-95"
                >
                    <CheckCircle2 size={18} className="text-blue-500" />
                    Pytanie Zamknięte
                </button>
                <button
                    onClick={() => addQuestion('open')}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-transform active:scale-95"
                >
                    <FileText size={18} className="text-purple-500" />
                    Pytanie Otwarte
                </button>
            </div>

            {/* Save Footer */}
            <div className="mt-12 flex justify-end border-t border-gray-200 pt-6">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSaving ? 'Zapisywanie...' : 'Zapisz Test'}
                </button>
            </div>
        </div>
    );
};
