'use client';

import type { ClaudeAnalysis, KeywordInsight, SectionOptimization } from '@/types';
import { useState } from 'react';

interface ClaudeInsightsPanelProps {
    claudeAnalysis: ClaudeAnalysis;
    isLoading?: boolean;
}

export default function ClaudeInsightsPanel({ claudeAnalysis, isLoading }: ClaudeInsightsPanelProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mb-4" />
                </div>
                <p className="text-gray-700 font-medium mt-2">Claude is analyzing your resume…</p>
                <p className="text-sm text-gray-500 mt-1">Detecting keywords & generating optimizations</p>
            </div>
        );
    }

    const critical = claudeAnalysis.keywordInsights.filter(k => k.tier === 'critical');
    const important = claudeAnalysis.keywordInsights.filter(k => k.tier === 'important');
    const niceToHave = claudeAnalysis.keywordInsights.filter(k => k.tier === 'nice-to-have');

    return (
        <div className="space-y-8">
            {/* Overall Feedback */}
            {claudeAnalysis.overallFeedback && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🤖</span>
                        <div>
                            <h4 className="font-semibold text-purple-900 mb-1">Claude's Assessment</h4>
                            <p className="text-sm text-purple-800 leading-relaxed">{claudeAnalysis.overallFeedback}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Keyword Intelligence ───────────────────────────────────── */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    🔍 Keyword Intelligence
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Claude identified these keywords from the job description, ranked by ATS importance.
                    <span className="ml-1 font-medium text-green-700">Green = already in your resume</span>
                    {' · '}
                    <span className="font-medium text-red-600">Red = missing</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KeywordTierColumn
                        title="🔴 Critical"
                        subtitle="Must-have — ATS filters on these"
                        keywords={critical}
                        accentClass="border-red-200 bg-red-50"
                        titleClass="text-red-700"
                    />
                    <KeywordTierColumn
                        title="🟡 Important"
                        subtitle="Significantly boosts your match score"
                        keywords={important}
                        accentClass="border-amber-200 bg-amber-50"
                        titleClass="text-amber-700"
                    />
                    <KeywordTierColumn
                        title="🟢 Nice-to-have"
                        subtitle="Bonus points for standing out"
                        keywords={niceToHave}
                        accentClass="border-green-200 bg-green-50"
                        titleClass="text-green-700"
                    />
                </div>
            </div>

            {/* ── Section Optimizations ─────────────────────────────────── */}
            {claudeAnalysis.sectionOptimizations.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        ✏️ Section-by-Section Rewrites
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Specific, copy-paste-ready suggestions to optimize each section of your resume.
                    </p>
                    <div className="space-y-4">
                        {claudeAnalysis.sectionOptimizations.map((opt, idx) => (
                            <OptimizationCard key={idx} optimization={opt} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KeywordTierColumn({
    title,
    subtitle,
    keywords,
    accentClass,
    titleClass,
}: {
    title: string;
    subtitle: string;
    keywords: KeywordInsight[];
    accentClass: string;
    titleClass: string;
}) {
    return (
        <div className={`rounded-xl border p-4 ${accentClass}`}>
            <h4 className={`font-semibold text-sm mb-0.5 ${titleClass}`}>{title}</h4>
            <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
            {keywords.length === 0 ? (
                <p className="text-xs text-gray-400 italic">None detected</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {keywords.map((kw, idx) => (
                        <KeywordChip key={idx} insight={kw} />
                    ))}
                </div>
            )}
        </div>
    );
}

function KeywordChip({ insight }: { insight: KeywordInsight }) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative">
            <button
                className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                    ${insight.inResume
                        ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                    }`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                title={insight.reason}
            >
                <span className="truncate">{insight.keyword}</span>
                <span className="flex-shrink-0 text-base" aria-label={insight.inResume ? 'Found in resume' : 'Missing from resume'}>
                    {insight.inResume ? '✓' : '✗'}
                </span>
            </button>
            {showTooltip && (
                <div className="absolute z-10 bottom-full left-0 right-0 mb-1 px-2 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed pointer-events-none">
                    {insight.reason}
                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    );
}

function OptimizationCard({ optimization }: { optimization: SectionOptimization }) {
    const [copied, setCopied] = useState<number | null>(null);

    const copyBullet = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopied(idx);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 mb-1">
                        {optimization.section}
                    </span>
                    <p className="text-xs text-orange-700 font-medium flex items-center gap-1">
                        <span>⚠</span> {optimization.issue}
                    </p>
                </div>
            </div>

            {/* Suggestion */}
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">{optimization.suggestion}</p>

            {/* Rewritten Bullets */}
            {optimization.rewrittenBullets.length > 0 && (
                <div className="bg-gray-50 border-l-4 border-purple-400 rounded-r-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        ✨ Suggested Rewrites <span className="normal-case font-normal text-gray-400">(click to copy)</span>
                    </p>
                    <ul className="space-y-2">
                        {optimization.rewrittenBullets.map((bullet, idx) => (
                            <li key={idx}>
                                <button
                                    className={`w-full text-left text-xs font-mono text-gray-800 p-2 rounded hover:bg-purple-50 border transition-colors
                                        ${copied === idx ? 'border-green-400 bg-green-50 text-green-800' : 'border-gray-200 bg-white'}`}
                                    onClick={() => copyBullet(bullet, idx)}
                                >
                                    {copied === idx ? '✓ Copied!' : `• ${bullet}`}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Keywords Added */}
            {optimization.keywordsAdded.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-gray-500">Keywords added:</span>
                    {optimization.keywordsAdded.map((kw, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                            {kw}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
