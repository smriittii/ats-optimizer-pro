'use client';

import { useEffect, useState } from 'react';
import type { ResumeAnalysis } from '@/types';

interface ScoreMeterProps {
    analysis: ResumeAnalysis;
}

export default function ScoreMeter({ analysis }: ScoreMeterProps) {
    const [displayScore, setDisplayScore] = useState(0);
    const { score, breakdown } = analysis;

    // Animate score counting up
    useEffect(() => {
        let start = 0;
        const increment = score / 30; // Animate over 30 frames
        const timer = setInterval(() => {
            start += increment;
            if (start >= score) {
                setDisplayScore(score);
                clearInterval(timer);
            } else {
                setDisplayScore(Math.floor(start));
            }
        }, 20);

        return () => clearInterval(timer);
    }, [score]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-success-600';
        if (score >= 60) return 'text-warning-600';
        return 'text-danger-600';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent Match';
        if (score >= 60) return 'Good Match';
        if (score >= 40) return 'Fair Match';
        return 'Needs Improvement';
    };

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayScore / 100) * circumference;

    return (
        <div className="space-y-6">
            {/* Circular Score Meter */}
            <div className="flex flex-col items-center">
                <div className="relative">
                    <svg className="transform -rotate-90" width="300" height="300">
                        {/* Background circle */}
                        <circle
                            cx="150"
                            cy="150"
                            r={radius}
                            stroke="#e5e7eb"
                            strokeWidth="20"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="150"
                            cy="150"
                            r={radius}
                            stroke={score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="20"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>

                    {/* Score text in center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                            {displayScore}
                        </div>
                        <div className="text-2xl text-gray-500">/ 100</div>
                        <div className="mt-2 text-lg font-medium text-gray-700">
                            {getScoreLabel(score)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ScoreCard
                    title="Keyword Match"
                    score={breakdown.keywordMatch.score}
                    weight="40%"
                    detail={`${breakdown.keywordMatch.matched}/${breakdown.keywordMatch.total} keywords`}
                />
                <ScoreCard
                    title="Semantic Similarity"
                    score={breakdown.semanticSimilarity.score}
                    weight="25%"
                    detail={`${Math.round(breakdown.semanticSimilarity.similarity * 100)}% similar`}
                />
                <ScoreCard
                    title="Required Skills"
                    score={breakdown.requiredSkills.score}
                    weight="15%"
                    detail={`${breakdown.requiredSkills.covered.length}/${breakdown.requiredSkills.total} skills`}
                />
                <ScoreCard
                    title="Distribution Quality"
                    score={breakdown.distributionQuality.score}
                    weight="10%"
                    detail="Keyword spread"
                />
                <ScoreCard
                    title="ATS Compatibility"
                    score={breakdown.atsHeuristics.score}
                    weight="10%"
                    detail={`${breakdown.atsHeuristics.passed.length} checks passed`}
                />
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 flex flex-col justify-center items-center border-2 border-primary-200">
                    <div className="text-sm font-medium text-primary-900">Final Score</div>
                    <div className={`text-3xl font-bold mt-1 ${getScoreColor(score)}`}>
                        {score}
                    </div>
                    <div className="text-xs text-primary-700 mt-1">Weighted Average</div>
                </div>
            </div>
        </div>
    );
}

interface ScoreCardProps {
    title: string;
    score: number;
    weight: string;
    detail: string;
}

function ScoreCard({ title, score, weight, detail }: ScoreCardProps) {
    const getColor = (score: number) => {
        if (score >= 80) return 'border-success-200 bg-success-50';
        if (score >= 60) return 'border-warning-200 bg-warning-50';
        return 'border-danger-200 bg-danger-50';
    };

    const getTextColor = (score: number) => {
        if (score >= 80) return 'text-success-800';
        if (score >= 60) return 'text-warning-800';
        return 'text-danger-800';
    };

    return (
        <div className={`rounded-lg p-4 border-2 ${getColor(score)}`}>
            <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">{title}</div>
                <div className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                    {weight}
                </div>
            </div>
            <div className={`text-2xl font-bold ${getTextColor(score)}`}>
                {score}
            </div>
            <div className="text-xs text-gray-600 mt-1">{detail}</div>
        </div>
    );
}
