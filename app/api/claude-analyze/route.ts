import { NextRequest, NextResponse } from 'next/server';
import { claudeDetectKeywords, claudeOptimizeResume, ClaudeAnalysis } from '@/lib/claude';

export async function POST(req: NextRequest) {
    try {
        const { resumeText, jobDescription, missingKeywords = [] } = await req.json();

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: 'resumeText and jobDescription are required' },
                { status: 400 }
            );
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json(
                { error: 'Claude API key not configured' },
                { status: 503 }
            );
        }

        // Run both Claude calls in parallel for speed
        const [keywordInsights, { optimizations, overallFeedback }] = await Promise.all([
            claudeDetectKeywords(resumeText, jobDescription),
            claudeOptimizeResume(resumeText, jobDescription, missingKeywords),
        ]);

        const claudeAnalysis: ClaudeAnalysis = {
            keywordInsights,
            sectionOptimizations: optimizations,
            overallFeedback,
        };

        return NextResponse.json(claudeAnalysis);
    } catch (error: any) {
        console.error('Claude analyze API error:', error);
        return NextResponse.json(
            { error: error.message || 'Claude analysis failed' },
            { status: 500 }
        );
    }
}
