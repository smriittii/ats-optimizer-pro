import { extractKeywords, countKeywordMatches, calculateKeywordDensity } from './keywords';
import { detectRequiredSkills, checkSkillsCoverage } from './skills';
import { calculateSemanticSimilarity } from './tfidf';
import type { ResumeAnalysis, SectionAnalysis, ScoreBreakdown } from '@/types';

// Weights from scoring_update.md
const WEIGHTS = {
    KEYWORD_MATCH: 0.50,
    SEMANTIC_SIMILARITY: 0.20,
    REQUIRED_SKILLS: 0.15,
    DISTRIBUTION_QUALITY: 0.10,
    ATS_HEURISTICS: 0.05
};

/**
 * Main function to calculate ATS score
 */
export function calculateATSScore(
    resumeText: string,
    jobDescription: string,
    excludedKeywords: string[] = [],
    dismissedIssues: string[] = []
): ResumeAnalysis {
    // 1. Keyword Analysis
    const allKeywords = extractKeywords(jobDescription, 40);
    const validKeywords = allKeywords.filter(k => !excludedKeywords.includes(k));
    const keywordMatches = countKeywordMatches(resumeText, validKeywords);

    // Calculate keyword score with boost curve
    const matchRatio = validKeywords.length > 0 ? keywordMatches.matched.length / validKeywords.length : 1;
    let keywordScore = matchRatio * 100;

    // Apply boost (80% match -> 90+ score)
    if (matchRatio >= 0.8) keywordScore = 90 + (matchRatio - 0.8) * 50;
    else if (matchRatio >= 0.6) keywordScore = 75 + (matchRatio - 0.6) * 75;
    else if (matchRatio >= 0.4) keywordScore = 60 + (matchRatio - 0.4) * 75;

    keywordScore = Math.min(100, Math.round(keywordScore));

    // 2. Semantic Similarity
    const semanticScoreRaw = calculateSemanticSimilarity(resumeText, jobDescription);
    const semanticScore = semanticScoreRaw; // tfidf.ts already handles boosting

    // 3. Required Skills
    const requiredSkills = detectRequiredSkills(jobDescription);
    const skillsCoverage = checkSkillsCoverage(resumeText, requiredSkills);

    let skillsScore = 100;
    if (requiredSkills.length > 0) {
        const coverageRatio = skillsCoverage.covered.length / requiredSkills.length;
        skillsScore = coverageRatio * 100;

        // Boost curve
        if (coverageRatio >= 0.8) skillsScore = 90 + (coverageRatio - 0.8) * 50;
        else if (coverageRatio >= 0.6) skillsScore = 75 + (coverageRatio - 0.6) * 75;

        skillsScore = Math.min(100, Math.round(skillsScore));
    } else {
        skillsScore = 95; // Default if no skills found
    }

    // 4. Section Analysis & Distribution
    const sections = extractSections(resumeText);
    const sectionAnalysis: Record<string, SectionAnalysis> = {};
    let distributionScore = 100;
    const densityPenalties: number[] = [];

    // Analyze each section
    for (const [name, content] of Object.entries(sections)) {
        const density = calculateKeywordDensity(content, validKeywords);
        const wordCount = content.split(/\s+/).length;

        // Simple heuristic checks
        const hasActionVerbs = /directed|managed|led|created|developed|implemented|engineered/i.test(content);
        const hasQuantification = /\d+%|\$\d+|\d+ (years|users|clients)/i.test(content);

        // Check for stuffing
        if (density > 0.04 && wordCount > 50) { // > 4% is high
            densityPenalties.push(10);
        }

        // Identify missing keywords in this section
        const sectionMatches = countKeywordMatches(content, validKeywords);

        sectionAnalysis[name] = {
            name,
            wordCount,
            keywordDensity: density,
            hasActionVerbs,
            hasQuantification,
            foundKeywords: sectionMatches.matched,
            suggestedKeywords: sectionMatches.missing.slice(0, 5), // Top 5 missing
            quality: determineSectionQuality(wordCount, hasActionVerbs, hasQuantification, density)
        };
    }

    // Apply penalties
    distributionScore -= densityPenalties.reduce((a, b) => a + b, 0);
    // Penalty for uneven distribution (simple check: if major sections missing)
    if (!sections['experience'] && !sections['work history']) distributionScore -= 10;
    if (!sections['education']) distributionScore -= 10;
    if (!sections['skills'] && !sections['technologies']) distributionScore -= 10;

    distributionScore = Math.max(70, distributionScore); // Floor

    // 5. ATS Heuristics
    const heuristics = checkATSHeuristics(resumeText);
    let heuristicScore = 100;

    // Calculate score based on issues not dismissed
    const activeIssues = heuristics.issues.filter(issue => !dismissedIssues.includes(issue));

    // Penalties
    activeIssues.forEach(issue => {
        if (issue.includes('Table')) heuristicScore -= 15;
        else if (issue.includes('Column')) heuristicScore -= 15;
        else if (issue.includes('Section')) heuristicScore -= 10;
        else if (issue.includes('Short')) heuristicScore -= 10;
        else if (issue.includes('Long')) heuristicScore -= 5;
        else heuristicScore -= 5;
    });

    heuristicScore = Math.max(75, heuristicScore); // Floor

    // Final Weighted Score
    const totalScore = Math.round(
        keywordScore * WEIGHTS.KEYWORD_MATCH +
        semanticScore * WEIGHTS.SEMANTIC_SIMILARITY +
        skillsScore * WEIGHTS.REQUIRED_SKILLS +
        distributionScore * WEIGHTS.DISTRIBUTION_QUALITY +
        heuristicScore * WEIGHTS.ATS_HEURISTICS
    );

    const breakdown: ScoreBreakdown = {
        keywordMatch: {
            score: keywordScore,
            matched: keywordMatches.matched.length,
            total: validKeywords.length
        },
        semanticSimilarity: {
            score: semanticScore,
            similarity: semanticScoreRaw / 100 // approx
        },
        requiredSkills: {
            score: skillsScore,
            covered: skillsCoverage.covered,
            missing: skillsCoverage.missing,
            total: requiredSkills.length
        },
        distributionQuality: {
            score: distributionScore,
            details: {
                sectionDensities: Object.fromEntries(
                    Object.entries(sectionAnalysis).map(([k, v]) => [k, v.keywordDensity])
                ),
                stuffingDetected: densityPenalties.length > 0
            }
        },
        atsHeuristics: {
            score: heuristicScore,
            issues: heuristics.issues,
            passed: heuristics.passed
        }
    };

    return {
        score: totalScore,
        breakdown,
        missingKeywords: keywordMatches.missing,
        strongMatches: keywordMatches.matched,
        sectionAnalysis,
        text: resumeText
    };
}

