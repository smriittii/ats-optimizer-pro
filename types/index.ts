export interface KeywordData {
    keyword: string;
    frequency: number;
    positions: number[];
}

export interface SectionAnalysis {
    name?: string;
    startLine?: number;
    endLine?: number;
    wordCount: number;
    keywordCount?: number;
    keywordDensity: number;
    hasActionVerbs: boolean;
    hasQuantification: boolean;
    foundKeywords: string[];
    suggestedKeywords: string[];
    quality: 'good' | 'medium' | 'poor' | 'unknown';
}

export interface ScoreBreakdown {
    keywordMatch: {
        score: number;
        matched: number;
        total: number;
    };
    semanticSimilarity: {
        score: number;
        similarity: number;
    };
    requiredSkills: {
        score: number;
        covered: string[];
        missing: string[];
        total: number;
    };
    distributionQuality: {
        score: number;
        details: {
            sectionDensities: Record<string, number>;
            stuffingDetected: boolean;
        };
    };
    atsHeuristics: {
        score: number;
        issues: string[];
        passed: string[];
    };
}

// ─── Claude AI Types ────────────────────────────────────────────────────────

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

// ─── Main Analysis ───────────────────────────────────────────────────────────

export interface ResumeAnalysis {
    score: number;
    breakdown: ScoreBreakdown;
    missingKeywords: string[];
    strongMatches: string[];
    sectionAnalysis: Record<string, SectionAnalysis>;
    text?: string;
    claudeAnalysis?: ClaudeAnalysis;
}

export interface Suggestion {
    id?: string;
    type: 'critical' | 'important' | 'nice-to-have' | 'keyword' | 'skills' | 'structure' | 'quantification' | 'formatting';
    priority: 'high' | 'medium' | 'low';
    section: string;
    original?: string;
    improved?: string;
    explanation?: string;
    recommendation: string;
    example?: string;
    keywordsToAdd?: string[];
}

export interface NGram {
    text: string;
    count: number;
    type: 'unigram' | 'bigram' | 'trigram';
    frequency?: number;
}

export interface KeywordMatch {
    keyword: string;
    found: boolean;
    importance: 'critical' | 'important' | 'nice-to-have';
    context?: string;
}

export interface AnalysisResult {
    score: number;
    keywords: KeywordMatch[];
    suggestions: Suggestion[];
    ngrams?: NGram[];
}