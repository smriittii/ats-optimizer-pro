'use client';

import SemanticGapsView from './SemanticGapsView';

// ... (keep existing imports)

// ... (keep AnalysisTabs component)

// Remove local SemanticGapsView function

analysis: ResumeAnalysis;
onRemoveKeyword ?: (keyword: string) => void;
removedKeywords ?: Set<string>;
onDismissATSIssue ?: (issue: string) => void;
dismissedIssues ?: Set<string>;
}

type TabType = 'missing' | 'matches' | 'skills' | 'heuristics' | 'semantic';

export default function AnalysisTabs({
    analysis,
    onRemoveKeyword,
    removedKeywords,
    onDismissATSIssue,
    dismissedIssues
}: AnalysisTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('missing');

    const tabs: { id: TabType; label: string; count?: number }[] = [
        { id: 'missing', label: 'Missing Keywords', count: analysis.missingKeywords.length },
        { id: 'matches', label: 'Strong Matches', count: analysis.strongMatches.length },
        { id: 'skills', label: 'Required Skills', count: analysis.breakdown.requiredSkills.missing.length },
        { id: 'semantic', label: 'Semantic Gaps', count: 0 },
        { id: 'heuristics', label: 'ATS Checks', count: analysis.breakdown.atsHeuristics.issues.length },
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
            <div className="min-h-[300px]">
                {activeTab === 'missing' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Missing Keywords from Job Description
                        </h3>
                        {analysis.missingKeywords.length > 0 ? (
                            <>
                                <p className="text-sm text-gray-600 mb-2">
                                    These keywords appear in the job description but not in your resume.
                                </p>
                                <p className="text-sm text-primary-700 mb-4 font-medium">
                                    💡 Click the ❌ button to remove irrelevant keywords and improve your score!
                                </p>
                                <KeywordList
                                    keywords={analysis.missingKeywords}
                                    type="missing"
                                    onRemoveKeyword={onRemoveKeyword}
                                    removedKeywords={removedKeywords}
                                />
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
                                                <li key={idx} className={`flex items-start p-3 rounded-lg border ${isDismissed ? 'bg-gray-50 border-gray-200 opacity-50' : 'bg-warning-50 border-warning-200'
                                                    }`}>
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

// Semantic Gaps Component
function SemanticGapsView({ analysis }: { analysis: ResumeAnalysis }) {
    const sectionAnalysis = analysis.sectionAnalysis;

    if (!sectionAnalysis) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No section analysis available</p>
            </div>
        );
    }

    const sections = Object.entries(sectionAnalysis);

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Semantic Content Analysis
            </h3>
            <p className="text-sm text-gray-600 mb-6">
                This shows how well each section of your resume aligns with the job description content.
            </p>

            <div className="space-y-4">
                {sections.map(([sectionName, data]) => {
                    const quality = data.quality || 'unknown';
                    const keywordCount = data.keywordCount || 0;
                    const suggestedKeywords = data.suggestedKeywords || [];

                    let colorClass = 'border-gray-200 bg-gray-50';
                    let iconColor = 'text-gray-500';
                    let qualityLabel = 'No Data';

                    if (quality === 'good') {
                        colorClass = 'border-success-200 bg-success-50';
                        iconColor = 'text-success-600';
                        qualityLabel = 'Strong';
                    } else if (quality === 'medium') {
                        colorClass = 'border-warning-200 bg-warning-50';
                        iconColor = 'text-warning-600';
                        qualityLabel = 'Moderate';
                    } else if (quality === 'poor') {
                        colorClass = 'border-danger-200 bg-danger-50';
                        iconColor = 'text-danger-600';
                        qualityLabel = 'Weak';
                    }

                    return (
                        <div key={sectionName} className={`border rounded-lg p-4 ${colorClass}`}>
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center">
                                    <svg className={`w-5 h-5 ${iconColor} mr-2`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                    </svg>
                                    <h4 className="font-semibold text-gray-900 capitalize">{sectionName}</h4>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded ${quality === 'good' ? 'bg-success-100 text-success-800' :
                                    quality === 'medium' ? 'bg-warning-100 text-warning-800' :
                                        quality === 'poor' ? 'bg-danger-100 text-danger-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {qualityLabel}
                                </span>
                            </div>

                            <p className="text-sm text-gray-700 mb-2">
                                Contains <strong>{keywordCount}</strong> relevant keyword{keywordCount !== 1 ? 's' : ''}
                            </p>

                            {suggestedKeywords.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-600 mb-2">Consider adding:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedKeywords.slice(0, 5).map((keyword, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
