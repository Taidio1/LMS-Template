import React, { useState } from 'react';
import { Chapter } from './ChapterList';
import { FileText, Upload, X, Eye } from 'lucide-react';
import api from '@/services/api';
import { DocumentViewer } from '../../courses/components/DocumentViewer';

interface DocumentBuilderProps {
    chapter: Chapter;
    onChange: (updatedChapter: Chapter) => void;
}

export const DocumentBuilder: React.FC<DocumentBuilderProps> = ({ chapter, onChange }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const content = chapter.content || {};

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const data = await api.files.upload(file);

            // Update chapter content
            onChange({
                ...chapter,
                content: {
                    ...content,
                    url: data.url,
                    filename: data.filename,
                    originalName: data.originalName,
                    mimetype: data.mimetype,
                    fileType: data.mimetype.includes('pdf') ? 'pdf' : 'ppt', // simplified type for frontend
                    size: data.size
                }
            });

        } catch (error: any) {
            console.error('Upload Error:', error);
            alert(`Upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveFile = () => {
        if (confirm('Are you sure you want to remove this file?')) {
            onChange({
                ...chapter,
                content: {} // Clear content
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Document Chapter</h2>

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

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                {content.url ? (
                    <div className="flex flex-col items-center justify-center">
                        <div className="bg-blue-50 p-4 rounded-full mb-4">
                            <FileText size={48} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{content.originalName}</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {(content.size / 1024 / 1024).toFixed(2)} MB • {content.fileType === 'pdf' ? 'PDF Document' : 'Presentation'}
                        </p>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowPreview(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                <Eye size={18} />
                                <span>Preview</span>
                            </button>
                            <button
                                onClick={handleRemoveFile}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                            >
                                <X size={18} />
                                <span>Remove</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <Upload size={48} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Upload Document</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-sm">
                            Select a PDF, PPT, or PPTX file to upload. PDF files will be displayed in the browser, while PPT files will be available for download.
                        </p>

                        <label className="relative">
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.ppt,.pptx"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <div className={`
                                cursor-pointer flex items-center space-x-2 px-6 py-3 rounded-md font-medium text-white transition-colors
                                ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                            `}>
                                {isUploading ? (
                                    <span>Uploading...</span>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        <span>Select File</span>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {showPreview && content.url && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="bg-white w-full h-full max-w-6xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col relative overflow-hidden">
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <div className="flex-1 overflow-hidden">
                            <DocumentViewer
                                content={content}
                                onComplete={() => console.log('Preview complete')}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
