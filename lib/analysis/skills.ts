// Required skills detection from job descriptions
import { cleanText } from '../utils/text';

const REQUIRED_SKILL_MARKERS = [
    /required\s+(?:skills?|qualifications?|experience)/i,
    /must\s+have/i,
    /minimum\s+(?:qualifications?|requirements?)/i,
    /essential\s+skills?/i,
    /mandatory/i,
    /necessary\s+skills?/i,
];

const PREFERRED_SKILL_MARKERS = [
    /preferred\s+(?:skills?|qualifications?)/i,
    /nice\s+to\s+have/i,
    /bonus/i,
    /plus/i,
    /desired/i,
];

/**
 * Extract skills from text near required/preferred markers
 */
function extractSkillsNearMarker(text: string, markers: RegExp[], windowSize: number = 500): string[] {
    const skills: Set<string> = new Set();
    const lowerText = text.toLowerCase();

    for (const marker of markers) {
        const matches = [...text.matchAll(new RegExp(marker.source, 'gi'))];

        for (const match of matches) {
            if (match.index !== undefined) {
                // Get text window after the marker
                const startPos = match.index;
                const endPos = Math.min(startPos + windowSize, text.length);
                const window = text.substring(startPos, endPos);

                // Extract potential skills (look for bullet points, commas, etc.)
                const skillCandidates = extractSkillCandidates(window);
                skillCandidates.forEach(skill => skills.add(skill));
            }
        }
    }

    return Array.from(skills);
}

/**
 * Extract skill candidates from a text window
 */
function extractSkillCandidates(text: string): string[] {
    const skills: string[] = [];

    // Split by bullets, newlines, or semicolons
    const items = text.split(/[•\-\*\n;]/);

    for (const item of items) {
        const trimmed = item.trim();

        // Skip very short or very long items
        if (trimmed.length < 3 || trimmed.length > 100) continue;

        // Look for skill-like patterns:
        // - Technology names (2-4 words)
        // - Tools, frameworks, languages
        const skillMatch = trimmed.match(/^([A-Za-z0-9\s\.\+\#\-]{2,50}?)(?:\s*[\(,]|$)/);

        if (skillMatch) {
            const skill = skillMatch[1].trim().toLowerCase();

            // Filter out non-skill phrases
            if (!skill.match(/^(the|and|or|with|for|experience|years?|minimum|required)$/i)) {
                skills.push(skill);
            }
        }
    }

    return skills;
}

/**
 * Detect required skills from job description
 */
export function detectRequiredSkills(jobDescription: string): string[] {
    const cleaned = cleanText(jobDescription);
    return extractSkillsNearMarker(cleaned, REQUIRED_SKILL_MARKERS);
}

/**
 * Detect preferred skills from job description
 */
export function detectPreferredSkills(jobDescription: string): string[] {
    const cleaned = cleanText(jobDescription);
    return extractSkillsNearMarker(cleaned, PREFERRED_SKILL_MARKERS);
}

/**
 * Check coverage of required skills in resume
 */
export function checkSkillsCoverage(
    resumeText: string,
    requiredSkills: string[]
): { covered: string[]; missing: string[] } {
    const lowerResume = resumeText.toLowerCase();
    const covered: string[] = [];
    const missing: string[] = [];

    for (const skill of requiredSkills) {
        const lowerSkill = skill.toLowerCase();

        // Check for exact match or close variations
        const variations = generateSkillVariations(lowerSkill);
        const found = variations.some(variant => lowerResume.includes(variant));

        if (found) {
            covered.push(skill);
        } else {
            missing.push(skill);
        }
    }

    return { covered, missing };
}

/**
 * Generate variations of a skill name for better matching
 */
function generateSkillVariations(skill: string): string[] {
    const variations = [skill];

    // Handle common abbreviations and variations
    const replacements: { [key: string]: string[] } = {
        'javascript': ['js', 'javascript', 'java script'],
        'typescript': ['ts', 'typescript', 'type script'],
        'reactjs': ['react', 'reactjs', 'react.js'],
        'nodejs': ['node', 'nodejs', 'node.js'],
        'python': ['python', 'py'],
        'c++': ['c++', 'cpp', 'c plus plus'],
        'c#': ['c#', 'csharp', 'c sharp'],
        'sql': ['sql', 'structured query language'],
        'nosql': ['nosql', 'no sql', 'no-sql'],
        'machine learning': ['ml', 'machine learning'],
        'artificial intelligence': ['ai', 'artificial intelligence'],
        'continuous integration': ['ci', 'continuous integration'],
        'continuous deployment': ['cd', 'continuous deployment'],
    };

    for (const [key, values] of Object.entries(replacements)) {
        if (values.some(v => skill.includes(v))) {
            variations.push(...values);
        }
    }

    return [...new Set(variations)];
}
