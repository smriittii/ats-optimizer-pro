'use client';

import { useState } from 'react';
import type { ResumeAnalysis } from '@/types';

export default function SemanticGapsView({ analysis }: { analysis: ResumeAnalysis }) {
    const sectionAnalysis = analysis.sectionAnalysis;
    const sections = Object.entries(sectionAnalysis);

    // State to track loading and results for AI suggestions per section
    const [loadingSection, setLoadingSection] = useState<string | null>(null);
    const [aiSuggestions, setAiSuggestions] = useState<Record<string, string[]>>({});

    const handleGenerateAiSuggestions = async (sectionName: string, missingKeywords: string[]) => {
        setLoadingSection(sectionName);
        try {
            const response = await fetch('/api/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sectionName,
                    sectionText: analysis.text || '',
                    missingKeywords
                })
            });
            const data = await response.json();
            if (data.suggestions) {
                setAiSuggestions(prev => ({ ...prev, [sectionName]: data.suggestions }));
            }
        } catch (error) {
            console.error('Failed to get suggestions', error);
        } finally {
            setLoadingSection(null);
        }
    };

    // Helper to get color based on score/quality
    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'good': return 'bg-success-500';
            case 'medium': return 'bg-warning-500';
            case 'poor': return 'bg-danger-500';
            default: return 'bg-gray-300';
        }
    };

    const getScoreWidth = (quality: string) => {
        switch (quality) {
            case 'good': return '90%';
            case 'medium': return '60%';
            case 'poor': return '30%';
            default: return '10%';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 mb-6 shadow-sm">
                <h3 className="text-blue-900 font-semibold mb-2 flex items-center text-lg">
                    <span className="bg-blue-600 text-white p-1 rounded mr-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </span>
                    AI-Powered Gap Analysis
                </h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                    We've integrated <strong>Google Gemini AI</strong> to help you fix these gaps.
                    Click "✨ Generate AI Rewrite" on any section to get instant, professionally written bullet points that naturally include your missing keywords.
                </p>
            </div>

            <div className="space-y-6">
                {sections.map(([sectionName, data]) => {
                    const quality = data.quality || 'unknown';
                    const suggestedKeywords = data.suggestedKeywords || [];
                    const foundKeywords = data.foundKeywords || [];
                    const hasContent = data.wordCount > 0;
                    const suggestions = aiSuggestions[sectionName];
                    const isLoading = loadingSection === sectionName;

                    return (
                        <div key={sectionName} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            {/* Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className={`w-3 h-3 rounded-full ${getQualityColor(quality)} ring-2 ring-white shadow-sm`}></span>
                                    <h3 className="font-bold text-gray-900 capitalize text-lg tracking-tight">{sectionName}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${quality === 'good' ? 'bg-success-50 text-success-700 border-success-200' :
                                        quality === 'medium' ? 'bg-warning-50 text-warning-700 border-warning-200' :
                                            'bg-danger-50 text-danger-700 border-danger-200'
                                        }`}>
                                        {hasContent ? (
                                            quality === 'good' ? 'Excellent' :
                                                quality === 'medium' ? 'Average' : 'Needs Focus'
                                        ) : 'Missing'}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {hasContent && (
                                <div className="w-full bg-gray-100 h-1.5">
                                    <div
                                        className={`h-1.5 transition-all duration-1000 ${getQualityColor(quality)}`}
                                        style={{ width: getScoreWidth(quality) }}
                                    ></div>
                                </div>
                            )}

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Strengths */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-success-500 mr-2"></span>
                                        Strengths
                                    </h4>

                                    {hasContent ? (
                                        <div className="space-y-3">
                                            {foundKeywords.length > 0 ? (
                                                <div className="bg-success-50/50 rounded-lg p-3 border border-success-100">
                                                    <p className="text-xs font-medium text-success-800 mb-2">Found {foundKeywords.length} keywords:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {foundKeywords.map((k, i) => (
                                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-success-700 border border-success-200 shadow-sm">
                                                                {k}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No keywords found yet.</p>
                                            )}

                                            <div className="space-y-2">
                                                {data.hasActionVerbs && (
                                                    <p className="text-sm text-gray-600 flex items-center">
                                                        <svg className="w-4 h-4 text-success-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                        Strong action verbs
                                                    </p>
                                                )}
                                                {data.hasQuantification && (
                                                    <p className="text-sm text-gray-600 flex items-center">
                                                        <svg className="w-4 h-4 text-success-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                        Uses numbers/metrics
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Section not found.</p>
                                    )}
                                </div>

                                {/* Right Column: Improvements */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-warning-500 mr-2"></span>
                                        Improvements
                                    </h4>

                                    {hasContent ? (
                                        <div className="space-y-4">
                                            {suggestedKeywords.length > 0 ? (
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <p className="text-sm font-medium text-gray-700">Missing keywords:</p>
                                                        {!suggestions && (
                                                            <button
                                                                onClick={() => handleGenerateAiSuggestions(sectionName, suggestedKeywords)}
                                                                disabled={isLoading}
                                                                className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded transition-colors flex items-center"
                                                            >
                                                                {isLoading ? (
                                                                    <span className="flex items-center">
                                                                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                                        Generating...
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        <span className="mr-1">✨</span> Rewrite with AI
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {suggestions ? (
                                                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 animate-fade-in">
                                                            <p className="text-xs font-semibold text-indigo-800 mb-2 flex items-center">
                                                                <span className="mr-1">✨</span> Gemini Suggestions:
                                                            </p>
                                                            <ul className="space-y-2">
                                                                {suggestions.map((reflection, idx) => (
                                                                    <li key={idx} className="text-sm text-indigo-900 flex items-start">
                                                                        <span className="text-indigo-400 mr-2 mt-0.5">•</span>
                                                                        {reflection}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {suggestedKeywords.map((k, i) => (
                                                                <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs border border-gray-200 bg-gray-50 text-gray-600 border-dashed">
                                                                    {k}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-success-600 flex items-center">
                                                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                    All key terms present!
                                                </p>
                                            )}

                                            <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                                                {!data.hasActionVerbs && (
                                                    <p className="text-sm text-warning-700 flex items-start bg-warning-50 p-2 rounded">
                                                        <span className="mr-2">⚠</span>
                                                        <span>Weak action verbs. Try: "Directed", "Engineered"</span>
                                                    </p>
                                                )}
                                                {!data.hasQuantification && (
                                                    <p className="text-sm text-warning-700 flex items-start bg-warning-50 p-2 rounded">
                                                        <span className="mr-2">⚠</span>
                                                        <span>Add metrics (e.g., "$50k revenue")</span>
                                                    </p>
                                                )}
                                                {data.keywordDensity > 0.15 && (
                                                    <p className="text-sm text-danger-700 flex items-start bg-danger-50 p-2 rounded">
                                                        <span className="mr-2">⚠</span>
                                                        <span>Reduce keyword repetition</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                                            Add a <strong>{sectionName}</strong> section to improve your score.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
