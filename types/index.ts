export interface KeywordData {
    keyword: string;
    frequency: number;
    positions: number[];
}

export interface SectionAnalysis {
    name: string;
    startLine?: number;
    endLine?: number;
    wordCount: number;
    keywordDensity: number;
    hasActionVerbs: boolean;
    hasQuantification: boolean;
    foundKeywords: string[];
    suggestedKeywords: string[];
    quality: 'good' | 'medium' | 'poor';
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

export interface ResumeAnalysis {
    score: number;
    breakdown: ScoreBreakdown;
    missingKeywords: string[];
    strongMatches: string[];
    sectionAnalysis: Record<string, SectionAnalysis>;
    text?: string;
}
