import { NextRequest, NextResponse } from 'next/server';
import { getGeminiSuggestions } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const { sectionText, sectionName, missingKeywords } = await request.json();

        if (!sectionName || !missingKeywords || missingKeywords.length === 0) {
            return NextResponse.json({ suggestions: [] });
        }

        const suggestions = await getGeminiSuggestions(sectionText || '', sectionName, missingKeywords);

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('Error generating suggestions:', error);
        return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
    }
}
