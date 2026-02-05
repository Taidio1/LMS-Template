import React, { useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { resolveFileUrl } from '@/lib/utils';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface DocumentViewerProps {
    content: {
        url?: string;
        filename?: string;
        originalName?: string;
        fileType?: 'pdf' | 'ppt';
        size?: number;
    };
    onComplete: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ content, onComplete }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [error, setError] = useState<string | null>(null);

    const fullUrl = resolveFileUrl(content.url);
    const isPdf = content.fileType === 'pdf';

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
        setError(null);
    }

    function onDocumentLoadError(err: Error) {
        console.error('Error loading PDF:', err);
        setError("Failed to load document. Please ensuring it is a valid PDF.");
    }

    const changePage = (offset: number) => {
        setPageNumber(prevPage => Math.min(Math.max(1, prevPage + offset), numPages || 1));
    };

    const handleNext = () => {
        if (numPages && pageNumber >= numPages) {
            onComplete();
        } else {
            changePage(1);
        }
    };

    const handlePrev = () => {
        changePage(-1);
    };

    if (!fullUrl) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                Document not available.
            </div>
        );
    }

    if (!isPdf) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
                <div className="bg-yellow-100 p-6 rounded-full mb-6">
                    <AlertCircle size={48} className="text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Format Not Supported for Inline Viewing</h3>
                <p className="text-gray-600 max-w-md">
                    This file is a presentation (PPT/PPTX). To view it as slides within the course, please ask the administrator to convert it to <strong>PDF</strong> and re-upload.
                </p>
                <div className="mt-8 flex space-x-4">
                    {/* No download button as per requirement */}
                    <button
                        onClick={onComplete}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                    >
                        Mark as Read & Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-100 rounded-lg shadow-sm overflow-hidden select-none" onContextMenu={(e) => e.preventDefault()}>
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 p-2 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-semibold text-gray-700">
                        {content.originalName}
                    </span>
                    <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1 space-x-2">
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1 hover:bg-white rounded"><ZoomOut size={16} /></button>
                        <span className="text-xs w-10 text-center">{(scale * 100).toFixed(0)}%</span>
                        <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-1 hover:bg-white rounded"><ZoomIn size={16} /></button>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                        Page {pageNumber} of {numPages || '--'}
                    </span>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 overflow-auto flex justify-center p-8 relative bg-gray-500/5">
                {error ? (
                    <div className="text-red-500 mt-10">{error}</div>
                ) : (
                    <Document
                        file={fullUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={<div className="text-gray-400 mt-10">Loading slides...</div>}
                        className="shadow-lg"
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="bg-white shadow-xl"
                        />
                    </Document>
                )}
            </div>

            {/* Footer Navigation (Slide Controls) */}
            <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-between">
                <button
                    onClick={handlePrev}
                    disabled={pageNumber <= 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span>Previous</span>
                </button>

                <div className="text-sm font-medium text-gray-600">
                    Slide {pageNumber} / {numPages || '-'}
                </div>

                <button
                    onClick={handleNext}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition-colors shadow-sm ${numPages && pageNumber >= numPages
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    <span>{numPages && pageNumber >= numPages ? 'Finish Chapter' : 'Next Slide'}</span>
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};