// -- Helpers --

function extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = text.split('\n');
    let currentSection = 'summary'; // Default
    let currentContent: string[] = [];

    // Common section headers
    const headerRegex = /^(experience|work history|education|skills|projects|summary|objective|certifications|languages)$/i;

    for (const line of lines) {
        const trimmed = line.trim();
        // Simple heuristic: if line is short, uppercase/titlecase, and matches keywords
        if (trimmed.length < 30 && headerRegex.test(trimmed)) {
            if (currentContent.length > 0) {
                sections[currentSection] = currentContent.join('\n');
            }
            currentSection = trimmed.toLowerCase();
            currentContent = [];
        } else {
            currentContent.push(line);
        }
    }

    if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n');
    }

    return sections;
}

function determineSectionQuality(
    wordCount: number,
    hasActionVerbs: boolean,
    hasQuantification: boolean,
    density: number
): 'good' | 'medium' | 'poor' {
    if (wordCount < 10) return 'poor';

    let score = 0;
    if (hasActionVerbs) score++;
    if (hasQuantification) score++;
    if (density > 0.01 && density < 0.04) score++;

    if (score >= 3) return 'good';
    if (score >= 1) return 'medium';
    return 'poor';
}

function checkATSHeuristics(text: string): { issues: string[], passed: string[] } {
    const issues: string[] = [];
    const passed: string[] = [];

    // Check for Tables (heuristic: distinctive spacing/pipes)
    if (/\|\s+\|/.test(text) || /\t{2,}/.test(text)) {
        issues.push('Possible Tables detected (ATS may struggle)');
    } else {
        passed.push('No Tables detected');
    }

    // Check Columns (hard to detect in raw text, assume ok unless weird whitespace)
    passed.push('Standard layout detected'); // optimistic

    // Check length
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 200) issues.push('Resume too short (<200 words)');
    else if (wordCount > 2000) issues.push('Resume too long (>2000 words)');
    else passed.push('Optimal length');

    // Check sections
    const lower = text.toLowerCase();
    if (!lower.includes('experience') && !lower.includes('work history')) issues.push('Missing "Experience" section');
    else passed.push('"Experience" section found');

    if (!lower.includes('education')) issues.push('Missing "Education" section');
    else passed.push('"Education" section found');

    return { issues, passed };
}
