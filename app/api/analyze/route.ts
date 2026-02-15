// API Route: Analyze resume vs job description and generate score
import { NextRequest, NextResponse } from 'next/server';
import { calculateATSScore } from '@/lib/analysis/scoring';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeText, jobDescription, excludedKeywords } = body;

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: 'Both resumeText and jobDescription are required' },
                { status: 400 }
            );
        }

        // Calculate ATS score with optional excluded keywords
        const analysis = calculateATSScore(
            resumeText,
            jobDescription,
            excludedKeywords || []
        );

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze resume' },
            { status: 500 }
        );
    }
}
