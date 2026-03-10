import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

        const prompt = `You are an expert resume optimizer. Rewrite the following resume section by section, naturally embedding the missing keywords without keyword stuffing.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

MISSING KEYWORDS TO EMBED:
${missingKeywords.slice(0, 20).join(', ')}

Rewrite each section of the resume. Return ONLY a valid JSON array. No commentary, no markdown, just raw JSON.

Format:
[
  {
    "section": "Section name (e.g. Summary, Experience, Skills)",
    "original": "The original text of this section",
    "rewritten": "The rewritten text with keywords naturally embedded",
    "keywordsAdded": ["keyword1", "keyword2"],
    "changes": "Brief explanation of what was changed and why"
  }
]

Rules:
- Keep the same structure and format as the original
- Embed keywords naturally — never force them in awkwardly
- Keep the same tone and voice
- Don't fabricate experience or skills the person doesn't have
- Focus on Summary, Experience, and Skills sections primarily
- Return all sections even if unchanged`;

        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }],
        });

        const text = message.content[0].type === 'text' ? message.content[0].text : '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
            const sections = JSON.parse(jsonMatch[0]);
            return NextResponse.json({ sections });
        }

        return NextResponse.json({ sections: [] });

    } catch (error: any) {
        console.error('Resume optimization error:', error);
        return NextResponse.json(
            { error: error.message || 'Optimization failed' },
            { status: 500 }
        );
    }
}