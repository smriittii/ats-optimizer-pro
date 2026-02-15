// Rule-based suggestion engine (no AI APIs required)
import type { Suggestion, SectionAnalysis } from '@/types';
import { detectSections, hasQuantification, extractActionVerbs } from '../utils/text';
import { calculateKeywordDensity } from './keywords';

/**
 * Generate improvement suggestions based on analysis
 */
export function generateSuggestions(
    resumeText: string,
    jobDescription: string,
    missingKeywords: string[],
    missingSkills: string[],
    currentScore: number
): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const sections = detectSections(resumeText);

    // Keyword suggestions (high priority if many missing)
    if (missingKeywords.length > 0) {
        const highPriorityKeywords = missingKeywords.slice(0, 10);
        const mediumPriorityKeywords = missingKeywords.slice(10, 20);

        for (const keyword of highPriorityKeywords) {
            suggestions.push({
                type: 'keyword',
                section: suggestSectionForKeyword(keyword, sections),
                priority: 'high',
                recommendation: `Add "${keyword}" to your resume if you have experience with it`,
                example: generateKeywordExample(keyword),
            });
        }

        for (const keyword of mediumPriorityKeywords) {
            suggestions.push({
                type: 'keyword',
                section: suggestSectionForKeyword(keyword, sections),
                priority: 'medium',
                recommendation: `Consider including "${keyword}" if relevant to your experience`,
            });
        }
    }

    // Skills suggestions
    if (missingSkills.length > 0) {
        for (const skill of missingSkills.slice(0, 5)) {
            suggestions.push({
                type: 'skills',
                section: 'Skills',
                priority: 'high',
                recommendation: `Add "${skill}" to your Skills section if you possess this skill`,
                keywordsToAdd: [skill],
            });
        }
    }

    // Structure suggestions
    const experienceSection = sections['experience'] || '';
    if (experienceSection) {
        const actionVerbs = extractActionVerbs(experienceSection);
        const hasQuant = hasQuantification(experienceSection);

        if (actionVerbs.length < 3) {
            suggestions.push({
                type: 'structure',
                section: 'Experience',
                priority: 'high',
                recommendation: 'Start bullets with strong action verbs like "Architected", "Implemented", "Optimized", "Led", or "Delivered"',
                example: 'Instead of: "Was responsible for building features"\nTry: "Architected and delivered 5 new features, improving user engagement by 25%"',
            });
        }

        if (!hasQuant) {
            suggestions.push({
                type: 'quantification',
                section: 'Experience',
                priority: 'high',
                recommendation: 'Add specific metrics and numbers to demonstrate impact',
                example: 'Instead of: "Improved system performance"\nTry: "Optimized database queries, reducing average response time by 40% and saving $50K annually"',
            });
        }
    }

    // Keyword density warnings
    for (const [sectionName, sectionText] of Object.entries(sections)) {
        const density = calculateKeywordDensity(sectionText, missingKeywords);

        if (density > 0.15) {
            suggestions.push({
                type: 'formatting',
                section: sectionName,
                priority: 'medium',
                recommendation: `Keyword density seems high in ${sectionName} section. Ensure keywords flow naturally to avoid appearing as "keyword stuffing"`,
            });
        }
    }

    // Section-specific suggestions
    if (!sections['skills'] || sections['skills'].length < 50) {
        suggestions.push({
            type: 'formatting',
            section: 'Skills',
            priority: 'medium',
            recommendation: 'Add or expand your Skills section with relevant technical skills from the job description',
        });
    }

    if (!sections['summary'] && !sections['objective']) {
        suggestions.push({
            type: 'structure',
            section: 'Summary',
            priority: 'low',
            recommendation: 'Consider adding a Professional Summary section highlighting your key qualifications',
            example: 'Example: "Senior Software Engineer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud infrastructure. Proven track record of delivering scalable solutions that increase efficiency by 30%+"',
        });
    }

    return suggestions;
}

/**
 * Suggest which section to add a keyword to
 */
function suggestSectionForKeyword(keyword: string, sections: { [key: string]: string }): string {
    const lowerKeyword = keyword.toLowerCase();

    // Technical skills usually go in Skills section
    const technicalIndicators = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes', 'git', 'api', 'framework', 'library'];
    if (technicalIndicators.some(tech => lowerKeyword.includes(tech))) {
        return 'Skills';
    }

    // Methodologies and practices often fit in Experience
    const methodologyIndicators = ['agile', 'scrum', 'ci/cd', 'devops', 'testing', 'deployment'];
    if (methodologyIndicators.some(method => lowerKeyword.includes(method))) {
        return 'Experience';
    }

    // Default to Skills section
    return 'Skills';
}

/**
 * Generate example for how to use a keyword
 */
function generateKeywordExample(keyword: string): string {
    const templates = [
        `"Utilized ${keyword} to enhance system performance and reliability"`,
        `"Implemented solutions using ${keyword}, resulting in improved efficiency"`,
        `"Proficient in ${keyword} with hands-on experience in production environments"`,
        `"Leveraged ${keyword} to deliver scalable and maintainable code"`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Analyze resume sections for quality
 */
export function analyzeSections(resumeText: string, keywords: string[]): SectionAnalysis {
    const sections = detectSections(resumeText);
    const analysis: SectionAnalysis = {};

    for (const [name, text] of Object.entries(sections)) {
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const actionVerbs = extractActionVerbs(text);
        const hasQuant = hasQuantification(text);

        let keywordCount = 0;
        const foundKeywords = new Set<string>();
        const lowerText = text.toLowerCase();

        for (const keyword of keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                keywordCount++;
                foundKeywords.add(keyword);
            }
        }

        // Determine quality based on keyword count and content quality
        let quality: 'good' | 'medium' | 'poor' | 'unknown' = 'unknown';
        if (words.length > 20) {
            if (keywordCount >= 5) {
                quality = 'good';
            } else if (keywordCount >= 2) {
                quality = 'medium';
            } else {
                quality = 'poor';
            }
        }

        // Suggest missing keywords relevant to this section
        const missingKeywords = keywords.filter(k => !foundKeywords.has(k));
        const suggestedKeywords = missingKeywords.slice(0, 5);

        analysis[name] = {
            wordCount: words.length,
            keywordCount,
            keywordDensity: words.length > 0 ? keywordCount / words.length : 0,
            hasActionVerbs: actionVerbs.length > 0,
            hasQuantification: hasQuant,
            quality,
            suggestedKeywords,
        };
    }

    return analysis;
}
