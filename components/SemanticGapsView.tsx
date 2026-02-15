// Semantic Gaps View Component
import type { ResumeAnalysis } from '@/types';

export default function SemanticGapsView({ analysis }: { analysis: ResumeAnalysis }) {
    const sectionAnalysis = analysis.sectionAnalysis;
    const sections = Object.entries(sectionAnalysis);

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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-blue-900 font-semibold mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    Why Semantic Gaps Matter
                </h3>
                <p className="text-blue-800 text-sm">
                    ATS algorithms scan specific sections for context. Having keywords in your <strong>Experience</strong> section allows the ATS to understand <em>how</em> you used a skill, which scores higher than just listing it in a "Skills" list.
                </p>
            </div>

            <div className="space-y-6">
                {sections.map(([sectionName, data]) => {
                    const quality = data.quality || 'unknown';
                    const suggestedKeywords = data.suggestedKeywords || [];
                    const foundKeywords = data.foundKeywords || [];
                    const hasContent = data.wordCount > 0;

                    return (
                        <div key={sectionName} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className={`w-3 h-3 rounded-full ${getQualityColor(quality)}`}></span>
                                    <h3 className="font-bold text-gray-900 capitalize text-lg">{sectionName}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 font-medium">
                                        {hasContent ? (
                                            quality === 'good' ? 'Excellent Match' :
                                                quality === 'medium' ? 'Fair Match' : ' Needs Improvement'
                                        ) : 'Section Not Found'}
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
                                    <h4 className="flex items-center text-sm font-semibold text-success-700 uppercase tracking-wide">
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        What You're Doing Well
                                    </h4>

                                    {hasContent ? (
                                        <div className="space-y-3">
                                            {foundKeywords.length > 0 ? (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">Found {foundKeywords.length} relevant keywords in this section:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {foundKeywords.map((k, i) => (
                                                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-success-50 text-success-700 border border-success-100">
                                                                {k}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No specific job keywords found in this section yet.</p>
                                            )}

                                            {data.hasActionVerbs && (
                                                <p className="text-sm text-gray-600 flex items-center">
                                                    <span className="text-success-500 mr-2">✓</span>
                                                    Using strong action verbs
                                                </p>
                                            )}
                                            {data.hasQuantification && (
                                                <p className="text-sm text-gray-600 flex items-center">
                                                    <span className="text-success-500 mr-2">✓</span>
                                                    Includes quantifiable metrics (numbers/%)
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600 flex items-center">
                                                <span className="text-success-500 mr-2">✓</span>
                                                Good length ({data.wordCount} words)
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">This section was not found in your resume.</p>
                                    )}
                                </div>

                                {/* Right Column: Improvements */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center text-sm font-semibold text-warning-700 uppercase tracking-wide">
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                        Scope for Improvement
                                    </h4>

                                    {hasContent ? (
                                        <div className="space-y-3">
                                            {suggestedKeywords.length > 0 ? (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2 font-medium">Consider adding these keywords here:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {suggestedKeywords.map((k, i) => (
                                                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-white text-gray-700 border border-gray-300 border-dashed hover:border-primary-500 hover:text-primary-600 cursor-default transition-colors" title="Add to this section">
                                                                + {k}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-success-600">Great job! No key terms missing from this section.</p>
                                            )}

                                            {!data.hasActionVerbs && (
                                                <p className="text-sm text-gray-600 flex items-start">
                                                    <span className="text-warning-500 mr-2 mt-0.5">⚠</span>
                                                    <span>Weak action verbs. Start bullets with "Managed", "Created", "Analyzed" etc.</span>
                                                </p>
                                            )}
                                            {!data.hasQuantification && (
                                                <p className="text-sm text-gray-600 flex items-start">
                                                    <span className="text-warning-500 mr-2 mt-0.5">⚠</span>
                                                    <span>Missing numbers. Add metrics like "Increased revenue by 20%".</span>
                                                </p>
                                            )}
                                            {data.keywordDensity > 0.15 && (
                                                <p className="text-sm text-danger-600 flex items-start">
                                                    <span className="text-danger-500 mr-2 mt-0.5">⚠</span>
                                                    <span>Keyword stuffing detected. Try to write more naturally.</span>
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600">
                                            Adding a <strong>{sectionName}</strong> section is highly recommended for ATS parsing.
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
