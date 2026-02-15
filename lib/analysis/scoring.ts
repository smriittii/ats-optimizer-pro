// Main scoring algorithm - optimized to match industry standards (Jobscan-style)
import type { ResumeAnalysis, ScoreBreakdown } from '@/types';
import { extractKeywords, countKeywordMatches } from './keywords';
import { calculateSemanticSimilarity } from './tfidf';
import { detectRequiredSkills, checkSkillsCoverage } from './skills';
import { hasTables, hasMultiColumn, detectSections } from '../utils/text';
import { calculateKeywordDensity } from './keywords';
import { generateSuggestions, analyzeSections } from './suggestions';

/**
 * Main scoring function - calculates overall ATS score
 * Optimized to be encouraging while still accurate (like Jobscan)
 */
export function calculateATSScore(
    resumeText: string,
    jobDescription: string
): ResumeAnalysis {
    // Extract keywords from job description (top 40)
    const jobKeywords = extractKeywords(jobDescription, 40);

    // 1. Keyword Match Score (50% - increased from 40%)
    const keywordMatchScore = calculateKeywordMatchScore(resumeText, jobKeywords);

    // 2. Semantic Similarity Score (20% - reduced from 25%)
    const semanticScore = calculateSemanticSimilarityScore(resumeText, jobDescription);

    // 3. Required Skills Coverage (15%)
    const skillsScore = calculateSkillsCoverageScore(resumeText, jobDescription);

    // 4. Keyword Distribution Quality (10%)
    const distributionScore = calculateDistributionQualityScore(resumeText, jobKeywords);

    // 5. ATS Heuristics (5% - reduced from 10%)
    const heuristicsScore = calculateATSHeuristicsScore(resumeText);

    // Calculate final weighted score
    const finalScore = Math.round(
        keywordMatchScore.score * 0.50 +
        semanticScore.score * 0.20 +
        skillsScore.score * 0.15 +
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
 * Calculate keyword match score (50% weight)
 * More lenient - gives partial credit and boosts scores
 */
function calculateKeywordMatchScore(resumeText: string, jobKeywords: string[]) {
    const { matched, missing } = countKeywordMatches(resumeText, jobKeywords);
    const matchRate = matched.length / jobKeywords.length;

    // Apply score boost curve (industry standard approach)
    // This rewards even moderate matches more generously
    let score: number;
    if (matchRate >= 0.8) {
        score = 90 + (matchRate - 0.8) * 50; // 80%+ match = 90-100 score
    } else if (matchRate >= 0.6) {
        score = 75 + (matchRate - 0.6) * 75; // 60-80% match = 75-90 score
    } else if (matchRate >= 0.4) {
        score = 60 + (matchRate - 0.4) * 75; // 40-60% match = 60-75 score
    } else if (matchRate >= 0.2) {
        score = 45 + (matchRate - 0.2) * 75; // 20-40% match = 45-60 score
    } else {
        score = matchRate * 225; // 0-20% match = 0-45 score
    }

    return {
        score: Math.round(score),
        matched: matched.length,
        total: jobKeywords.length,
        matchedKeywords: matched,
    };
}

/**
 * Calculate semantic similarity score (20% weight)
 * Boosted to be more encouraging
 */
function calculateSemanticSimilarityScore(resumeText: string, jobDescription: string) {
    const rawSimilarity = calculateSemanticSimilarity(resumeText, jobDescription);

    // Boost the similarity score (TF-IDF tends to be conservative)
    // Apply a curve that rewards moderate similarity more generously
    let boostedScore: number;
    if (rawSimilarity >= 70) {
        boostedScore = 85 + (rawSimilarity - 70) * 0.5; // 70+ = 85-100
    } else if (rawSimilarity >= 50) {
        boostedScore = 70 + (rawSimilarity - 50) * 0.75; // 50-70 = 70-85
    } else if (rawSimilarity >= 30) {
        boostedScore = 55 + (rawSimilarity - 30) * 0.75; // 30-50 = 55-70
    } else {
        boostedScore = rawSimilarity * 1.8; // 0-30 = 0-55
    }

    return {
        score: Math.round(Math.min(100, boostedScore)),
        similarity: rawSimilarity / 100, // Return original as 0-1 for display
    };
}

/**
 * Calculate required skills coverage score (15% weight)
 * More forgiving when skills aren't explicitly listed
 */
function calculateSkillsCoverageScore(resumeText: string, jobDescription: string) {
    const requiredSkills = detectRequiredSkills(jobDescription);

    if (requiredSkills.length === 0) {
        // If no required skills detected, give high score (not perfect)
        return {
            score: 95,
            covered: [],
            missing: [],
            total: 0,
        };
    }

    const { covered, missing } = checkSkillsCoverage(resumeText, requiredSkills);
    const coverageRate = covered.length / requiredSkills.length;

    // Apply generous curve for skills
    let score: number;
    if (coverageRate >= 0.8) {
        score = 90 + (coverageRate - 0.8) * 50; // 80%+ = 90-100
    } else if (coverageRate >= 0.6) {
        score = 75 + (coverageRate - 0.6) * 75; // 60-80% = 75-90
    } else if (coverageRate >= 0.4) {
        score = 60 + (coverageRate - 0.4) * 75; // 40-60% = 60-75
    } else {
        score = coverageRate * 150; // 0-40% = 0-60
    }

    return {
        score: Math.round(score),
        covered,
        missing,
        total: requiredSkills.length,
    };
}

/**
 * Calculate keyword distribution quality score (10% weight)
 * Less harsh on distribution issues
 */
function calculateDistributionQualityScore(resumeText: string, jobKeywords: string[]) {
    const sections = detectSections(resumeText);
    const details: { [section: string]: any } = {};
    let totalPenalty = 0;
    let sectionsAnalyzed = 0;

    // Analyze each major section
    const majorSections = ['experience', 'skills', 'summary', 'projects'];

    for (const sectionName of majorSections) {
        if (sections[sectionName]) {
            sectionsAnalyzed++;
            const sectionText = sections[sectionName];
            const words = sectionText.split(/\s+/).length;

            // Count keywords in this section
            let keywordCount = 0;
            const lowerText = sectionText.toLowerCase();
            for (const keyword of jobKeywords) {
                const matches = lowerText.match(new RegExp(keyword.toLowerCase(), 'g'));
                if (matches) {
                    keywordCount += matches.length;
                }
            }

            const density = words > 0 ? keywordCount / words : 0;
            const isStuffed = density > 0.20; // Increased threshold from 0.15 to 0.20

            details[sectionName] = {
                density: Math.round(density * 100) / 100,
                keywordCount,
                isStuffed,
            };

            // Gentler penalty for keyword stuffing (reduced from 20)
            if (isStuffed) {
                totalPenalty += 10;
            }
        }
    }

    // Check for even distribution (keywords shouldn't all be in one section)
    const keywordCounts = Object.values(details).map((d: any) => d.keywordCount);
    const hasEvenDistribution = keywordCounts.filter(c => c > 0).length >= 2;

    if (!hasEvenDistribution && sectionsAnalyzed > 1) {
        totalPenalty += 10; // Reduced from 15
    }

    const score = Math.max(70, 100 - totalPenalty); // Floor of 70 instead of 0

    return {
        score,
        details,
    };
}

/**
 * Calculate ATS heuristics score (5% weight - reduced impact)
 * Much more lenient - these are suggestions, not dealbreakers
 */
function calculateATSHeuristicsScore(resumeText: string) {
    const issues: string[] = [];
    const passed: string[] = [];
    let penalties = 0;

    // Check for tables (reduced penalty from 30 to 15)
    if (hasTables(resumeText)) {
        issues.push('Tables detected - may not parse correctly in ATS');
        penalties += 15;
    } else {
        passed.push('No tables detected');
    }

    // Check for multi-column layout (reduced penalty from 25 to 15)
    if (hasMultiColumn(resumeText)) {
        issues.push('Multi-column layout detected - may confuse ATS');
        penalties += 15;
    } else {
        passed.push('Single-column layout');
    }

    // Check for standard sections (reduced penalty from 20 to 10)
    const sections = detectSections(resumeText);
    const hasStandardSections = ['experience', 'education', 'skills'].every(
        section => sections[section] && sections[section].length > 20
    );

    if (!hasStandardSections) {
        issues.push('Missing one or more standard sections (Experience, Education, Skills)');
        penalties += 10;
    } else {
        passed.push('Standard sections present');
    }

    // Check resume length (reduced penalties)
    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount < 200) {
        issues.push('Resume may be too short (less than 200 words)');
        penalties += 10; // Reduced from 15
    } else if (wordCount > 2000) {
        issues.push('Resume may be too long (over 2000 words) - consider condensing');
        penalties += 5; // Reduced from 10
    } else {
        passed.push('Appropriate length');
    }

    const score = Math.max(75, 100 - penalties); // Floor of 75 instead of 0

    return {
        score,
        issues,
        passed,
    };
}
