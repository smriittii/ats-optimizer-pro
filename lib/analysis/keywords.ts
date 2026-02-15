// Keyword extraction from job descriptions
import { extractAllNGrams } from './ngrams';
import { cleanText } from '../utils/text';
import type { KeywordData } from '@/types';

/**
 * Extract top keywords from job description
 */
export function extractKeywords(jobDescription: string, count: number = 40): string[] {
    const cleaned = cleanText(jobDescription);
    const ngrams = extractAllNGrams(cleaned, count);

    return ngrams.map(ng => ng.text);
}

/**
 * Extract keywords with their frequency and positions
 */
export function extractKeywordsWithData(text: string, count: number = 40): KeywordData[] {
    const cleaned = cleanText(text);
    const ngrams = extractAllNGrams(cleaned, count);
    const lowerText = cleaned.toLowerCase();

    return ngrams.map(ng => {
        const positions: number[] = [];
        let pos = 0;

        while ((pos = lowerText.indexOf(ng.text, pos)) !== -1) {
            positions.push(pos);
            pos += ng.text.length;
        }

        return {
            keyword: ng.text,
            frequency: ng.count,
            positions,
        };
    });
}

/**
 * Check if a keyword exists in resume text
 */
export function hasKeyword(resumeText: string, keyword: string): boolean {
    const lowerResume = resumeText.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    return lowerResume.includes(lowerKeyword);
}

/**
 * Count keyword matches between resume and job description
 */
export function countKeywordMatches(
    resumeText: string,
    jobKeywords: string[]
): { matched: string[]; missing: string[] } {
    const matched: string[] = [];
    const missing: string[] = [];

    for (const keyword of jobKeywords) {
        if (hasKeyword(resumeText, keyword)) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    }

    return { matched, missing };
}

/**
 * Calculate keyword density for a text section
 */
export function calculateKeywordDensity(
    text: string,
    keywords: string[]
): number {
    const words = text.toLowerCase().split(/\s+/).length;
    if (words === 0) return 0;

    let keywordCount = 0;
    const lowerText = text.toLowerCase();

    for (const keyword of keywords) {
        const matches = lowerText.match(new RegExp(keyword.toLowerCase(), 'g'));
        if (matches) {
            keywordCount += matches.length;
        }
    }

    return keywordCount / words;
}
