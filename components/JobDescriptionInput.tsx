'use client';

interface JobDescriptionInputProps {
    value: string;
    onChange: (value: string) => void;
}

export default function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
    const charCount = value.length;
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

    const handleClear = () => {
        onChange('');
    };

    return (
        <div className="space-y-3">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste the job description here...

Include requirements, qualifications, and responsibilities for best results."
                className="input min-h-[300px] resize-y font-mono text-sm"
                rows={15}
            />

            <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    {wordCount} words • {charCount} characters
                </div>

                {value && (
                    <button
                        onClick={handleClear}
                        className="text-xs text-gray-600 hover:text-gray-900 underline"
                    >
                        Clear
                    </button>
                )}
            </div>

            {wordCount > 0 && wordCount < 50 && (
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                    <p className="text-xs text-warning-800">
                        The job description seems short. For better analysis, include more details about requirements and responsibilities.
                    </p>
                </div>
            )}
        </div>
    );
}
