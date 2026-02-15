'use client';

import { useState, useCallback } from 'react';

interface ResumeUploaderProps {
    onResumeUploaded: (text: string) => void;
}

export default function ResumeUploader({ onResumeUploaded }: ResumeUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [preview, setPreview] = useState('');

    const handleFile = async (file: File) => {
        if (!file.name.match(/\.(pdf|docx)$/i)) {
            setError('Please upload a PDF or DOCX file');
            return;
        }

        setIsUploading(true);
        setError('');
        setFileName(file.name);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/parse-resume', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to parse resume');
            }

            const data = await response.json();
            onResumeUploaded(data.text);

            // Show preview (first 500 characters)
            setPreview(data.text.substring(0, 500) + (data.text.length > 500 ? '...' : ''));
        } catch (err: any) {
            setError(err.message || 'Failed to upload resume');
            setFileName('');
            setPreview('');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    return (
        <div className="space-y-4">
            <div
                className={`upload-zone ${isDragging ? 'upload-zone-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('resume-file-input')?.click()}
            >
                <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileInput}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <svg className="animate-spin h-10 w-10 text-primary-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600">Parsing resume...</p>
                    </div>
                ) : fileName ? (
                    <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-success-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-900 font-medium">{fileName}</p>
                        <p className="text-sm text-gray-500 mt-1">Click to upload a different file</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-900 font-medium">Drop your resume here</p>
                        <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                        <p className="text-xs text-gray-400 mt-2">PDF or DOCX (max 10MB)</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                    <p className="text-sm text-danger-800">{error}</p>
                </div>
            )}

            {preview && (
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-xs font-medium text-gray-700 mb-2">Preview:</p>
                    <p className="text-xs text-gray-600 whitespace-pre-wrap font-mono">{preview}</p>
                </div>
            )}
        </div>
    );
}
