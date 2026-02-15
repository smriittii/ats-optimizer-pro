// Main scoring algorithm - combines all scoring components
import type { ResumeAnalysis, ScoreBreakdown } from '@/types';
import { extractKeywords, countKeywordMatches } from './keywords';
import { calculateSemanticSimilarity } from './tfidf';
import { detectRequiredSkills, checkSkillsCoverage } from './skills';
import { hasTables, hasMultiColumn, detectSections } from '../utils/text';
import { calculateKeywordDensity } from './keywords';
import { generateSuggestions, analyzeSections } from './suggestions';

/**
 * Main scoring function - calculates overall ATS score
 */
export function calculateATSScore(
    resumeText: string,
    jobDescription: string
): ResumeAnalysis {
    // Extract keywords from job description (top 40)
    const jobKeywords = extractKeywords(jobDescription, 40);

    // 1. Keyword Match Score (40%)
    const keywordMatchScore = calculateKeywordMatchScore(resumeText, jobKeywords);

    // 2. Semantic Similarity Score (25%)
    const semanticScore = calculateSemanticSimilarityScore(resumeText, jobDescription);

    // 3. Required Skills Coverage (15%)
    const skillsScore = calculateSkillsCoverageScore(resumeText, jobDescription);

    // 4. Keyword Distribution Quality (10%)
    const distributionScore = calculateDistributionQualityScore(resumeText, jobKeywords);

    // 5. ATS Heuristics (10%)
    const heuristicsScore = calculateATSHeuristicsScore(resumeText);

    // Calculate final weighted score
    const finalScore = Math.round(
        keywordMatchScore.score * 0.40 +
        semanticScore.score * 0.25 +
        skillsScore.score * 0.15 +
        distributionScore.score * 0.10 +
        heuristicsScore.score * 0.10
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
 * Calculate keyword match score (40% weight)
 */
function calculateKeywordMatchScore(resumeText: string, jobKeywords: string[]) {
    const { matched, missing } = countKeywordMatches(resumeText, jobKeywords);
    const matchRate = matched.length / jobKeywords.length;
    const score = Math.round(matchRate * 100);

    return {
        score,
        matched: matched.length,
        total: jobKeywords.length,
        matchedKeywords: matched,
    };
}

/**
 * Calculate semantic similarity score (25% weight)
 */
function calculateSemanticSimilarityScore(resumeText: string, jobDescription: string) {
    const similarity = calculateSemanticSimilarity(resumeText, jobDescription);

    return {
        score: similarity,
        similarity: similarity / 100, // Return as 0-1 for display
    };
}

/**
 * Calculate required skills coverage score (15% weight)
 */
function calculateSkillsCoverageScore(resumeText: string, jobDescription: string) {
    const requiredSkills = detectRequiredSkills(jobDescription);

    if (requiredSkills.length === 0) {
        // If no required skills detected, give full score
        return {
            score: 100,
            covered: [],
            missing: [],
            total: 0,
        };
    }

    const { covered, missing } = checkSkillsCoverage(resumeText, requiredSkills);
    const coverageRate = covered.length / requiredSkills.length;
    const score = Math.round(coverageRate * 100);

    return {
        score,
        covered,
        missing,
        total: requiredSkills.length,
    };
}

/**
 * Calculate keyword distribution quality score (10% weight)
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
            const isStuffed = density > 0.15; // More than 15% keyword density is suspicious

            details[sectionName] = {
                density: Math.round(density * 100) / 100,
                keywordCount,
                isStuffed,
            };

            // Penalize keyword stuffing
            if (isStuffed) {
                totalPenalty += 20;
            }
        }
    }

    // Check for even distribution (keywords shouldn't all be in one section)
    const keywordCounts = Object.values(details).map((d: any) => d.keywordCount);
    const hasEvenDistribution = keywordCounts.filter(c => c > 0).length >= 2;

    if (!hasEvenDistribution && sectionsAnalyzed > 1) {
        totalPenalty += 15;
    }

    const score = Math.max(0, 100 - totalPenalty);

    return {
        score,
        details,
    };
}

/**
 * Calculate ATS heuristics score (10% weight)
 */
function calculateATSHeuristicsScore(resumeText: string) {
    const issues: string[] = [];
    const passed: string[] = [];
    let penalties = 0;

    // Check for tables
    if (hasTables(resumeText)) {
        issues.push('Tables detected - may not parse correctly in ATS');
        penalties += 30;
    } else {
        passed.push('No tables detected');
    }

    // Check for multi-column layout
    if (hasMultiColumn(resumeText)) {
        issues.push('Multi-column layout detected - may confuse ATS');
        penalties += 25;
    } else {
        passed.push('Single-column layout');
    }

    // Check for standard sections
    const sections = detectSections(resumeText);
    const hasStandardSections = ['experience', 'education', 'skills'].every(
        section => sections[section] && sections[section].length > 20
    );

    if (!hasStandardSections) {
        issues.push('Missing one or more standard sections (Experience, Education, Skills)');
        penalties += 20;
    } else {
        passed.push('Standard sections present');
    }

    // Check resume length (too short or too long)
    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount < 200) {
        issues.push('Resume may be too short (less than 200 words)');
        penalties += 15;
    } else if (wordCount > 2000) {
        issues.push('Resume may be too long (over 2000 words) - consider condensing');
        penalties += 10;
    } else {
        passed.push('Appropriate length');
    }

    const score = Math.max(0, 100 - penalties);

    return {
        score,
        issues,
        passed,
    };
}
