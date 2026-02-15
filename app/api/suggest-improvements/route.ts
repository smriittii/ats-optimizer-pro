// API Route: Generate improvement suggestions
import { NextRequest, NextResponse } from 'next/server';
import { generateSuggestions } from '@/lib/analysis/suggestions';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeText, jobDescription, missingKeywords, currentScore } = body;

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: 'Both resumeText and jobDescription are required' },
                { status: 400 }
            );
        }

        const suggestions = generateSuggestions(
            resumeText,
            jobDescription,
            missingKeywords || [],
            [], // Missing skills will be detected within the function
            currentScore || 0
        );

        // Estimate score impact
        const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high').length;
        const estimatedScoreImpact = Math.min(30, highPrioritySuggestions * 3);

        return NextResponse.json({
            suggestions,
            estimatedScoreImpact,
        });
    } catch (error: any) {
        console.error('Suggestions error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate suggestions' },
            { status: 500 }
        );
    }
}
