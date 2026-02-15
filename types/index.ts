// Core type definitions for ATS Optimizer Pro

export interface ResumeAnalysis {
    score: number;
    breakdown: ScoreBreakdown;
    missingKeywords: string[];
    strongMatches: string[];
    suggestions: Suggestion[];
    sectionAnalysis: SectionAnalysis;
}

export interface ScoreBreakdown {
    keywordMatch: {
        score: number;
        matched: number;
        total: number;
        matchedKeywords: string[];
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
            [section: string]: {
                density: number;
                keywordCount: number;
                isStuffed: boolean;
            };
        };
    };
    atsHeuristics: {
        score: number;
        issues: string[];
        passed: string[];
    };
}

export interface Suggestion {
    type: 'keyword' | 'structure' | 'quantification' | 'formatting' | 'skills';
    section: string;
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
    example?: string;
    keywordsToAdd?: string[];
}

export interface SectionAnalysis {
    [sectionName: string]: {
        wordCount: number;
        keywordCount: number;
        keywordDensity: number;
        hasActionVerbs: boolean;
        hasQuantification: boolean;
    };
}

export interface ParsedResume {
    text: string;
    sections: {
        [key: string]: string;
    };
}

export interface KeywordData {
    keyword: string;
    frequency: number;
    positions: number[];
}

export interface TFIDFVector {
    [term: string]: number;
}

export interface NGram {
    text: string;
    count: number;
    type: 'unigram' | 'bigram' | 'trigram';
}
