'use client';

interface KeywordListProps {
    keywords: string[];
    type: 'missing' | 'matched';
}

export default function KeywordList({ keywords, type }: KeywordListProps) {
    const bgColor = type === 'missing' ? 'bg-warning-50 hover:bg-warning-100' : 'bg-success-50 hover:bg-success-100';
    const borderColor = type === 'missing' ? 'border-warning-200' : 'border-success-200';
    const textColor = type === 'missing' ? 'text-warning-900' : 'text-success-900';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {keywords.map((keyword, idx) => (
                <div
                    key={idx}
                    className={`${bgColor} ${borderColor} ${textColor} border rounded-lg p-3 transition-colors`}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{keyword}</span>
                        {type === 'missing' && (
                            <button
                                onClick={() => navigator.clipboard.writeText(keyword)}
                                className="text-warning-600 hover:text-warning-800 text-xs ml-2"
                                title="Copy keyword"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
