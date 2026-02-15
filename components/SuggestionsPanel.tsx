'use client';

import type { Suggestion } from '@/types';

interface SuggestionsPanelProps {
    suggestions: Suggestion[];
}

export default function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
    if (suggestions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-success-600 text-4xl mb-3">✓</div>
                <p className="text-gray-600 font-medium">Your resume looks great!</p>
                <p className="text-sm text-gray-500 mt-2">No immediate improvements needed.</p>
            </div>
        );
    }

    const highPriority = suggestions.filter(s => s.priority === 'high');
    const mediumPriority = suggestions.filter(s => s.priority === 'medium');
    const lowPriority = suggestions.filter(s => s.priority === 'low');

    return (
        <div className="space-y-6">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-800">
                    <strong>💡 Pro Tip:</strong> Focus on high-priority suggestions first for the biggest impact on your ATS score.
                </p>
            </div>

            {highPriority.length > 0 && (
                <SuggestionSection
                    title="High Priority"
                    suggestions={highPriority}
                    priority="high"
                />
            )}

            {mediumPriority.length > 0 && (
                <SuggestionSection
                    title="Medium Priority"
                    suggestions={mediumPriority}
                    priority="medium"
                />
            )}

            {lowPriority.length > 0 && (
                <SuggestionSection
                    title="Low Priority"
                    suggestions={lowPriority}
                    priority="low"
                />
            )}
        </div>
    );
}

interface SuggestionSectionProps {
    title: string;
    suggestions: Suggestion[];
    priority: 'high' | 'medium' | 'low';
}

function SuggestionSection({ title, suggestions, priority }: SuggestionSectionProps) {
    const getBadgeClass = (priority: string) => {
        if (priority === 'high') return 'badge-high';
        if (priority === 'medium') return 'badge-medium';
        return 'badge-low';
    };

    const getSectionIcon = (priority: string) => {
        if (priority === 'high') return '🔴';
        if (priority === 'medium') return '🟡';
        return '🔵';
    };

    return (
        <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">{getSectionIcon(priority)}</span>
                {title}
                <span className="ml-2 text-sm font-normal text-gray-500">({suggestions.length})</span>
            </h4>

            <div className="space-y-3">
                {suggestions.map((suggestion, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`badge ${getBadgeClass(priority)}`}>
                                    {suggestion.type}
                                </span>
                                <span className="text-xs text-gray-500">• {suggestion.section}</span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">{suggestion.recommendation}</p>

                        {suggestion.example && (
                            <div className="bg-gray-50 border-l-4 border-primary-400 p-3 mt-2">
                                <p className="text-xs font-medium text-gray-600 mb-1">Example:</p>
                                <p className="text-xs text-gray-700 whitespace-pre-line font-mono">{suggestion.example}</p>
                            </div>
                        )}

                        {suggestion.keywordsToAdd && suggestion.keywordsToAdd.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="text-xs text-gray-600">Keywords to add:</span>
                                {suggestion.keywordsToAdd.map((keyword, kidx) => (
                                    <button
                                        key={kidx}
                                        onClick={() => navigator.clipboard.writeText(keyword)}
                                        className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded hover:bg-primary-200 transition-colors"
                                        title="Click to copy"
                                    >
                                        {keyword}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
