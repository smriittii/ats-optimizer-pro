'use client';

import { useState } from 'react';
import ResumeUploader from '@/components/ResumeUploader';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import ScoreMeter from '@/components/ScoreMeter';
import AnalysisTabs from '@/components/AnalysisTabs';
import type { ResumeAnalysis } from '@/types';

export default function Home() {
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [excludedKeywords, setExcludedKeywords] = useState<Set<string>>(new Set());
    const [dismissedIssues, setDismissedIssues] = useState<Set<string>>(new Set());

    const handleResumeUploaded = (text: string) => {
        setResumeText(text);
        setError('');
        setAnalysis(null);
        setExcludedKeywords(new Set());
        setDismissedIssues(new Set());
    };

    const handleAnalyze = async (additionalExcluded: string[] = [], additionalDismissed: string[] = []) => {
        if (!resumeText || !jobDescription) {
            setError('Please upload a resume and paste a job description');
            return;
        }

        setIsAnalyzing(true);
        setError('');

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeText,
                    jobDescription,
                    excludedKeywords: [...excludedKeywords, ...additionalExcluded],
                    dismissedIssues: [...dismissedIssues, ...additionalDismissed],
                }),
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setAnalysis(data);
        } catch (err: any) {
            setError(err.message || 'Failed to analyze resume');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRemoveKeyword = (keyword: string) => {
        const newExcluded = new Set(excludedKeywords);
        newExcluded.add(keyword);
        setExcludedKeywords(newExcluded);

        // Automatically recalculate score
        handleAnalyze([keyword], []);
    };

    const handleDismissATSIssue = (issue: string) => {
        const newDismissed = new Set(dismissedIssues);
        if (newDismissed.has(issue)) {
            newDismissed.delete(issue);
        } else {
            newDismissed.add(issue);
        }
        setDismissedIssues(newDismissed);

        // Automatically recalculate score
        handleAnalyze([], [issue]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900">
                            ATS Optimizer Pro
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Transparent Resume Analysis & Optimization
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Input Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Resume Upload */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Upload Resume
                        </h2>
                        <ResumeUploader onResumeUploaded={handleResumeUploaded} />
                    </div>

                    {/* Job Description */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Job Description
                        </h2>
                        <JobDescriptionInput
                            value={jobDescription}
                            onChange={setJobDescription}
                        />
                    </div>
                </div>

                {/* Analyze Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => handleAnalyze()}
                        disabled={isAnalyzing || !resumeText || !jobDescription}
                        className="btn btn-primary px-8 py-3 text-base font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </span>
                        ) : (
                            'Analyze Resume'
                        )}
                    </button>
                </div>

                {/* Status Info */}
                {(excludedKeywords.size > 0 || dismissedIssues.size > 0) && (
                    <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                {excludedKeywords.size > 0 && (
                                    <p className="text-sm font-medium text-primary-900">
                                        ✓ {excludedKeywords.size} irrelevant keyword{excludedKeywords.size > 1 ? 's' : ''} removed
                                    </p>
                                )}
                                {dismissedIssues.size > 0 && (
                                    <p className="text-sm font-medium text-primary-900">
                                        ✓ {dismissedIssues.size} ATS issue{dismissedIssues.size > 1 ? 's' : ''} resolved
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setExcludedKeywords(new Set());
                                    setDismissedIssues(new Set());
                                    handleAnalyze();
                                }}
                                className="text-xs text-primary-700 hover:text-primary-900 underline"
                            >
                                Reset all
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-8 bg-danger-50 border border-danger-200 rounded-lg p-4">
                        <p className="text-danger-800 text-center">{error}</p>
                    </div>
                )}

                {/* Results Section */}
                {analysis && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Score Meter */}
                        <div className="bg-white rounded-xl shadow-md p-8">
                            <ScoreMeter analysis={analysis} />
                        </div>

                        {/* Analysis Tabs */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <AnalysisTabs
                                analysis={analysis}
                                onRemoveKeyword={handleRemoveKeyword}
                                removedKeywords={excludedKeywords}
                                onDismissATSIssue={handleDismissATSIssue}
                                dismissedIssues={dismissedIssues}
                            />
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!analysis && !error && (
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-24 w-24 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            Ready to analyze your resume
                        </h3>
                        <p className="mt-2 text-gray-600">
                            Upload your resume and paste a job description to get started
                        </p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-16 border-t border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500">
                        100% Local • No API Costs • Privacy-Focused
                    </p>
                </div>
            </footer>
        </div>
    );
}
