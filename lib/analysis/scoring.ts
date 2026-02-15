// Main scoring algorithm - ULTRA-optimized to match Jobscan closely
import type { ResumeAnalysis, ScoreBreakdown } from '@/types';
import { extractKeywords, countKeywordMatches } from './keywords';
import { calculateSemanticSimilarity } from './tfidf';
import { detectRequiredSkills, checkSkillsCoverage } from './skills';
import { hasTables, hasMultiColumn, detectSections } from '../utils/text';
import { calculateKeywordDensity } from './keywords';
import { generateSuggestions, analyzeSections } from './suggestions';

/**
 * Main scoring function - AGGRESSIVE boost to match industry leaders
 * Target: 93% match on Jobscan = ~90% here
 */
export function calculateATSScore(
    resumeText: string,
    jobDescription: string,
    excludedKeywords: string[] = []
): ResumeAnalysis {
    // Extract keywords from job description (top 40)
    let jobKeywords = extractKeywords(jobDescription, 40);

    // Filter out excluded keywords
    if (excludedKeywords.length > 0) {
        const excludedSet = new Set(excludedKeywords.map(k => k.toLowerCase()));
        jobKeywords = jobKeywords.filter(k => !excludedSet.has(k.toLowerCase()));
    }

    // 1. Keyword Match Score (55% - increased from 50%)
    const keywordMatchScore = calculateKeywordMatchScore(resumeText, jobKeywords);

    // 2. Semantic Similarity Score (20%)
    const semanticScore = calculateSemanticSimilarityScore(resumeText, jobDescription);

    // 3. Required Skills Coverage (10% - reduced from 15%)
    const skillsScore = calculateSkillsCoverageScore(resumeText, jobDescription);

    // 4. Keyword Distribution Quality (10%)
    const distributionScore = calculateDistributionQualityScore(resumeText, jobKeywords);

    // 5. ATS Heuristics (5%)
    const heuristicsScore = calculateATSHeuristicsScore(resumeText);

    // Calculate final weighted score
    const finalScore = Math.round(
        keywordMatchScore.score * 0.55 +
        semanticScore.score * 0.20 +
        skillsScore.score * 0.10 +
        distributionScore.score * 0.10 +
        heuristicsScore.score * 0.05
    );

    // Generate suggestions
    const { missing: missingKeywords } = countKeywordMatches(resumeText, jobKeywords);
    const suggestions = generateSuggestions(
        resumeText,
        jobDescription,
        missingKeywords,
        skillsScore.missing,
        finalScore
    );

    // Analyze sections
    const sectionAnalysis = analyzeSections(resumeText, jobKeywords);

    return {
        score: finalScore,
        breakdown: {
            keywordMatch: keywordMatchScore,
            semanticSimilarity: semanticScore,
            requiredSkills: skillsScore,
            distributionQuality: distributionScore,
            atsHeuristics: heuristicsScore,
        },
        missingKeywords: missingKeywords.slice(0, 15), // Top 15 missing
        strongMatches: keywordMatchScore.matchedKeywords.slice(0, 15), // Top 15 matched
        suggestions,
        sectionAnalysis,
    };
}

/**
 * ULTRA-GENEROUS keyword match scoring
 * Industry tools give high scores for 50-60% matches
 */
function calculateKeywordMatchScore(resumeText: string, jobKeywords: string[]) {
    const { matched, missing } = countKeywordMatches(resumeText, jobKeywords);
    const matchRate = matched.length / jobKeywords.length;

    // AGGRESSIVE boost curve (matches Jobscan behavior)
    let score: number;
    if (matchRate >= 0.90) {
        score = 95 + (matchRate - 0.90) * 50; // 90%+ match = 95-100 score
    } else if (matchRate >= 0.75) {
        score = 88 + (matchRate - 0.75) * 50; // 75-90% match = 88-95 score
    } else if (matchRate >= 0.60) {
        score = 80 + (matchRate - 0.60) * 53; // 60-75% match = 80-88 score
    } else if (matchRate >= 0.45) {
        score = 70 + (matchRate - 0.45) * 67; // 45-60% match = 70-80 score
    } else if (matchRate >= 0.30) {
        score = 58 + (matchRate - 0.30) * 80; // 30-45% match = 58-70 score
    } else if (matchRate >= 0.15) {
        score = 45 + (matchRate - 0.15) * 87; // 15-30% match = 45-58 score
    } else {
        score = matchRate * 300; // 0-15% match = 0-45 score
    }

    return {
        score: Math.round(Math.min(100, score)),
        matched: matched.length,
        total: jobKeywords.length,
        matchedKeywords: matched,
    };
}

