'use client';

import { useState } from 'react';

interface OptimizedSection {
    section: string;
    original: string;
    rewritten: string;
    keywordsAdded: string[];
    changes: string;
}

interface ResumeOptimizerProps {
    resumeText: string;
    jobDescription: string;
    missingKeywords: string[];
}

export default function ResumeOptimizer({
    resumeText,
    jobDescription,
    missingKeywords,
}: ResumeOptimizerProps) {
    const [sections, setSections] = useState<OptimizedSection[]>([]);
    const [accepted, setAccepted] = useState<Record<string, boolean>>({});
    const [rejected, setRejected] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');
    const [hasOptimized, setHasOptimized] = useState(false);

    const handleOptimize = async () => {
        setIsLoading(true);
        setError('');
        setAccepted({});
        setRejected({});

        try {
            const response = await fetch('/api/optimize-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText, jobDescription, missingKeywords }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setSections(data.sections);
            setHasOptimized(true);
        } catch (err: any) {
            setError(err.message || 'Optimization failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = (section: string) => {
        setAccepted(prev => ({ ...prev, [section]: true }));
        setRejected(prev => ({ ...prev, [section]: false }));
    };

    const handleReject = (section: string) => {
        setRejected(prev => ({ ...prev, [section]: true }));
        setAccepted(prev => ({ ...prev, [section]: false }));
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            // Build the final resume text using accepted rewrites
            let finalResume = resumeText;
            for (const section of sections) {
                if (accepted[section.section]) {
                    finalResume = finalResume.replace(section.original, section.rewritten);
                }
            }

            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText: finalResume }),
            });

            if (!response.ok) throw new Error('PDF generation failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'optimized-resume.pdf';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.message || 'PDF download failed');
        } finally {
            setIsDownloading(false);
        }
    };

    const acceptedCount = Object.values(accepted).filter(Boolean).length;
    const pendingCount = sections.filter(s => !accepted[s.section] && !rejected[s.section]).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Resume Optimizer</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Claude will rewrite each section to naturally embed missing keywords
                    </p>
                </div>
                {!hasOptimized ? (
                    <button
                        onClick={handleOptimize}
                        disabled={isLoading}
                        className="btn btn-primary px-6 py-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Optimizing...
                            </span>
                        ) : '✨ Optimize My Resume'}
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                            {acceptedCount} accepted · {pendingCount} pending
                        </span>
                        <button
                            onClick={handleOptimize}
                            disabled={isLoading}
                            className="text-sm text-primary-600 hover:underline"
                        >
                            Re-run
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading || acceptedCount === 0}
                            className="btn btn-primary px-6 py-2 disabled:opacity-50"
                        >
                            {isDownloading ? 'Generating...' : '⬇ Download PDF'}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            {isLoading && (
                <div className="text-center py-16 text-gray-500">
                    <div className="text-4xl mb-4">✨</div>
                    <p className="font-medium text-lg">Claude is optimizing your resume...</p>
                    <p className="text-sm mt-2">This may take 10-20 seconds</p>
                </div>
            )}

            {!isLoading && sections.length > 0 && (
                <div className="space-y-6">
                    {sections.map((section) => (
                        <div
                            key={section.section}
                            className={`border rounded-xl overflow-hidden ${
                                accepted[section.section] ? 'border-green-300' :
                                rejected[section.section] ? 'border-gray-200 opacity-60' :
                                'border-blue-200'
                            }`}
                        >
                            {/* Section Header */}
                            <div className={`px-4 py-3 flex items-center justify-between ${
                                accepted[section.section] ? 'bg-green-50' :
                                rejected[section.section] ? 'bg-gray-50' :
                                'bg-blue-50'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <h4 className="font-semibold text-gray-900">{section.section}</h4>
                                    {section.keywordsAdded.length > 0 && (
                                        <div className="flex gap-1 flex-wrap">
                                            {section.keywordsAdded.map((kw, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                    +{kw}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {!accepted[section.section] && !rejected[section.section] && (
                                        <>
                                            <button
                                                onClick={() => handleAccept(section.section)}
                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                                            >
                                                ✓ Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(section.section)}
                                                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                                            >
                                                ✕ Reject
                                            </button>
                                        </>
                                    )}
                                    {accepted[section.section] && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg flex items-center gap-1">
                                            ✓ Accepted
                                            <button onClick={() => handleReject(section.section)} className="ml-2 text-xs text-gray-500 hover:text-gray-700">undo</button>
                                        </span>
                                    )}
                                    {rejected[section.section] && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg flex items-center gap-1">
                                            ✕ Rejected
                                            <button onClick={() => handleAccept(section.section)} className="ml-2 text-xs text-gray-500 hover:text-gray-700">undo</button>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Side by side content */}
                            <div className="grid grid-cols-2 divide-x">
                                <div className="p-4">
                                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Original</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.original}</p>
                                </div>
                                <div className="p-4">
                                    <p className="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wide">✨ Optimized</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.rewritten}</p>
                                </div>
                            </div>

                            {/* Changes explanation */}
                            {section.changes && (
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">💡 {section.changes}</p>
                                </div>
                            )}
                        </div>
                    ))}

                    {acceptedCount > 0 && (
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="btn btn-primary px-8 py-3 text-base disabled:opacity-50"
                            >
                                {isDownloading ? 'Generating PDF...' : `⬇ Download Optimized Resume (${acceptedCount} changes)`}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!isLoading && !hasOptimized && (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-4">📝</p>
                    <p className="font-medium">Click "Optimize My Resume" to get started</p>
                    <p className="text-sm mt-2">Claude will suggest keyword-optimized rewrites for each section</p>
                </div>
            )}
        </div>
    );
}