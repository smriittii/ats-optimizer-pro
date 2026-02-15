'use client';

import { useState } from 'react';
import type { ResumeAnalysis } from '@/types';
import KeywordList from './KeywordList';
import SuggestionsPanel from './SuggestionsPanel';

interface AnalysisTabsProps {
    analysis: ResumeAnalysis;
}

type TabType = 'missing' | 'matches' | 'skills' | 'heuristics' | 'suggestions';

export default function AnalysisTabs({ analysis }: AnalysisTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('missing');

    const tabs: { id: TabType; label: string; count?: number }[] = [
        { id: 'missing', label: 'Missing Keywords', count: analysis.missingKeywords.length },
        { id: 'matches', label: 'Strong Matches', count: analysis.strongMatches.length },
        { id: 'skills', label: 'Required Skills', count: analysis.breakdown.requiredSkills.missing.length },
        { id: 'heuristics', label: 'ATS Checks', count: analysis.breakdown.atsHeuristics.issues.length },
        { id: 'suggestions', label: 'Suggestions', count: analysis.suggestions.length },
    ];

    return (
        <div>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab whitespace-nowrap ${activeTab === tab.id ? 'tab-active' : ''
                                }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === 'missing' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Missing Keywords from Job Description
                        </h3>
                        {analysis.missingKeywords.length > 0 ? (
                            <>
                                <p className="text-sm text-gray-600 mb-4">
                                    These keywords appear in the job description but not in your resume. Consider adding them if relevant to your experience.
                                </p>
                                <KeywordList keywords={analysis.missingKeywords} type="missing" />
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-success-600 text-4xl mb-3">✓</div>
                                <p className="text-gray-600">All keywords from the job description are present in your resume!</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'matches' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Keywords Found in Your Resume
                        </h3>
                        {analysis.strongMatches.length > 0 ? (
                            <>
                                <p className="text-sm text-gray-600 mb-4">
                                    These keywords from the job description were successfully found in your resume.
                                </p>
                                <KeywordList keywords={analysis.strongMatches} type="matched" />
                            </>
                        ) : (
                            <p className="text-gray-600">No keyword matches found. Consider revising your resume to include relevant terms.</p>
                        )}
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Required Skills Analysis
                        </h3>

                        {analysis.breakdown.requiredSkills.total > 0 ? (
                            <div className="space-y-6">
                                {analysis.breakdown.requiredSkills.covered.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-success-700 mb-3 flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Skills You Have ({analysis.breakdown.requiredSkills.covered.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.breakdown.requiredSkills.covered.map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-success-100 text-success-800 rounded-full text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {analysis.breakdown.requiredSkills.missing.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-danger-700 mb-3 flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            Missing Required Skills ({analysis.breakdown.requiredSkills.missing.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {analysis.breakdown.requiredSkills.missing.map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-danger-100 text-danger-800 rounded-full text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                                            <p className="text-sm text-warning-800">
                                                <strong>Tip:</strong> If you have experience with these skills, add them to your Skills section or mention them in your work experience.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-600">No specific required skills were detected in the job description.</p>
                        )}
                    </div>
                )}

                {activeTab === 'heuristics' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            ATS Compatibility Checks
                        </h3>

                        <div className="space-y-4">
                            {analysis.breakdown.atsHeuristics.passed.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-success-700 mb-3">✓ Passed Checks</h4>
                                    <ul className="space-y-2">
                                        {analysis.breakdown.atsHeuristics.passed.map((check, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm text-gray-700">{check}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {analysis.breakdown.atsHeuristics.issues.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-danger-700 mb-3">⚠ Issues Found</h4>
                                    <ul className="space-y-2">
                                        {analysis.breakdown.atsHeuristics.issues.map((issue, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <svg className="w-5 h-5 text-danger-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm text-gray-700">{issue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {analysis.breakdown.atsHeuristics.issues.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-success-600 text-4xl mb-3">✓</div>
                                    <p className="text-gray-600">Your resume passes all ATS compatibility checks!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'suggestions' && (
                    <SuggestionsPanel suggestions={analysis.suggestions} />
                )}
            </div>
        </div>
    );
}
