'use client';

import ResumeOptimizer from './ResumeOptimizer';
import { useState } from 'react';
import type { ResumeAnalysis, ClaudeAnalysis } from '@/types';
import KeywordList from './KeywordList';
import SemanticGapsView from './SemanticGapsView';
import ClaudeInsightsPanel from './ClaudeInsightsPanel';

interface AnalysisTabsProps {
    analysis: ResumeAnalysis;
    onRemoveKeyword?: (keyword: string) => void;
    removedKeywords?: Set<string>;
    onDismissATSIssue?: (issue: string) => void;
    dismissedIssues?: Set<string>;
    claudeAnalysis?: ClaudeAnalysis | null;
    isClaudeLoading?: boolean;
    resumeText: string;
    jobDescription: string;
}

type TabType = 'missing' | 'matches' | 'skills' | 'heuristics' | 'semantic' | 'ai' | 'optimize';

export default function AnalysisTabs({
    analysis,
    onRemoveKeyword,
    removedKeywords,
    onDismissATSIssue,
    dismissedIssues,
    claudeAnalysis,
    isClaudeLoading,
}: AnalysisTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('missing');

    const tabs: { id: TabType; label: string; count?: number }[] = [
        { id: 'missing', label: 'Missing Keywords', count: claudeAnalysis?.keywordInsights?.filter(k => !k.inResume).length ?? analysis.missingKeywords.length },
        { id: 'matches', label: 'Strong Matches', count: analysis.strongMatches.length },
        { id: 'skills', label: 'Required Skills', count: analysis.breakdown.requiredSkills.missing.length },
        { id: 'semantic', label: 'Semantic Gaps', count: 0 },
        { id: 'heuristics', label: 'ATS Checks', count: analysis.breakdown.atsHeuristics.issues.length }
        { id: 'optimize', label: '📝 Optimize Resume' },,
        {
            id: 'ai',
            label: isClaudeLoading ? '✨ AI Insights…' : '✨ AI Insights',
            count: claudeAnalysis?.keywordInsights.length ?? undefined,
        },
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
                            className={`tab whitespace-nowrap ${activeTab === tab.id ? 'tab-active' : ''}`}
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
            {activeTab === 'optimize' && (
                <ResumeOptimizer
                    resumeText={resumeText}
                     jobDescription={jobDescription}
                     missingKeywords={analysis.missingKeywords}
                />
            )}
            <div className="min-h-[300px]">
                {activeTab === 'missing' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Missing Keywords from Job Description
                        </h3>
                        {isClaudeLoading ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="animate-spin text-4xl mb-3">✨</div>
                                <p className="font-medium">Claude is analysing keywords...</p>
                            </div>
                        ) : (claudeAnalysis?.keywordInsights?.filter(k => !k.inResume).length ?? 0) > 0 ? (
                            <>
                                <p className="text-sm text-gray-600 mb-4">
                                    These keywords were identified by Claude AI as important for this role but are missing from your resume.
                                </p>
                                <div className="space-y-2">
                                    {['critical', 'important', 'nice-to-have'].map(tier => {
                                        const tierKeywords = claudeAnalysis!.keywordInsights.filter(
                                            k => !k.inResume && k.tier === tier
                                        );
                                        if (tierKeywords.length === 0) return null;
                                        return (
                                            <div key={tier} className="mb-4">
                                                <h4 className={`text-sm font-semibold mb-2 ${
                                                    tier === 'critical' ? 'text-red-600' :
                                                    tier === 'important' ? 'text-yellow-600' :
                                                    'text-green-600'
                                                }`}>
                                                    {tier === 'critical' ? '🔴 Critical' : tier === 'important' ? '🟡 Important' : '🟢 Nice-to-have'}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {tierKeywords.map((k, idx) => (
                                                        <div key={idx} className="group relative">
                                                            <span className={`px-3 py-1 rounded-full text-sm cursor-help ${
                                                                tier === 'critical' ? 'bg-red-100 text-red-800' :
                                                                tier === 'important' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                                {k.keyword}
                                                            </span>
                                                            <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10">
                                                                {k.reason}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : !claudeAnalysis ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-4xl mb-3">🤖</p>
                                <p className="font-medium">Claude AI insights not available</p>
                                <p className="text-sm mt-1">Make sure your ANTHROPIC_API_KEY is set</p>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-success-600 text-4xl mb-3">✓</div>
                                <p className="text-gray-600">Claude found no missing keywords — great match!</p>
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
                                <p className="text-sm text-gray-600 mb-2">
                                    These keywords from the job description were successfully found in your resume.
                                </p>
                                <p className="text-sm text-primary-700 mb-4 font-medium">
                                    💡 Click ❌ to remove keywords that aren't actually relevant
                                </p>
                                <KeywordList
                                    keywords={analysis.strongMatches}
                                    type="matched"
                                    onRemoveKeyword={onRemoveKeyword}
                                    removedKeywords={removedKeywords}
                                />
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
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-600">No specific required skills were detected in the job description.</p>
                        )}
                    </div>
                )}

                {activeTab === 'semantic' && (
                    <SemanticGapsView analysis={analysis} />
                )}

                {activeTab === 'ai' && (
                    <div>
                        {(isClaudeLoading || claudeAnalysis) ? (
                            <ClaudeInsightsPanel
                                claudeAnalysis={claudeAnalysis ?? { keywordInsights: [], sectionOptimizations: [], overallFeedback: '' }}
                                isLoading={isClaudeLoading}
                            />
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-4xl mb-3">🤖</p>
                                <p className="font-medium">Claude AI insights not available</p>
                                <p className="text-sm mt-1">Make sure your ANTHROPIC_API_KEY is set in .env.local</p>
                            </div>
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
                                    <h4 className="text-sm font-medium text-warning-700 mb-2">⚠ Potential Issues</h4>
                                    <p className="text-xs text-gray-600 mb-3">
                                        If these don't apply to your resume, mark them as resolved to improve your score
                                    </p>
                                    <ul className="space-y-3">
                                        {analysis.breakdown.atsHeuristics.issues.map((issue, idx) => {
                                            const isDismissed = dismissedIssues?.has(issue);
                                            return (
                                                <li key={idx} className={`flex items-start p-3 rounded-lg border ${isDismissed ? 'bg-gray-50 border-gray-200 opacity-50' : 'bg-warning-50 border-warning-200'}`}>
                                                    {onDismissATSIssue && (
                                                        <input
                                                            type="checkbox"
                                                            checked={isDismissed}
                                                            onChange={() => onDismissATSIssue(issue)}
                                                            className="mt-0.5 mr-3 h-4 w-4 text-success-600 focus:ring-success-500 border-gray-300 rounded cursor-pointer"
                                                        />
                                                    )}
                                                    <svg className={`w-5 h-5 ${isDismissed ? 'text-gray-400' : 'text-warning-600'} mr-2 mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className={`text-sm flex-1 ${isDismissed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                                        {issue}
                                                    </span>
                                                </li>
                                            );
                                        })}
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
            </div>
        </div>
    );
}