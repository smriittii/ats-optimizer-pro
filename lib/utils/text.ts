// Text preprocessing utilities

/**
 * Clean and normalize text
 */
export function cleanText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Tokenize text into words
 */
export function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0);
}

/**
 * Extract sentences from text
 */
export function extractSentences(text: string): string[] {
    return text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

/**
 * Detect resume sections using common headers
 */
export function detectSections(text: string): { [key: string]: string } {
    const sections: { [key: string]: string } = {};

    const sectionPatterns = [
        { name: 'summary', pattern: /(?:^|\n)((?:professional\s+)?summary|(?:career\s+)?objective|profile)(?:\s*:|\n)/i },
        { name: 'experience', pattern: /(?:^|\n)((?:work\s+)?experience|employment(?:\s+history)?|professional\s+background)(?:\s*:|\n)/i },
        { name: 'education', pattern: /(?:^|\n)(education|academic\s+background|qualifications)(?:\s*:|\n)/i },
        { name: 'skills', pattern: /(?:^|\n)((?:technical\s+)?skills|competencies|expertise)(?:\s*:|\n)/i },
        { name: 'certifications', pattern: /(?:^|\n)(certifications?|licenses?)(?:\s*:|\n)/i },
        { name: 'projects', pattern: /(?:^|\n)(projects?|portfolio)(?:\s*:|\n)/i },
    ];

    const lines = text.split('\n');
    let currentSection = 'header';
    let sectionContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let foundSection = false;

        for (const { name, pattern } of sectionPatterns) {
            if (pattern.test(line)) {
                // Save previous section
                if (sectionContent.length > 0) {
                    sections[currentSection] = sectionContent.join('\n').trim();
                }
                currentSection = name;
                sectionContent = [];
                foundSection = true;
                break;
            }
        }

        if (!foundSection) {
            sectionContent.push(line);
        }
    }

    // Save last section
    if (sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n').trim();
    }

    return sections;
}

/**
 * Remove special characters but keep hyphens and apostrophes
 */
export function normalizeWord(word: string): string {
    return word.toLowerCase().replace(/[^\w'-]/g, '');
}

/**
 * Check if text contains tables (common ATS issue)
 */
export function hasTables(text: string): boolean {
    // Check for common table indicators
    const tableIndicators = [
        /\|[\s\w]+\|/,  // Pipe-separated
        /\t\w+\t/,       // Tab-separated with content
        /┌|└|├|┤|─|│/,   // Box-drawing characters
    ];

    return tableIndicators.some(pattern => pattern.test(text));
}

/**
 * Check if text has multi-column layout indicators
 */
export function hasMultiColumn(text: string): boolean {
    const lines = text.split('\n');
    let multiColumnCount = 0;

    for (const line of lines) {
        // Check for multiple separate text blocks on same line
        const segments = line.split(/\s{5,}/); // 5+ spaces indicate columns
        if (segments.length > 1 && segments.every(s => s.trim().length > 10)) {
            multiColumnCount++;
        }
    }

    return multiColumnCount > 3;
}

/**
 * Extract action verbs from beginning of sentences
 */
export function extractActionVerbs(text: string): string[] {
    const actionVerbPattern = /^(achieved|administrated|analyzed|architected|built|collaborated|created|delivered|designed|developed|directed|engineered|enhanced|established|executed|facilitated|founded|generated|implemented|improved|increased|introduced|launched|led|managed|optimized|organized|performed|planned|produced|programmed|reduced|resolved|spearheaded|streamlined|strengthened)\b/i;

    const sentences = extractSentences(text);
    const verbs: string[] = [];

    for (const sentence of sentences) {
        const match = sentence.match(actionVerbPattern);
        if (match) {
            verbs.push(match[1].toLowerCase());
        }
    }

    return verbs;
}

/**
 * Check if text contains quantification (numbers, percentages, etc.)
 */
export function hasQuantification(text: string): boolean {
    const quantificationPattern = /\b\d+([,.]?\d+)*\s*(%|percent|million|thousand|billion|k|m|b|x|times|hours?|days?|weeks?|months?|years?)\b/i;
    return quantificationPattern.test(text);
}
