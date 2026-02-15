const API_KEY = process.env.GEMINI_API_KEY;

export async function getGeminiSuggestions(
    sectionText: string,
    sectionName: string,
    missingKeywords: string[]
): Promise<string[]> {
    if (!API_KEY) return [];

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    const prompt = `
    Act as an expert ATS Resume Optimizer.
    
    I have a resume section: "${sectionName}".
    The text is (truncated): "${sectionText.substring(0, 1000)}..."
    
    The ATS optimization analysis says it is missing these keywords: ${missingKeywords.join(', ')}.
    
    Please provide 3 specific, punchy bullet point rewrites or additions for this section that naturally incorporate some of these missing keywords.
    Target a professional tone. Do not explain yourself. Just give the bullet points.
    
    Format the output as a simple JSON array of strings, e.g. ["bullet 1", "bullet 2"].
    If you cannot generate good suggestions, return an empty array [].
  `;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            console.error('Gemini API Error:', await response.text());
            return [];
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Attempt to extract JSON array
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error('Failed to parse Gemini JSON', e);
            }
        }

        // Fallback parsing
        return text.split('\n')
            .filter((line: string) => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
            .map((line: string) => line.replace(/^[-*]\s*|^\d+\.\s*/, '').trim())
            .filter((line: string) => line.length > 10)
            .slice(0, 3);

    } catch (error) {
        console.error('Gemini Request Failed:', error);
        return [];
    }
}
