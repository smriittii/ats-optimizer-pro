import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface KeywordInsight {
    keyword: string;
    tier: 'critical' | 'important' | 'nice-to-have';
    reason: string;
    inResume: boolean;
}

export interface SectionOptimization {
    section: string;
    issue: string;
    suggestion: string;
    rewrittenBullets: string[];
    keywordsAdded: string[];
}

export interface ClaudeAnalysis {
    keywordInsights: KeywordInsight[];
    sectionOptimizations: SectionOptimization[];
    overallFeedback: string;
}

// ─── Keyword Detection ───────────────────────────────────────────────────────

export async function claudeDetectKeywords(
    resumeText: string,
    jobDescription: string
): Promise<KeywordInsight[]> {
    const prompt = `You are an expert ATS (Applicant Tracking System) keyword analyst. Analyze the job description and resume below.

Your task: Identify the most important keywords and phrases from the job description and classify them by importance for ATS matching.

JOB DESCRIPTION:
${jobDescription.substring(0, 3000)}

RESUME TEXT:
${resumeText.substring(0, 3000)}

Respond ONLY with a valid JSON array. No commentary, no markdown, just the raw JSON.

Format:
[
  {
    "keyword": "exact keyword or phrase",
    "tier": "critical" | "important" | "nice-to-have",
    "reason": "one sentence explaining why this keyword matters for this role",
    "inResume": true | false
  }
]

Rules:
- "critical": Must-have keywords that ATS will filter on (required skills, job title, core technologies). Include 5-10.
- "important": Keywords that significantly boost match score (preferred skills, relevant tools). Include 5-10.
- "nice-to-have": Bonus keywords that help stand out (certifications, methodologies, soft skills). Include 3-7.
- Check carefully whether each keyword appears in the resume text (set inResume accordingly).
- Use the exact phrasing from the job description.
- Focus on skills, tools, technologies, certifications, and role-specific terms. Avoid generic words.`;

    try {
        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
        });

        const text = message.content[0].type === 'text' ? message.content[0].text : '';

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as KeywordInsight[];
        }
        return [];
    } catch (error) {
        console.error('Claude keyword detection error:', error);
        return [];
    }
}

// ─── Resume Optimization ─────────────────────────────────────────────────────

export async function claudeOptimizeResume(
    resumeText: string,
    jobDescription: string,
    missingKeywords: string[]
): Promise<{ optimizations: SectionOptimization[]; overallFeedback: string }> {
    const prompt = `You are a professional resume optimizer, similar to Jobscan. Your goal is to help a candidate's resume pass ATS screening and impress human reviewers.

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

CURRENT RESUME:
${resumeText.substring(0, 3000)}

MISSING KEYWORDS (not found in resume but required by JD):
${missingKeywords.slice(0, 20).join(', ')}

Your task: Provide specific, actionable resume optimizations section by section.

Respond ONLY with a valid JSON object. No commentary, no markdown, just raw JSON.

Format:
{
  "overallFeedback": "2-3 sentence overall assessment and top priority action",
  "optimizations": [
    {
      "section": "Section name (e.g. Work Experience, Skills, Summary)",
      "issue": "What is currently wrong or missing in this section",
      "suggestion": "Clear instruction on what to change or add",
      "rewrittenBullets": ["Rewritten bullet 1 with keywords naturally embedded", "Rewritten bullet 2"],
      "keywordsAdded": ["keyword1", "keyword2"]
    }
  ]
}

Rules:
- Provide 3-5 section optimizations maximum.
- Each rewrittenBullets array should have 1-3 example bullet points showing exact text to use.
- Bullets must be strong: start with action verbs, include metrics/impact where possible, naturally embed missing keywords.
- keywordsAdded should list which missing keywords from the list are incorporated in this section's rewrites.
- Be specific and practical — give exact text, not vague advice.`;

    try {
        const message = await client.messages.create({
            model: 'claude-opus-4-5',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }],
        });

        const text = message.content[0].type === 'text' ? message.content[0].text : '';

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                optimizations: parsed.optimizations || [],
                overallFeedback: parsed.overallFeedback || '',
            };
        }

        return { optimizations: [], overallFeedback: '' };
    } catch (error) {
        console.error('Claude optimization error:', error);
        return { optimizations: [], overallFeedback: '' };
    }
}