/**
 * Semantic similarity - already boosted in tfidf.ts
 */
function calculateSemanticSimilarityScore(resumeText: string, jobDescription: string) {
    const similarity = calculateSemanticSimilarity(resumeText, jobDescription);

    return {
        score: similarity, // Already boosted in the function
        similarity: similarity / 100,
    };
}

/**
 * ULTRA-generous skills scoring
 */
function calculateSkillsCoverageScore(resumeText: string, jobDescription: string) {
    const requiredSkills = detectRequiredSkills(jobDescription);

    if (requiredSkills.length === 0) {
        return {
            score: 98, // Very high for no explicit skills
            covered: [],
            missing: [],
            total: 0,
        };
    }

    const { covered, missing } = checkSkillsCoverage(resumeText, requiredSkills);
    const coverageRate = covered.length / requiredSkills.length;

    // EXTREMELY generous curve
    let score: number;
    if (coverageRate >= 0.85) {
        score = 95 + (coverageRate - 0.85) * 33; // 85%+ = 95-100
    } else if (coverageRate >= 0.70) {
        score = 88 + (coverageRate - 0.70) * 47; // 70-85% = 88-95
    } else if (coverageRate >= 0.50) {
        score = 78 + (coverageRate - 0.50) * 50; // 50-70% = 78-88
    } else if (coverageRate >= 0.30) {
        score = 65 + (coverageRate - 0.30) * 65; // 30-50% = 65-78
    } else {
        score = coverageRate * 217; // 0-30% = 0-65
    }

    return {
        score: Math.round(score),
        covered,
        missing,
        total: requiredSkills.length,
    };
}

/**
 * Distribution quality - already generous
 */
function calculateDistributionQualityScore(resumeText: string, jobKeywords: string[]) {
    const sections = detectSections(resumeText);
    const details: { [section: string]: any } = {};
    let totalPenalty = 0;
    let sectionsAnalyzed = 0;

    const majorSections = ['experience', 'skills', 'summary', 'projects'];

    for (const sectionName of majorSections) {
        if (sections[sectionName]) {
            sectionsAnalyzed++;
            const sectionText = sections[sectionName];
            const words = sectionText.split(/\s+/).length;

            let keywordCount = 0;
            const lowerText = sectionText.toLowerCase();
            for (const keyword of jobKeywords) {
                const matches = lowerText.match(new RegExp(keyword.toLowerCase(), 'g'));
                if (matches) {
                    keywordCount += matches.length;
                }
            }

            const density = words > 0 ? keywordCount / words : 0;
            const isStuffed = density > 0.25; // Increased threshold

            details[sectionName] = {
                density: Math.round(density * 100) / 100,
                keywordCount,
                isStuffed,
            };

            if (isStuffed) {
                totalPenalty += 8; // Further reduced
            }
        }
    }

    const keywordCounts = Object.values(details).map((d: any) => d.keywordCount);
    const hasEvenDistribution = keywordCounts.filter(c => c > 0).length >= 2;

    if (!hasEvenDistribution && sectionsAnalyzed > 1) {
        totalPenalty += 7; // Further reduced
    }

    const score = Math.max(75, 100 - totalPenalty); // Floor of 75

    return {
        score,
        details,
    };
}

/**
 * ATS heuristics - minimal impact
 */
function calculateATSHeuristicsScore(resumeText: string) {
    const issues: string[] = [];
    const passed: string[] = [];
    let penalties = 0;

    if (hasTables(resumeText)) {
        issues.push('Tables detected - may not parse correctly in ATS');
        penalties += 12; // Reduced
    } else {
        passed.push('No tables detected');
    }

    if (hasMultiColumn(resumeText)) {
        issues.push('Multi-column layout detected - may confuse ATS');
        penalties += 10; // Reduced
    } else {
        passed.push('Single-column layout');
    }

    const sections = detectSections(resumeText);
    const hasStandardSections = ['experience', 'education', 'skills'].every(
        section => sections[section] && sections[section].length > 20
    );

    if (!hasStandardSections) {
        issues.push('Missing one or more standard sections (Experience, Education, Skills)');
        penalties += 8; // Reduced
    } else {
        passed.push('Standard sections present');
    }

    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount < 200) {
        issues.push('Resume may be too short (less than 200 words)');
        penalties += 5; // Reduced
    } else if (wordCount > 2000) {
        issues.push('Resume may be too long (over 2000 words) - consider condensing');
        penalties += 3; // Reduced
    } else {
        passed.push('Appropriate length');
    }

    const score = Math.max(80, 100 - penalties); // Floor of 80

    return {
        score,
        issues,
        passed,
    };
}
